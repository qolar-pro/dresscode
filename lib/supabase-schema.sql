-- DRESS CODE E-Commerce Supabase Schema
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- ==========================================
-- 1. PRODUCTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Unnamed Product',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'dresses',
  description TEXT NOT NULL DEFAULT '',
  images TEXT[] NOT NULL DEFAULT '{}',
  sizes JSONB NOT NULL DEFAULT '[]',
  colors JSONB NOT NULL DEFAULT '[]',
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

-- ==========================================
-- 2. ORDERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]',
  customer JSONB NOT NULL DEFAULT '{}',
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON (customer->>'email');

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read, only authenticated users can modify
-- For now, allow public read (needed for storefront)
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (true);

-- Products: Allow insert/update/delete for now (we'll lock this down later with auth)
-- In production, replace with proper auth-based policies
CREATE POLICY "Allow all product operations for now"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Orders: Anyone can create (checkout), only authenticated users can read
CREATE POLICY "Anyone can create orders (checkout)"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all order operations for now"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 4. SEED DEFAULT PRODUCTS (from data/products.ts)
-- ==========================================
INSERT INTO products (id, name, price, category, description, images, sizes, colors, is_new, is_featured, stock)
VALUES
  (1, 'Elegant Floral Summer Dress', 89.99, 'dresses', 
   'A beautiful floral print summer dress with a flattering A-line silhouette. Perfect for casual outings and special occasions.',
   ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80'],
   '[{"name":"XS","available":true},{"name":"S","available":true},{"name":"M","available":true},{"name":"L","available":false},{"name":"XL","available":true}]'::jsonb,
   '[{"name":"Pink Floral","hex":"#f9a8d4","available":true},{"name":"Blue Floral","hex":"#93c5fd","available":true}]'::jsonb,
   true, true, 100),

  (2, 'Classic Black Blazer', 129.99, 'outerwear',
   'Timeless black blazer tailored for a modern fit. Versatile piece for both office and evening wear.',
   ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
   '[{"name":"XS","available":true},{"name":"S","available":true},{"name":"M","available":true},{"name":"L","available":true},{"name":"XL","available":false}]'::jsonb,
   '[{"name":"Black","hex":"#171717","available":true}]'::jsonb,
   false, true, 100),

  (3, 'High-Waisted Wide Leg Trousers', 79.99, 'pants',
   'Chic high-waisted trousers with a flattering wide leg cut. Comfortable and stylish for any occasion.',
   ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80'],
   '[{"name":"XS","available":true},{"name":"S","available":true},{"name":"M","available":false},{"name":"L","available":true},{"name":"XL","available":true}]'::jsonb,
   '[{"name":"Beige","hex":"#d4d4d4","available":true},{"name":"Black","hex":"#171717","available":true}]'::jsonb,
   true, false, 100),

  (4, 'Silk Blouse - Ivory', 69.99, 'tops',
   'Luxurious silk blouse in elegant ivory. Features delicate buttons and a relaxed fit.',
   ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80'],
   '[{"name":"XS","available":true},{"name":"S","available":true},{"name":"M","available":true},{"name":"L","available":true},{"name":"XL","available":true}]'::jsonb,
   '[{"name":"Ivory","hex":"#fef3c7","available":true},{"name":"Blush","hex":"#fce7f3","available":true}]'::jsonb,
   false, true, 100),

  (5, 'Denim Jacket - Light Wash', 99.99, 'outerwear',
   'Classic denim jacket in a trendy light wash. Perfect layering piece for transitional weather.',
   ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
   '[{"name":"XS","available":false},{"name":"S","available":true},{"name":"M","available":true},{"name":"L","available":true},{"name":"XL","available":true}]'::jsonb,
   '[{"name":"Light Blue","hex":"#bfdbfe","available":true}]'::jsonb,
   true, false, 100),

  (6, 'Midi Pencil Skirt', 59.99, 'skirts',
   'Sophisticated midi pencil skirt with a side slit. Office-appropriate yet stylish.',
   ARRAY['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80'],
   '[{"name":"XS","available":true},{"name":"S","available":true},{"name":"M","available":true},{"name":"L","available":false},{"name":"XL","available":true}]'::jsonb,
   '[{"name":"Navy","hex":"#1e3a8a","available":true},{"name":"Black","hex":"#171717","available":true}]'::jsonb,
   false, false, 100),

  (7, 'Cashmere Sweater - Rose', 149.99, 'tops',
   'Ultra-soft cashmere sweater in a gorgeous rose hue. Luxury comfort for cooler days.',
   ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80'],
   '[{"name":"XS","available":true},{"name":"S","available":true},{"name":"M","available":true},{"name":"L","available":true},{"name":"XL","available":false}]'::jsonb,
   '[{"name":"Rose","hex":"#f9a8d4","available":true},{"name":"Cream","hex":"#fef3c7","available":true},{"name":"Grey","hex":"#a3a3a3","available":true}]'::jsonb,
   false, true, 100),

  (8, 'Satin Evening Gown', 199.99, 'dresses',
   'Stunning satin evening gown for special occasions. Elegant design with a flattering fit.',
   ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80'],
   '[{"name":"XS","available":true},{"name":"S","available":true},{"name":"M","available":true},{"name":"L","available":true},{"name":"XL","available":true}]'::jsonb,
   '[{"name":"Burgundy","hex":"#7f1d1d","available":true},{"name":"Emerald","hex":"#065f46","available":true},{"name":"Black","hex":"#171717","available":true}]'::jsonb,
   true, false, 100),

  (9, 'Crop Top - White', 39.99, 'tops',
   'Trendy crop top in crisp white cotton. Perfect for layering or wearing on its own.',
   ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80'],
   '[{"name":"XS","available":true},{"name":"S","available":true},{"name":"M","available":true},{"name":"L","available":true},{"name":"XL","available":true}]'::jsonb,
   '[{"name":"White","hex":"#ffffff","available":true},{"name":"Black","hex":"#171717","available":true}]'::jsonb,
   false, false, 100),

  (10, 'Linen Palazzo Pants', 89.99, 'pants',
   'Breezy linen palazzo pants for ultimate comfort and style. Flowing wide leg design.',
   ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80'],
   '[{"name":"XS","available":true},{"name":"S","available":false},{"name":"M","available":true},{"name":"L","available":true},{"name":"XL","available":true}]'::jsonb,
   '[{"name":"White","hex":"#ffffff","available":true},{"name":"Coral","hex":"#fca5a5","available":true}]'::jsonb,
   true, false, 100),

  (11, 'Leather Crossbody Bag', 119.99, 'accessories',
   'Genuine leather crossbody bag with adjustable strap. Compact yet spacious for essentials.',
   ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
   '[{"name":"One Size","available":true}]'::jsonb,
   '[{"name":"Tan","hex":"#92400e","available":true},{"name":"Black","hex":"#171717","available":true}]'::jsonb,
   false, true, 100),

  (12, 'Statement Gold Earrings', 49.99, 'accessories',
   'Bold gold-plated statement earrings. Lightweight and perfect for adding glamour to any outfit.',
   ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
   '[{"name":"One Size","available":true}]'::jsonb,
   '[{"name":"Gold","hex":"#fbbf24","available":true}]'::jsonb,
   true, false, 100)

ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 5. AUTOMATIC updated_at TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
