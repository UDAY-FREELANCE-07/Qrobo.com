/*
# YantraX E-Commerce Core Schema

## Overview
Creates the complete database schema for the YantraX electronics e-commerce platform including categories, brands, products, reviews, orders, cart, wishlist, coupons, banners, deals, projects, tutorials, and addresses.

## Tables Created
1. **categories** - Product categories (robotics, dev boards, sensors, etc.)
2. **brands** - Product brands (Arduino, Raspberry Pi, ESP, etc.)
3. **products** - Full product catalog with flexible specs via JSONB
4. **reviews** - Product reviews with verified purchase tracking
5. **carts** - Shopping cart for authenticated users
6. **cart_items** - Items within a cart
7. **wishlists** - User wishlist
8. **addresses** - User shipping/billing addresses
9. **orders** - Order records with status tracking
10. **order_items** - Items within an order
11. **coupons** - Discount coupons with various types
12. **banners** - Homepage hero banners (CMS managed)
13. **promo_cards** - Homepage promotional cards
14. **deals** - Time-limited deals with countdown
15. **projects** - Student/DIY electronics projects
16. **project_components** - Components needed for a project
17. **tutorials** - Learning content/tutorials
18. **inventory_transactions** - Stock adjustment history

## Security
- RLS enabled on all tables
- Public read access for catalog data (categories, brands, products, reviews, banners, deals, projects, tutorials)
- Authenticated-only writes for cart, wishlist, addresses, orders, reviews
- Owner-scoped policies for user-specific data
*/

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  icon_name text DEFAULT 'Cpu',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_categories" ON categories;
CREATE POLICY "authenticated_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_categories" ON categories;
CREATE POLICY "authenticated_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_categories" ON categories;
CREATE POLICY "authenticated_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- ============ BRANDS ============
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  country text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_brands" ON brands;
CREATE POLICY "public_read_brands" ON brands FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_brands" ON brands;
CREATE POLICY "authenticated_insert_brands" ON brands FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_brands" ON brands;
CREATE POLICY "authenticated_update_brands" ON brands FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_brands" ON brands;
CREATE POLICY "authenticated_delete_brands" ON brands FOR DELETE TO authenticated USING (true);

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  sku text UNIQUE NOT NULL,
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  cost_price numeric(10,2),
  images text[] DEFAULT '{}',
  primary_image text,
  specifications jsonb DEFAULT '{}'::jsonb,
  features text[] DEFAULT '{}',
  whats_included text[] DEFAULT '{}',
  compatibility text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 0,
  review_count int DEFAULT 0,
  stock int DEFAULT 0,
  reserved_stock int DEFAULT 0,
  low_stock_threshold int DEFAULT 5,
  is_featured boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  is_new_arrival boolean DEFAULT false,
  is_deal boolean DEFAULT false,
  is_published boolean DEFAULT true,
  weight numeric(6,2),
  dimensions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_products" ON products;
CREATE POLICY "authenticated_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_products" ON products;
CREATE POLICY "authenticated_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_products" ON products;
CREATE POLICY "authenticated_delete_products" ON products FOR DELETE TO authenticated USING (true);

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  order_id uuid,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  images text[] DEFAULT '{}',
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "user_insert_review" ON reviews;
CREATE POLICY "user_insert_review" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_review" ON reviews;
CREATE POLICY "user_update_review" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_delete_review" ON reviews;
CREATE POLICY "user_delete_review" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ CARTS ============
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id);

DROP POLICY IF EXISTS "user_read_cart" ON carts;
CREATE POLICY "user_read_cart" ON carts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_cart" ON carts;
CREATE POLICY "user_insert_cart" ON carts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_cart" ON carts;
CREATE POLICY "user_update_cart" ON carts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_delete_cart" ON carts;
CREATE POLICY "user_delete_cart" ON carts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ CART ITEMS ============
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

DROP POLICY IF EXISTS "user_read_cart_items" ON cart_items;
CREATE POLICY "user_read_cart_items" ON cart_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

DROP POLICY IF EXISTS "user_insert_cart_items" ON cart_items;
CREATE POLICY "user_insert_cart_items" ON cart_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

DROP POLICY IF EXISTS "user_update_cart_items" ON cart_items;
CREATE POLICY "user_update_cart_items" ON cart_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

DROP POLICY IF EXISTS "user_delete_cart_items" ON cart_items;
CREATE POLICY "user_delete_cart_items" ON cart_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

-- ============ WISHLISTS ============
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

DROP POLICY IF EXISTS "user_read_wishlist" ON wishlists;
CREATE POLICY "user_read_wishlist" ON wishlists FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_wishlist" ON wishlists;
CREATE POLICY "user_insert_wishlist" ON wishlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_delete_wishlist" ON wishlists;
CREATE POLICY "user_delete_wishlist" ON wishlists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ ADDRESSES ============
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text DEFAULT 'Home',
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'India',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

DROP POLICY IF EXISTS "user_read_addresses" ON addresses;
CREATE POLICY "user_read_addresses" ON addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_addresses" ON addresses;
CREATE POLICY "user_insert_addresses" ON addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_addresses" ON addresses;
CREATE POLICY "user_update_addresses" ON addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_delete_addresses" ON addresses;
CREATE POLICY "user_delete_addresses" ON addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','partially_refunded')),
  payment_method text DEFAULT 'razorpay',
  payment_id text,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  shipping_cost numeric(10,2) DEFAULT 0,
  tax numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

DROP POLICY IF EXISTS "user_read_orders" ON orders;
CREATE POLICY "user_read_orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_orders" ON orders;
CREATE POLICY "user_insert_orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_orders" ON orders;
CREATE POLICY "user_update_orders" ON orders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE TO authenticated USING (true);

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  product_slug text,
  sku text,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

DROP POLICY IF EXISTS "user_read_order_items" ON order_items;
CREATE POLICY "user_read_order_items" ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "user_insert_order_items" ON order_items;
CREATE POLICY "user_insert_order_items" ON order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- ============ COUPONS ============
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value numeric(10,2) NOT NULL,
  min_order_value numeric(10,2) DEFAULT 0,
  max_discount numeric(10,2),
  usage_limit int,
  used_count int DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "authenticated_insert_coupons" ON coupons;
CREATE POLICY "authenticated_insert_coupons" ON coupons FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_coupons" ON coupons;
CREATE POLICY "authenticated_update_coupons" ON coupons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_coupons" ON coupons;
CREATE POLICY "authenticated_delete_coupons" ON coupons FOR DELETE TO authenticated USING (true);

-- ============ BANNERS ============
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text,
  image_url text,
  category_label text,
  cta_text text DEFAULT 'Shop Now',
  cta_link text DEFAULT '/shop',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_banners" ON banners;
CREATE POLICY "public_read_banners" ON banners FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_banners" ON banners;
CREATE POLICY "authenticated_insert_banners" ON banners FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_banners" ON banners;
CREATE POLICY "authenticated_update_banners" ON banners FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_banners" ON banners;
CREATE POLICY "authenticated_delete_banners" ON banners FOR DELETE TO authenticated USING (true);

-- ============ PROMO CARDS ============
CREATE TABLE IF NOT EXISTS promo_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  cta_text text DEFAULT 'Shop Now',
  cta_link text DEFAULT '/shop',
  background_color text DEFAULT 'bg-blue-50',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE promo_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_promo_cards" ON promo_cards;
CREATE POLICY "public_read_promo_cards" ON promo_cards FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_promo_cards" ON promo_cards;
CREATE POLICY "authenticated_insert_promo_cards" ON promo_cards FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_promo_cards" ON promo_cards;
CREATE POLICY "authenticated_update_promo_cards" ON promo_cards FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_promo_cards" ON promo_cards;
CREATE POLICY "authenticated_delete_promo_cards" ON promo_cards FOR DELETE TO authenticated USING (true);

-- ============ DEALS ============
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title text,
  description text,
  discount_percentage numeric(5,2),
  sale_price numeric(10,2) NOT NULL,
  original_price numeric(10,2) NOT NULL,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_deals_product ON deals(product_id);

DROP POLICY IF EXISTS "public_read_deals" ON deals;
CREATE POLICY "public_read_deals" ON deals FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_deals" ON deals;
CREATE POLICY "authenticated_insert_deals" ON deals FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_deals" ON deals;
CREATE POLICY "authenticated_update_deals" ON deals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_deals" ON deals;
CREATE POLICY "authenticated_delete_deals" ON deals FOR DELETE TO authenticated USING (true);

-- ============ PROJECTS ============
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimated_cost numeric(10,2),
  estimated_time text,
  image_url text,
  images text[] DEFAULT '{}',
  video_url text,
  tutorial text,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_projects" ON projects;
CREATE POLICY "authenticated_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_projects" ON projects;
CREATE POLICY "authenticated_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_projects" ON projects;
CREATE POLICY "authenticated_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

-- ============ PROJECT COMPONENTS ============
CREATE TABLE IF NOT EXISTS project_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE project_components ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_project_components_project ON project_components(project_id);

DROP POLICY IF EXISTS "public_read_project_components" ON project_components;
CREATE POLICY "public_read_project_components" ON project_components FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_project_components" ON project_components;
CREATE POLICY "authenticated_insert_project_components" ON project_components FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_project_components" ON project_components;
CREATE POLICY "authenticated_update_project_components" ON project_components FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_project_components" ON project_components;
CREATE POLICY "authenticated_delete_project_components" ON project_components FOR DELETE TO authenticated USING (true);

-- ============ TUTORIALS ============
CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text DEFAULT 'Electronics Basics',
  content text,
  image_url text,
  video_url text,
  difficulty text DEFAULT 'beginner',
  read_time int DEFAULT 5,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON tutorials(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);

DROP POLICY IF EXISTS "public_read_tutorials" ON tutorials;
CREATE POLICY "public_read_tutorials" ON tutorials FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_tutorials" ON tutorials;
CREATE POLICY "authenticated_insert_tutorials" ON tutorials FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_tutorials" ON tutorials;
CREATE POLICY "authenticated_update_tutorials" ON tutorials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_tutorials" ON tutorials;
CREATE POLICY "authenticated_delete_tutorials" ON tutorials FOR DELETE TO authenticated USING (true);

-- ============ INVENTORY TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL,
  type text NOT NULL CHECK (type IN ('restock','sale','adjustment','reservation','release')),
  reference_id uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_transactions(product_id);

DROP POLICY IF EXISTS "public_read_inventory" ON inventory_transactions;
CREATE POLICY "public_read_inventory" ON inventory_transactions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_inventory" ON inventory_transactions;
CREATE POLICY "authenticated_insert_inventory" ON inventory_transactions FOR INSERT TO authenticated WITH CHECK (true);

-- ============ PROFILES (user metadata) ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_profile" ON profiles;
CREATE POLICY "user_read_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_insert_profile" ON profiles;
CREATE POLICY "user_insert_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user_update_profile" ON profiles;
CREATE POLICY "user_update_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'customer'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
