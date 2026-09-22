import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

// ─────────────────────────────────────────────────────────────
// State Machine SQL Parser
// Extracts VALUES tuples from INSERT INTO ... VALUES (...).
// Handles: single-quoted strings, '' escaping, nested parens,
//          ARRAY[...], PostgreSQL ::type casts.
// ─────────────────────────────────────────────────────────────
function parseSqlTuples(sql: string): string[][] {
  const tuples: string[][] = [];

  const valuesIndex = sql.toUpperCase().indexOf('VALUES');
  if (valuesIndex === -1) return tuples;

  const valuesStr = sql.substring(valuesIndex + 6).trim();

  let i = 0;
  let inString = false;
  let parenDepth = 0;
  let arrayDepth = 0;
  let currentTuple: string[] = [];
  let currentValue = '';

  while (i < valuesStr.length) {
    const char = valuesStr[i];
    const nextChar = valuesStr[i + 1] || '';

    if (char === "'" && !inString) {
      inString = true;
      currentValue += char;
      i++;
      continue;
    }
    if (char === "'" && inString) {
      if (nextChar === "'") {
        currentValue += "''";
        i += 2;
        continue;
      } else {
        inString = false;
        currentValue += char;
        i++;
        continue;
      }
    }
    if (inString) {
      currentValue += char;
      i++;
      continue;
    }

    if (char === '(') {
      parenDepth++;
      if (parenDepth === 1 && currentTuple.length === 0 && currentValue.trim() === '') {
        i++;
        continue;
      }
    }

    if (char === ')') {
      parenDepth--;
      if (parenDepth === 0) {
        if (currentValue.trim() !== '') currentTuple.push(currentValue.trim());
        if (currentTuple.length > 0)    tuples.push([...currentTuple]);
        currentTuple = [];
        currentValue = '';
        while (i + 1 < valuesStr.length && [',', ' ', '\n', '\r', ';'].includes(valuesStr[i + 1])) i++;
        i++;
        continue;
      }
    }

    if (char === '[') arrayDepth++;
    if (char === ']') arrayDepth--;

    if (char === ',' && parenDepth === 1 && arrayDepth === 0) {
      currentTuple.push(currentValue.trim());
      currentValue = '';
      i++;
      continue;
    }

    currentValue += char;
    i++;
  }

  return tuples;
}

// ─────────────────────────────────────────────────────────────
// Scalar value parser
// ─────────────────────────────────────────────────────────────
function parseValue(val: string): any {
  if (val === undefined || val === null) return null;

  const trimmed = val.trim();
  const upper   = trimmed.toUpperCase();

  if (upper === 'NULL')  return null;
  if (upper === 'TRUE')  return true;
  if (upper === 'FALSE') return false;

  // quoted string
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.substring(1, trimmed.length - 1).replace(/''/g, "'");
  }

  // JSONB cast  e.g. '{"a":1}'::jsonb
  if (upper.includes('::JSONB') || upper.includes('::JSON')) {
    const jsonStr = trimmed.split('::')[0].trim();
    if (jsonStr.startsWith("'") && jsonStr.endsWith("'")) {
      return JSON.parse(jsonStr.substring(1, jsonStr.length - 1).replace(/''/g, "'"));
    }
    return JSON.parse(jsonStr);
  }

  // ARRAY['a','b']
  if (upper.startsWith('ARRAY[')) {
    const content = trimmed.substring(6, trimmed.length - 1);
    if (!content.trim()) return [];
    const arr: string[] = [];
    let inStr = false;
    let curr  = '';
    for (let k = 0; k < content.length; k++) {
      if (content[k] === "'" && (!inStr || content[k + 1] !== "'")) { inStr = !inStr; continue; }
      if (content[k] === "'" && inStr && content[k + 1] === "'")    { curr += "'"; k++; continue; }
      if (!inStr && content[k] === ',') { arr.push(curr); curr = ''; continue; }
      curr += content[k];
    }
    arr.push(curr);
    return arr.map((s) => s.trim());
  }

  // subquery  (SELECT id FROM … WHERE slug='x')
  if (trimmed.startsWith('(') && upper.includes('SELECT')) {
    return { isSubquery: true, raw: trimmed };
  }

  // PostgreSQL NOW() / interval expressions — tagged for parseDateValue
  if (upper.startsWith('NOW()')) {
    return { isPgDateExpr: true, raw: trimmed };
  }

  // numeric
  if (!isNaN(Number(trimmed))) return Number(trimmed);

  return trimmed;
}

// ─────────────────────────────────────────────────────────────
// parseDateValue
// Resolves a parsed SQL value to a JS Date.
//
// Source date formats found in seed files:
//   deals.starts_at  → now()
//   deals.ends_at    → now() + interval 'N days'
//   coupons.expires_at → now() + interval 'N days'
//
// All are PostgreSQL runtime expressions that must be evaluated
// in JavaScript at migration time (NOT as string literals).
// ─────────────────────────────────────────────────────────────
function parseDateValue(
  parsed: any,
  entity: string,
  field: string,
  record: string,
  nullable: boolean = false,
): Date | null {
  if (parsed === null || parsed === undefined) {
    if (nullable) return null;
    throw new Error(`[${entity}] Required date field "${field}" is NULL for record "${record}".`);
  }

  // PostgreSQL expression tagged by parseValue
  if (parsed && typeof parsed === 'object' && parsed.isPgDateExpr) {
    const raw: string = parsed.raw;
    const now = new Date();

    // now() + interval 'N unit'  or  now() - interval 'N unit'
    const m = raw.match(
      /now\(\)\s*([+-])\s*interval\s+'(\d+)\s+(day|days|hour|hours|minute|minutes|second|seconds|month|months|year|years)'/i,
    );
    if (m) {
      const sign   = m[1] === '+' ? 1 : -1;
      const amount = parseInt(m[2], 10);
      const unit   = m[3].toLowerCase();
      const ms =
        unit.startsWith('year')   ? amount * 365 * 24 * 3600 * 1000 :
        unit.startsWith('month')  ? amount * 30  * 24 * 3600 * 1000 :
        unit.startsWith('day')    ? amount * 24  * 3600 * 1000 :
        unit.startsWith('hour')   ? amount * 3600 * 1000 :
        unit.startsWith('minute') ? amount * 60   * 1000 :
                                    amount * 1000;
      return new Date(now.getTime() + sign * ms);
    }

    // bare now()
    if (/^now\(\)$/i.test(raw.trim())) return now;

    throw new Error(
      `[${entity}] Cannot parse PG date expression "${raw}" for field "${field}" in record "${record}".`,
    );
  }

  // quoted ISO string literal
  if (typeof parsed === 'string') {
    const d = new Date(parsed);
    if (isNaN(d.getTime())) {
      throw new Error(
        `[${entity}] Invalid date string "${parsed}" for field "${field}" in record "${record}".`,
      );
    }
    return d;
  }

  throw new Error(
    `[${entity}] Unexpected date value (${typeof parsed}: ${JSON.stringify(parsed)}) for field "${field}" in record "${record}".`,
  );
}

// ─────────────────────────────────────────────────────────────
// In-memory FK maps (populated during migration, used by products/deals)
// ─────────────────────────────────────────────────────────────
const categorySlugToId = new Map<string, string>();
const brandSlugToId    = new Map<string, string>();
const productSlugToId  = new Map<string, string>();

function resolveSubquery(parsed: any): string | null {
  if (!parsed || typeof parsed !== 'object' || !parsed.isSubquery) return parsed;
  const raw: string = parsed.raw;
  const match = raw.match(/slug\s*=\s*'([^']+)'/);
  if (!match) return null;
  const slug = match[1];
  if (raw.includes('categories')) return categorySlugToId.get(slug) ?? null;
  if (raw.includes('brands'))     return brandSlugToId.get(slug)     ?? null;
  if (raw.includes('products'))   return productSlugToId.get(slug)   ?? null;
  return null;
}

// ─────────────────────────────────────────────────────────────
// Entity migrators — each returns its error count
// ─────────────────────────────────────────────────────────────

async function migrateCategories(sql: string): Promise<number> {
  // columns: name, slug, description, icon_name, is_featured, sort_order
  const tuples = parseSqlTuples(sql);
  let inserted = 0, errors = 0;
  for (const tuple of tuples) {
    if (tuple.length !== 6) continue;
    try {
      const name        = parseValue(tuple[0]) as string;
      const slug        = parseValue(tuple[1]) as string;
      const description = parseValue(tuple[2]) as string | null;
      const icon_name   = parseValue(tuple[3]) as string | null;
      const is_featured = parseValue(tuple[4]) as boolean;
      const sort_order  = parseValue(tuple[5]) as number;

      if (isDryRun) { categorySlugToId.set(slug, 'dry-run'); inserted++; continue; }

      const cat = await prisma.category.upsert({
        where:  { slug },
        update: { name, description, icon_name, is_featured, sort_order },
        create: { name, slug, description, icon_name, is_featured, sort_order },
      });
      categorySlugToId.set(cat.slug, cat.id);
      inserted++;
    } catch (e: any) {
      console.error(`  [Category] Error slug="${tuple[1]}": ${e.message}`);
      errors++;
    }
  }
  console.log(`  Categories   → Inserted/Updated: ${inserted}, Skipped: 0, Errors: ${errors}`);
  return errors;
}

async function migrateBrands(sql: string): Promise<number> {
  // columns: name, slug, description, country
  const tuples = parseSqlTuples(sql);
  let inserted = 0, errors = 0;
  for (const tuple of tuples) {
    if (tuple.length !== 4) continue;
    try {
      const name        = parseValue(tuple[0]) as string;
      const slug        = parseValue(tuple[1]) as string;
      const description = parseValue(tuple[2]) as string | null;
      const country     = parseValue(tuple[3]) as string | null;

      if (isDryRun) { brandSlugToId.set(slug, 'dry-run'); inserted++; continue; }

      const b = await prisma.brand.upsert({
        where:  { slug },
        update: { name, description, country },
        create: { name, slug, description, country },
      });
      brandSlugToId.set(b.slug, b.id);
      inserted++;
    } catch (e: any) {
      console.error(`  [Brand] Error slug="${tuple[1]}": ${e.message}`);
      errors++;
    }
  }
  console.log(`  Brands       → Inserted/Updated: ${inserted}, Skipped: 0, Errors: ${errors}`);
  return errors;
}

async function migrateProducts(sql: string): Promise<number> {
  // columns: name, slug, description, short_description, category_id, brand_id,
  //          sku, price, compare_at_price, images, primary_image, specifications,
  //          features, whats_included, compatibility, tags, rating, review_count,
  //          stock, is_featured, is_bestseller, is_new_arrival, is_deal, weight
  const tuples = parseSqlTuples(sql);
  let inserted = 0, errors = 0;
  for (const tuple of tuples) {
    if (tuple.length !== 24) continue;
    const sku  = parseValue(tuple[6])  as string;
    const slug = parseValue(tuple[1])  as string;
    try {
      const data: any = {
        name:              parseValue(tuple[0]),
        slug,
        description:       parseValue(tuple[2]),
        short_description: parseValue(tuple[3]),
        category_id:       resolveSubquery(parseValue(tuple[4])),
        brand_id:          resolveSubquery(parseValue(tuple[5])),
        sku,
        price:             parseValue(tuple[7]),
        compare_at_price:  parseValue(tuple[8]),
        images:            parseValue(tuple[9]),
        primary_image:     parseValue(tuple[10]),
        specifications:    parseValue(tuple[11]),
        features:          parseValue(tuple[12]),
        whats_included:    parseValue(tuple[13]),
        compatibility:     parseValue(tuple[14]),
        tags:              parseValue(tuple[15]),
        rating:            parseValue(tuple[16]),
        review_count:      parseValue(tuple[17]),
        stock:             parseValue(tuple[18]),
        is_featured:       parseValue(tuple[19]),
        is_bestseller:     parseValue(tuple[20]),
        is_new_arrival:    parseValue(tuple[21]),
        is_deal:           parseValue(tuple[22]),
        weight:            parseValue(tuple[23]),
        is_published:      true,  // these were live products in Supabase
      };

      if (isDryRun) { productSlugToId.set(slug, 'dry-run'); inserted++; continue; }

      const p = await prisma.product.upsert({
        where:  { sku },
        update: data,
        create: data,
      });
      productSlugToId.set(p.slug, p.id);
      inserted++;
    } catch (e: any) {
      console.error(`  [Product] Error sku="${sku}" slug="${slug}": ${e.message}`);
      errors++;
    }
  }
  console.log(`  Products     → Inserted/Updated: ${inserted}, Skipped: 0, Errors: ${errors}`);
  return errors;
}

async function migrateBanners(sql: string): Promise<number> {
  // columns: title, subtitle, description, image_url, category_label,
  //          cta_text, cta_link, sort_order, is_active
  const tuples = parseSqlTuples(sql);
  let inserted = 0, errors = 0;
  for (const tuple of tuples) {
    if (tuple.length !== 9) continue;
    const title = parseValue(tuple[0]) as string;
    try {
      const data = {
        title,
        subtitle:       parseValue(tuple[1]),
        description:    parseValue(tuple[2]),
        image_url:      parseValue(tuple[3]),
        category_label: parseValue(tuple[4]),
        cta_text:       parseValue(tuple[5]),
        cta_link:       parseValue(tuple[6]),
        sort_order:     parseValue(tuple[7]),
        is_active:      parseValue(tuple[8]),
      };

      if (isDryRun) { inserted++; continue; }

      const existing = await prisma.banner.findFirst({ where: { title } });
      if (existing) {
        await prisma.banner.update({ where: { id: existing.id }, data });
      } else {
        await prisma.banner.create({ data });
      }
      inserted++;
    } catch (e: any) {
      console.error(`  [Banner] Error title="${title}": ${e.message}`);
      errors++;
    }
  }
  console.log(`  Banners      → Inserted/Updated: ${inserted}, Skipped: 0, Errors: ${errors}`);
  return errors;
}

async function migrateDeals(sql: string): Promise<number> {
  // columns: product_id, title, description, discount_percentage,
  //          sale_price, original_price, starts_at, ends_at, is_active
  //
  // Date format in source SQL (PostgreSQL runtime expressions):
  //   starts_at → now()
  //   ends_at   → now() + interval 'N days'
  const tuples = parseSqlTuples(sql);
  let inserted = 0, errors = 0;
  for (const tuple of tuples) {
    if (tuple.length !== 9) continue;
    const productSlugRaw = tuple[0];
    try {
      const product_id = resolveSubquery(parseValue(tuple[0]));
      if (!product_id && !isDryRun) {
        throw new Error(`Cannot resolve product subquery: ${productSlugRaw}`);
      }

      // parseDateValue handles now() and now() + interval expressions
      const starts_at = parseDateValue(parseValue(tuple[6]), 'Deal', 'starts_at', productSlugRaw, false);
      const ends_at   = parseDateValue(parseValue(tuple[7]), 'Deal', 'ends_at',   productSlugRaw, false);

      if (isDryRun) { inserted++; continue; }

      const data = {
        product_id:          product_id!,
        title:               parseValue(tuple[1]),
        description:         parseValue(tuple[2]),
        discount_percentage: parseValue(tuple[3]),
        sale_price:          parseValue(tuple[4]),
        original_price:      parseValue(tuple[5]),
        starts_at:           starts_at!,
        ends_at:             ends_at!,
        is_active:           parseValue(tuple[8]),
      };

      await prisma.deal.upsert({
        where:  { product_id: product_id! },
        update: data,
        create: data,
      });
      inserted++;
    } catch (e: any) {
      console.error(`  [Deal] Error product="${productSlugRaw}": ${e.message}`);
      errors++;
    }
  }
  console.log(`  Deals        → Inserted/Updated: ${inserted}, Skipped: 0, Errors: ${errors}`);
  return errors;
}

async function migrateCoupons(sql: string): Promise<number> {
  // columns: code, description, discount_type, discount_value,
  //          min_order_value, max_discount, usage_limit, used_count,
  //          is_active, expires_at
  //
  // Date format in source SQL:
  //   expires_at → now() + interval 'N days'   (nullable)
  const tuples = parseSqlTuples(sql);
  let inserted = 0, errors = 0;
  for (const tuple of tuples) {
    if (tuple.length !== 10) continue;
    const code = parseValue(tuple[0]) as string;
    try {
      const typeRaw       = parseValue(tuple[2]) as string;
      const discount_type = typeRaw.toUpperCase().includes('PERCENTAGE') ? 'PERCENTAGE' : 'FIXED';

      // expires_at is nullable in Prisma schema
      const expires_at = parseDateValue(parseValue(tuple[9]), 'Coupon', 'expires_at', code, true);

      if (isDryRun) { inserted++; continue; }

      const data = {
        code,
        description:     parseValue(tuple[1]),
        discount_type:   discount_type as any,
        discount_value:  parseValue(tuple[3]),
        min_order_value: parseValue(tuple[4]),
        max_discount:    parseValue(tuple[5]),
        usage_limit:     parseValue(tuple[6]),
        used_count:      parseValue(tuple[7]),
        is_active:       parseValue(tuple[8]),
        expires_at,
      };

      await prisma.coupon.upsert({
        where:  { code },
        update: data,
        create: data,
      });
      inserted++;
    } catch (e: any) {
      console.error(`  [Coupon] Error code="${code}": ${e.message}`);
      errors++;
    }
  }
  console.log(`  Coupons      → Inserted/Updated: ${inserted}, Skipped: 0, Errors: ${errors}`);
  return errors;
}

async function migratePromoCards(sql: string): Promise<number> {
  // columns: title, description, image_url, cta_text, cta_link,
  //          background_color, sort_order, is_active
  const tuples = parseSqlTuples(sql);
  let inserted = 0, errors = 0;
  for (const tuple of tuples) {
    if (tuple.length !== 8) continue;
    const title = parseValue(tuple[0]) as string;
    try {
      const data = {
        title,
        description:      parseValue(tuple[1]),
        image_url:        parseValue(tuple[2]),
        cta_text:         parseValue(tuple[3]),
        cta_link:         parseValue(tuple[4]),
        background_color: parseValue(tuple[5]),
        sort_order:       parseValue(tuple[6]),
        is_active:        parseValue(tuple[7]),
      };

      if (isDryRun) { inserted++; continue; }

      const existing = await prisma.promoCard.findFirst({ where: { title } });
      if (existing) {
        await prisma.promoCard.update({ where: { id: existing.id }, data });
      } else {
        await prisma.promoCard.create({ data });
      }
      inserted++;
    } catch (e: any) {
      console.error(`  [PromoCard] Error title="${title}": ${e.message}`);
      errors++;
    }
  }
  console.log(`  Promo Cards  → Inserted/Updated: ${inserted}, Skipped: 0, Errors: ${errors}`);
  return errors;
}

async function migrateProjects(sql: string): Promise<number> {
  // columns: title, slug, description, difficulty, estimated_cost,
  //          estimated_time, image_url, images, tutorial, tags, is_published
  const tuples = parseSqlTuples(sql);
  let inserted = 0, errors = 0;
  for (const tuple of tuples) {
    if (tuple.length !== 11) continue;
    const slug = parseValue(tuple[1]) as string;
    try {
      const data = {
        title:          parseValue(tuple[0]),
        slug,
        description:    parseValue(tuple[2]),
        difficulty:     parseValue(tuple[3]),
        estimated_cost: parseValue(tuple[4]),
        estimated_time: parseValue(tuple[5]),
        image_url:      parseValue(tuple[6]),
        images:         parseValue(tuple[7]),
        tutorial:       parseValue(tuple[8]),
        tags:           parseValue(tuple[9]),
        is_published:   parseValue(tuple[10]),
      };

      if (isDryRun) { inserted++; continue; }

      await prisma.project.upsert({
        where:  { slug },
        update: data,
        create: data,
      });
      inserted++;
    } catch (e: any) {
      console.error(`  [Project] Error slug="${slug}": ${e.message}`);
      errors++;
    }
  }
  console.log(`  Projects     → Inserted/Updated: ${inserted}, Skipped: 0, Errors: ${errors}`);
  return errors;
}

async function migrateTutorials(sql: string): Promise<number> {
  // columns: title, slug, description, category, content,
  //          image_url, difficulty, read_time, tags, is_published
  const tuples = parseSqlTuples(sql);
  let inserted = 0, errors = 0;
  for (const tuple of tuples) {
    if (tuple.length !== 10) continue;
    const slug = parseValue(tuple[1]) as string;
    try {
      const data = {
        title:        parseValue(tuple[0]),
        slug,
        description:  parseValue(tuple[2]),
        category:     parseValue(tuple[3]),
        content:      parseValue(tuple[4]),
        image_url:    parseValue(tuple[5]),
        difficulty:   parseValue(tuple[6]),
        read_time:    parseValue(tuple[7]),
        tags:         parseValue(tuple[8]),
        is_published: parseValue(tuple[9]),
      };

      if (isDryRun) { inserted++; continue; }

      await prisma.tutorial.upsert({
        where:  { slug },
        update: data,
        create: data,
      });
      inserted++;
    } catch (e: any) {
      console.error(`  [Tutorial] Error slug="${slug}": ${e.message}`);
      errors++;
    }
  }
  console.log(`  Tutorials    → Inserted/Updated: ${inserted}, Skipped: 0, Errors: ${errors}`);
  return errors;
}

// ─────────────────────────────────────────────────────────────
// File executor — routes INSERT blocks and aggregates errors
// ─────────────────────────────────────────────────────────────
async function executeSqlFile(filePath: string): Promise<number> {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[SKIP] File not found: ${path.basename(filePath)}`);
    return 0;
  }

  console.log(`\nProcessing: ${path.basename(filePath)}`);
  const sqlContent = fs.readFileSync(fullPath, 'utf8');

  const inserts = sqlContent.split(/INSERT INTO\s+/i);
  let fileErrors = 0;

  for (let i = 1; i < inserts.length; i++) {
    const block = inserts[i].trim();

    if (block.startsWith('categories ') || block.startsWith('"Category" ')) {
      fileErrors += await migrateCategories(block);
    } else if (block.startsWith('brands ') || block.startsWith('"Brand" ')) {
      fileErrors += await migrateBrands(block);
    } else if (block.startsWith('products ') || block.startsWith('"Product" ')) {
      fileErrors += await migrateProducts(block);
    } else if (block.startsWith('banners ') || block.startsWith('"Banner" ')) {
      fileErrors += await migrateBanners(block);
    } else if (block.startsWith('deals ') || block.startsWith('"Deal" ')) {
      fileErrors += await migrateDeals(block);
    } else if (block.startsWith('coupons ') || block.startsWith('"Coupon" ')) {
      fileErrors += await migrateCoupons(block);
    } else if (block.startsWith('promo_cards ') || block.startsWith('"PromoCard" ')) {
      fileErrors += await migratePromoCards(block);
    } else if (block.startsWith('projects ') || block.startsWith('"Project" ')) {
      fileErrors += await migrateProjects(block);
    } else if (block.startsWith('tutorials ') || block.startsWith('"Tutorial" ')) {
      fileErrors += await migrateTutorials(block);
    } else if (block.startsWith('project_components ')) {
      console.log('  [SKIP] project_components — not in current Prisma schema.');
    } else if (block.startsWith('public.profiles ')) {
      console.log('  [SKIP] public.profiles.');
    } else {
      console.log(`  [SKIP] Unhandled table: ${block.substring(0, 50).replace(/\n/g, ' ')}…`);
    }
  }

  return fileErrors;
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Qrobo Data Migration${isDryRun ? '  [DRY RUN — no DB writes]' : ''}`);
  console.log(`${'='.repeat(60)}`);

  const seedFiles = [
    '../../frontend/supabase/migrations/20260918060257_seed_categories_brands.sql',
    '../../frontend/supabase/migrations/20260918060338_seed_products_1.sql',
    '../../frontend/supabase/migrations/20260918060429_seed_products_2.sql',
    '../../frontend/supabase/migrations/20260918060540_seed_products_3.sql',
    '../../frontend/supabase/migrations/20260918061020_seed_banners_deals_coupons.sql',
    '../../frontend/supabase/migrations/20260918061100_seed_projects_tutorials.sql',
  ];

  let totalErrors = 0;
  for (const file of seedFiles) {
    try {
      totalErrors += await executeSqlFile(path.join(__dirname, file));
    } catch (e: any) {
      console.error(`[FATAL] Unhandled error in ${path.basename(file)}: ${e.message}`);
      totalErrors++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  if (totalErrors > 0) {
    console.error(`Migration completed with ${totalErrors} error(s).`);
    process.exit(1);
  } else {
    console.log(
      `Migration completed successfully.${isDryRun ? ' (dry run — nothing written)' : ''}`,
    );
  }
}

main()
  .catch((e) => {
    console.error('[FATAL]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
