import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

/**
 * State Machine SQL Parser
 * Extracts the values tuples from an INSERT INTO ... VALUES (...) statement.
 * Properly handles strings (including escaped quotes), arrays, parentheses (nested selects), and types.
 */
function parseSqlTuples(sql: string): string[][] {
  const tuples: string[][] = [];
  
  // Find the 'VALUES' keyword
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

    // Handle string boundaries
    if (char === "'" && !inString) {
      inString = true;
      currentValue += char;
      i++;
      continue;
    }
    
    if (char === "'" && inString) {
      if (nextChar === "'") {
        // Escaped quote
        currentValue += "''";
        i += 2;
        continue;
      } else {
        // End of string
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

    // Not in string - track nesting
    if (char === '(') {
      parenDepth++;
      if (parenDepth === 1 && currentTuple.length === 0 && currentValue.trim() === '') {
        // Start of a new tuple, don't include the opening paren in the value
        i++;
        continue;
      }
    }
    
    if (char === ')') {
      parenDepth--;
      if (parenDepth === 0) {
        // End of tuple
        if (currentValue.trim() !== '') {
            currentTuple.push(currentValue.trim());
        }
        if (currentTuple.length > 0) {
            tuples.push([...currentTuple]);
        }
        currentTuple = [];
        currentValue = '';
        
        // Skip over any commas between tuples or semicolon at the end
        while (i + 1 < valuesStr.length && (valuesStr[i + 1] === ',' || valuesStr[i + 1] === ' ' || valuesStr[i + 1] === '\n' || valuesStr[i + 1] === '\r' || valuesStr[i + 1] === ';')) {
            i++;
        }
        i++;
        continue;
      }
    }

    if (char === '[') arrayDepth++;
    if (char === ']') arrayDepth--;

    if (char === ',' && parenDepth === 1 && arrayDepth === 0) {
      // End of a value within the tuple
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

/** Helper to parse a SQL value string into a JS primitive/object */
function parseValue(val: string): any {
  if (val === undefined || val === null) {
      console.warn("parseValue received undefined/null");
      return null;
  }
  if (val.toUpperCase() === 'NULL') return null;
  if (val.toUpperCase() === 'TRUE') return true;
  if (val.toUpperCase() === 'FALSE') return false;
  
  // String
  if (val.startsWith("'") && val.endsWith("'")) {
    // Remove surrounding quotes and unescape
    return val.substring(1, val.length - 1).replace(/''/g, "'");
  }
  
  // JSONB
  if (val.includes("::jsonb") || val.includes("::json")) {
    const jsonStr = val.split("::")[0].trim();
    if (jsonStr.startsWith("'") && jsonStr.endsWith("'")) {
      return JSON.parse(jsonStr.substring(1, jsonStr.length - 1).replace(/''/g, "'"));
    }
    return JSON.parse(jsonStr);
  }
  
  // Array
  if (val.toUpperCase().startsWith("ARRAY[")) {
    // ARRAY['a', 'b'] -> extract contents
    const content = val.substring(6, val.length - 1);
    if (!content.trim()) return [];
    
    // We'll do a simple split, but ideally we'd parse properly.
    // For our seed data, standard split by comma will work if strings don't contain commas.
    // Better: use the parser logic.
    const arr: string[] = [];
    let inStr = false;
    let curr = '';
    for (let i = 0; i < content.length; i++) {
        if (content[i] === "'" && (!inStr || content[i+1] !== "'")) {
            inStr = !inStr;
            continue;
        }
        if (content[i] === "'" && inStr && content[i+1] === "'") {
            curr += "'";
            i++;
            continue;
        }
        if (!inStr && content[i] === ',') {
            arr.push(curr);
            curr = '';
            continue;
        }
        curr += content[i];
    }
    arr.push(curr);
    return arr.map(s => s.trim());
  }
  
  // Subquery like (SELECT id FROM categories WHERE slug='arduino')
  if (val.startsWith("(") && val.toUpperCase().includes("SELECT")) {
    return { isSubquery: true, raw: val };
  }
  
  // Number
  if (!isNaN(Number(val))) {
    return Number(val);
  }
  
  return val;
}

// Memory mappings for foreign keys
const categorySlugToId = new Map<string, string>();
const brandSlugToId = new Map<string, string>();
const productSlugToId = new Map<string, string>();

async function migrateCategories(sql: string) {
    const tuples = parseSqlTuples(sql);
    let inserted = 0, skipped = 0, errors = 0;
    
    for (const tuple of tuples) {
        if (tuple.length !== 6) continue;
        try {
            // categories: name, slug, description, icon_name, is_featured, sort_order
            const name = parseValue(tuple[0]);
            const slug = parseValue(tuple[1]);
            const description = parseValue(tuple[2]);
            const icon_name = parseValue(tuple[3]);
            const is_featured = parseValue(tuple[4]);
            const sort_order = parseValue(tuple[5]);

            if (isDryRun) {
                inserted++;
                categorySlugToId.set(slug, 'dry-run-uuid');
                continue;
            }

            const cat = await prisma.category.upsert({
                where: { slug },
                update: { name, description, icon_name, is_featured, sort_order },
                create: { name, slug, description, icon_name, is_featured, sort_order }
            });
            categorySlugToId.set(cat.slug, cat.id);
            inserted++;
        } catch(e) {
            console.error(`Error mapping category: ${tuple[1]}`, e);
            errors++;
        }
    }
    console.log(`Categories -> Inserted/Updated: ${inserted}, Errors: ${errors}`);
}

async function migrateBrands(sql: string) {
    const tuples = parseSqlTuples(sql);
    let inserted = 0, errors = 0;
    for (const tuple of tuples) {
        if (tuple.length !== 4) continue;
        try {
            // brands: name, slug, description, country
            const name = parseValue(tuple[0]);
            const slug = parseValue(tuple[1]);
            const description = parseValue(tuple[2]);
            const country = parseValue(tuple[3]);

            if (isDryRun) {
                inserted++;
                brandSlugToId.set(slug, 'dry-run-uuid');
                continue;
            }

            const b = await prisma.brand.upsert({
                where: { slug },
                update: { name, description, country },
                create: { name, slug, description, country }
            });
            brandSlugToId.set(b.slug, b.id);
            inserted++;
        } catch(e) {
            console.error(`Error mapping brand: ${tuple[1]}`, e);
            errors++;
        }
    }
    console.log(`Brands -> Inserted/Updated: ${inserted}, Errors: ${errors}`);
}

function resolveSubquery(subqueryObj: any): string | null {
    if (!subqueryObj.isSubquery) return subqueryObj;
    const raw = subqueryObj.raw as string;
    const match = raw.match(/slug\s*=\s*'([^']+)'/);
    if (!match) return null;
    const slug = match[1];
    
    if (raw.includes('categories')) return categorySlugToId.get(slug) || null;
    if (raw.includes('brands')) return brandSlugToId.get(slug) || null;
    if (raw.includes('products')) return productSlugToId.get(slug) || null;
    
    return null;
}

async function migrateProducts(sql: string) {
    const tuples = parseSqlTuples(sql);
    let inserted = 0, errors = 0;
    
    for (const tuple of tuples) {
        if (tuple.length !== 24) continue;
        try {
            // products: name, slug, description, short_description, category_id, brand_id, sku, price, compare_at_price, images, primary_image, specifications, features, whats_included, compatibility, tags, rating, review_count, stock, is_featured, is_bestseller, is_new_arrival, is_deal, weight
            const sku = parseValue(tuple[6]);
            const slug = parseValue(tuple[1]);
            
            const data: any = {
                name: parseValue(tuple[0]),
                slug: slug,
                description: parseValue(tuple[2]),
                short_description: parseValue(tuple[3]),
                category_id: resolveSubquery(parseValue(tuple[4])),
                brand_id: resolveSubquery(parseValue(tuple[5])),
                sku: sku,
                price: parseValue(tuple[7]),
                compare_at_price: parseValue(tuple[8]),
                images: parseValue(tuple[9]),
                primary_image: parseValue(tuple[10]),
                specifications: parseValue(tuple[11]),
                features: parseValue(tuple[12]),
                whats_included: parseValue(tuple[13]),
                compatibility: parseValue(tuple[14]),
                tags: parseValue(tuple[15]),
                rating: parseValue(tuple[16]),
                review_count: parseValue(tuple[17]),
                stock: parseValue(tuple[18]),
                is_featured: parseValue(tuple[19]),
                is_bestseller: parseValue(tuple[20]),
                is_new_arrival: parseValue(tuple[21]),
                is_deal: parseValue(tuple[22]),
                weight: parseValue(tuple[23]),
                is_published: true // Seed products are meant to be published
            };

            if (isDryRun) {
                inserted++;
                productSlugToId.set(slug, 'dry-run-uuid');
                continue;
            }

            const p = await prisma.product.upsert({
                where: { sku },
                update: data,
                create: data
            });
            productSlugToId.set(p.slug, p.id);
            inserted++;
        } catch(e) {
            console.error(`Error mapping product: ${tuple[6]}`, e);
            errors++;
        }
    }
    console.log(`Products -> Inserted/Updated: ${inserted}, Errors: ${errors}`);
}

async function migrateBanners(sql: string) {
    const tuples = parseSqlTuples(sql);
    let inserted = 0, errors = 0;
    
    // Banners don't have a unique key easily, but we can avoid duplicates by clearing existing ones or just checking title if we assume title is unique. 
    // To be strictly idempotent without deleting, we can check by title.
    
    for (const tuple of tuples) {
        if (tuple.length !== 9) continue;
        try {
            // banners: title, subtitle, description, image_url, category_label, cta_text, cta_link, sort_order, is_active
            const title = parseValue(tuple[0]);
            const data = {
                title: title,
                subtitle: parseValue(tuple[1]),
                description: parseValue(tuple[2]),
                image_url: parseValue(tuple[3]),
                category_label: parseValue(tuple[4]),
                cta_text: parseValue(tuple[5]),
                cta_link: parseValue(tuple[6]),
                sort_order: parseValue(tuple[7]),
                is_active: parseValue(tuple[8])
            };

            if (isDryRun) {
                inserted++;
                continue;
            }

            const existing = await prisma.banner.findFirst({ where: { title } });
            if (existing) {
                await prisma.banner.update({ where: { id: existing.id }, data });
            } else {
                await prisma.banner.create({ data });
            }
            inserted++;
        } catch(e) {
            console.error(`Error mapping banner`, e);
            errors++;
        }
    }
    console.log(`Banners -> Inserted/Updated: ${inserted}, Errors: ${errors}`);
}

async function migrateDeals(sql: string) {
    const tuples = parseSqlTuples(sql);
    let inserted = 0, errors = 0;
    
    for (const tuple of tuples) {
        if (tuple.length !== 9) continue;
        try {
            // deals: product_id, title, description, discount_percentage, sale_price, original_price, starts_at, ends_at, is_active
            const productIdSubquery = parseValue(tuple[0]);
            const product_id = resolveSubquery(productIdSubquery);
            
            if (!product_id && !isDryRun) {
                console.error(`Cannot find product for deal: ${productIdSubquery?.raw}`);
                errors++;
                continue;
            }

            const data = {
                product_id: product_id || 'dry-run-uuid',
                title: parseValue(tuple[1]),
                description: parseValue(tuple[2]),
                discount_percentage: parseValue(tuple[3]),
                sale_price: parseValue(tuple[4]),
                original_price: parseValue(tuple[5]),
                starts_at: new Date(parseValue(tuple[6])),
                ends_at: new Date(parseValue(tuple[7])),
                is_active: parseValue(tuple[8])
            };

            if (isDryRun) {
                inserted++;
                continue;
            }

            await prisma.deal.upsert({
                where: { product_id },
                update: data,
                create: data
            });
            inserted++;
        } catch(e) {
            console.error(`Error mapping deal`, e);
            errors++;
        }
    }
    console.log(`Deals -> Inserted/Updated: ${inserted}, Errors: ${errors}`);
}

async function migrateCoupons(sql: string) {
    const tuples = parseSqlTuples(sql);
    let inserted = 0, errors = 0;
    
    for (const tuple of tuples) {
        if (tuple.length !== 10) continue;
        try {
            // coupons: code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, is_active, expires_at
            const code = parseValue(tuple[0]);
            const typeStr = parseValue(tuple[2]);
            const discount_type = typeStr.includes('PERCENTAGE') ? 'PERCENTAGE' : 'FIXED';
            const expires_at_raw = parseValue(tuple[9]);
            
            const data = {
                code,
                description: parseValue(tuple[1]),
                discount_type: discount_type as any,
                discount_value: parseValue(tuple[3]),
                min_order_value: parseValue(tuple[4]),
                max_discount: parseValue(tuple[5]),
                usage_limit: parseValue(tuple[6]),
                used_count: parseValue(tuple[7]),
                is_active: parseValue(tuple[8]),
                expires_at: expires_at_raw ? new Date(expires_at_raw) : null
            };

            if (isDryRun) {
                inserted++;
                continue;
            }

            await prisma.coupon.upsert({
                where: { code },
                update: data,
                create: data
            });
            inserted++;
        } catch(e) {
            console.error(`Error mapping coupon`, e);
            errors++;
        }
    }
    console.log(`Coupons -> Inserted/Updated: ${inserted}, Errors: ${errors}`);
}

async function migratePromoCards(sql: string) {
    const tuples = parseSqlTuples(sql);
    let inserted = 0, errors = 0;
    
    for (const tuple of tuples) {
        if (tuple.length !== 8) continue;
        try {
            // promo_cards: title, description, image_url, cta_text, cta_link, background_color, sort_order, is_active
            const title = parseValue(tuple[0]);
            const data = {
                title,
                description: parseValue(tuple[1]),
                image_url: parseValue(tuple[2]),
                cta_text: parseValue(tuple[3]),
                cta_link: parseValue(tuple[4]),
                background_color: parseValue(tuple[5]),
                sort_order: parseValue(tuple[6]),
                is_active: parseValue(tuple[7])
            };

            if (isDryRun) {
                inserted++;
                continue;
            }

            const existing = await prisma.promoCard.findFirst({ where: { title } });
            if (existing) {
                await prisma.promoCard.update({ where: { id: existing.id }, data });
            } else {
                await prisma.promoCard.create({ data });
            }
            inserted++;
        } catch(e) {
            console.error(`Error mapping promo card`, e);
            errors++;
        }
    }
    console.log(`Promo Cards -> Inserted/Updated: ${inserted}, Errors: ${errors}`);
}

async function migrateProjects(sql: string) {
    const tuples = parseSqlTuples(sql);
    let inserted = 0, errors = 0;
    
    for (const tuple of tuples) {
        if (tuple.length !== 11) continue;
        try {
            // projects: title, slug, description, difficulty, estimated_cost, estimated_time, image_url, images, tutorial, tags, is_published
            const slug = parseValue(tuple[1]);
            const data = {
                title: parseValue(tuple[0]),
                slug: slug,
                description: parseValue(tuple[2]),
                difficulty: parseValue(tuple[3]),
                estimated_cost: parseValue(tuple[4]),
                estimated_time: parseValue(tuple[5]),
                image_url: parseValue(tuple[6]),
                images: parseValue(tuple[7]),
                tutorial: parseValue(tuple[8]),
                tags: parseValue(tuple[9]),
                is_published: parseValue(tuple[10])
            };

            if (isDryRun) {
                inserted++;
                continue;
            }

            await prisma.project.upsert({
                where: { slug },
                update: data,
                create: data
            });
            inserted++;
        } catch(e) {
            console.error(`Error mapping project`, e);
            errors++;
        }
    }
    console.log(`Projects -> Inserted/Updated: ${inserted}, Errors: ${errors}`);
}

async function migrateTutorials(sql: string) {
    const tuples = parseSqlTuples(sql);
    let inserted = 0, errors = 0;
    
    for (const tuple of tuples) {
        if (tuple.length !== 10) continue;
        try {
            // tutorials: title, slug, description, category, content, image_url, difficulty, read_time, tags, is_published
            const slug = parseValue(tuple[1]);
            const data = {
                title: parseValue(tuple[0]),
                slug: slug,
                description: parseValue(tuple[2]),
                category: parseValue(tuple[3]),
                content: parseValue(tuple[4]),
                image_url: parseValue(tuple[5]),
                difficulty: parseValue(tuple[6]),
                read_time: parseValue(tuple[7]),
                tags: parseValue(tuple[8]),
                is_published: parseValue(tuple[9])
            };

            if (isDryRun) {
                inserted++;
                continue;
            }

            await prisma.tutorial.upsert({
                where: { slug },
                update: data,
                create: data
            });
            inserted++;
        } catch(e) {
            console.error(`Error mapping tutorial`, e);
            errors++;
        }
    }
    console.log(`Tutorials -> Inserted/Updated: ${inserted}, Errors: ${errors}`);
}

async function executeSqlFile(filePath: string) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`[SKIP] File not found: ${filePath}`);
      return 0;
    }
    
    const sqlContent = fs.readFileSync(fullPath, 'utf8');
    // Split by INSERT INTO to process each table block independently
    const inserts = sqlContent.split(/INSERT INTO\s+/i);
    let totalErrors = 0;

    for (let i = 1; i < inserts.length; i++) {
        const block = inserts[i].trim();
        
        if (block.startsWith('categories ') || block.startsWith('"Category" ')) {
            await migrateCategories(block);
        } else if (block.startsWith('brands ') || block.startsWith('"Brand" ')) {
            await migrateBrands(block);
        } else if (block.startsWith('products ') || block.startsWith('"Product" ')) {
            await migrateProducts(block);
        } else if (block.startsWith('banners ') || block.startsWith('"Banner" ')) {
            await migrateBanners(block);
        } else if (block.startsWith('deals ') || block.startsWith('"Deal" ')) {
            await migrateDeals(block);
        } else if (block.startsWith('coupons ') || block.startsWith('"Coupon" ')) {
            await migrateCoupons(block);
        } else if (block.startsWith('promo_cards ') || block.startsWith('"PromoCard" ')) {
            await migratePromoCards(block);
        } else if (block.startsWith('projects ') || block.startsWith('"Project" ')) {
            await migrateProjects(block);
        } else if (block.startsWith('tutorials ') || block.startsWith('"Tutorial" ')) {
            await migrateTutorials(block);
        } else if (block.startsWith('project_components ')) {
            console.log(`[SKIP] Skipping project_components as it is not in the Prisma schema.`);
        } else if (block.startsWith('public.profiles ')) {
            console.log(`[SKIP] Skipping public.profiles.`);
        } else {
            console.log(`[SKIP] Unhandled table insert: ${block.substring(0, 20)}...`);
        }
    }
    return totalErrors;
  } catch (error) {
    console.error(`[FATAL ERROR] Parsing failed for ${path.basename(filePath)}:`, error);
    return 1;
  }
}

async function main() {
  console.log(`Starting data migration...${isDryRun ? ' [DRY RUN]' : ''}`);
  
  const seedFiles = [
    '../../frontend/supabase/migrations/20260918060257_seed_categories_brands.sql',
    '../../frontend/supabase/migrations/20260918060338_seed_products_1.sql',
    '../../frontend/supabase/migrations/20260918060429_seed_products_2.sql',
    '../../frontend/supabase/migrations/20260918060540_seed_products_3.sql',
    '../../frontend/supabase/migrations/20260918061020_seed_banners_deals_coupons.sql',
    '../../frontend/supabase/migrations/20260918061100_seed_projects_tutorials.sql',
  ];

  let errors = 0;
  for (const file of seedFiles) {
    errors += await executeSqlFile(path.join(__dirname, file));
  }
  
  if (errors > 0) {
      console.error(`\nMigration completed with ${errors} errors.`);
      process.exit(1);
  } else {
      console.log(`\nMigration completed successfully.`);
  }
}

main()
  .catch((e) => {
      console.error(e);
      process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
