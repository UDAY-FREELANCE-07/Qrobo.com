import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function executeSqlFile(filePath: string) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`[SKIP] File not found: ${filePath}`);
      return;
    }
    console.log(`\n[EXEC] Executing ${path.basename(filePath)}...`);
    let sql = fs.readFileSync(fullPath, 'utf8');

    // Remove INSERT INTO project_components because it does not exist in Prisma schema
    sql = sql.replace(/INSERT INTO project_components[\s\S]*?(?=INSERT INTO|ON CONFLICT|$)/g, '');

    // Transform table names from Supabase to Prisma model names
    sql = sql.replace(/INSERT INTO categories/g, 'INSERT INTO "Category"');
    sql = sql.replace(/FROM categories/g, 'FROM "Category"');
    
    sql = sql.replace(/INSERT INTO brands/g, 'INSERT INTO "Brand"');
    sql = sql.replace(/FROM brands/g, 'FROM "Brand"');
    
    sql = sql.replace(/INSERT INTO products/g, 'INSERT INTO "Product"');
    sql = sql.replace(/FROM products/g, 'FROM "Product"');
    
    sql = sql.replace(/INSERT INTO banners/g, 'INSERT INTO "Banner"');
    sql = sql.replace(/INSERT INTO promo_cards/g, 'INSERT INTO "PromoCard"');
    sql = sql.replace(/INSERT INTO deals/g, 'INSERT INTO "Deal"');
    sql = sql.replace(/INSERT INTO coupons/g, 'INSERT INTO "Coupon"');
    sql = sql.replace(/INSERT INTO projects/g, 'INSERT INTO "Project"');
    sql = sql.replace(/INSERT INTO tutorials/g, 'INSERT INTO "Tutorial"');

    // Remove any references to auth.users if they somehow slipped in
    sql = sql.replace(/auth\.users/g, 'public."User"');

    if (sql.trim().length === 0) {
        return;
    }

    await prisma.$executeRawUnsafe(sql);
    console.log(`[DONE] ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`[ERROR] Failed to execute ${path.basename(filePath)}:`, error);
  }
}

async function main() {
  console.log('Starting data migration...');
  
  const seedFiles = [
    '../frontend/supabase/migrations/20260918060257_seed_categories_brands.sql',
    '../frontend/supabase/migrations/20260918060338_seed_products_1.sql',
    '../frontend/supabase/migrations/20260918060429_seed_products_2.sql',
    '../frontend/supabase/migrations/20260918060540_seed_products_3.sql',
    '../frontend/supabase/migrations/20260918061020_seed_banners_deals_coupons.sql',
    '../frontend/supabase/migrations/20260918061100_seed_projects_tutorials.sql',
  ];

  for (const file of seedFiles) {
    await executeSqlFile(path.join(__dirname, file));
  }

  // Count check
  const cats = await prisma.category.count();
  const brands = await prisma.brand.count();
  const prods = await prisma.product.count();
  const projects = await prisma.project.count();
  const tutorials = await prisma.tutorial.count();
  const banners = await prisma.banner.count();
  const deals = await prisma.deal.count();
  const coupons = await prisma.coupon.count();
  const promoCards = await prisma.promoCard.count();
  
  console.log('\n--- Migration Summary ---');
  console.log(`Categories: ${cats}`);
  console.log(`Brands: ${brands}`);
  console.log(`Products: ${prods}`);
  console.log(`Projects: ${projects}`);
  console.log(`Tutorials: ${tutorials}`);
  console.log(`Banners: ${banners}`);
  console.log(`Deals: ${deals}`);
  console.log(`Coupons: ${coupons}`);
  console.log(`Promo Cards: ${promoCards}`);
  console.log('\nData migration complete.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
