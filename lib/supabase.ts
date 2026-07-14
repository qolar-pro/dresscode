/**
 * Supabase client for browser and server-side usage
 * 
 * For browser: uses anon key (safe, RLS-protected)
 * For server: uses service role key (admin access, bypass RLS)
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail loudly with a clear message instead of passing `undefined` into
// createClient (which yields cryptic runtime errors deep in a request).
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (.env.local).'
  );
}
if (!supabaseServiceKey) {
  throw new Error(
    'Supabase not configured: set SUPABASE_SERVICE_ROLE_KEY in your environment (.env.local). This key is server-only.'
  );
}

// Browser client (RLS-protected, read-only catalog per RLS policies)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client (service role, bypasses RLS — use ONLY in API routes, never in
// a 'use client' component).
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Database types matching Supabase schema
 */
export interface DbProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: { name: string; available: boolean }[];
  colors: { name: string; hex: string; available: boolean }[];
  is_new: boolean;
  is_featured: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  items: any[];
  customer: any;
  total: number;
  subtotal: number;
  shipping: number;
  payment_fee: number;
  payment_method: string;
  payment_status: string;
  date: string;
  created_at: string;
}

/**
 * Helper: Convert DB product to frontend Product interface
 */
export function dbProductToFrontend(db: DbProduct) {
  return {
    id: db.id,
    name: db.name,
    price: db.price,
    category: db.category,
    description: db.description,
    images: db.images,
    sizes: db.sizes,
    colors: db.colors,
    isNew: db.is_new,
    isFeatured: db.is_featured,
  };
}

/**
 * Helper: Convert frontend product to DB product format
 */
export function frontendProductToDb(product: any) {
  return {
    id: product.id || Date.now(),
    name: product.name,
    price: product.price,
    category: product.category,
    description: product.description,
    images: product.images,
    sizes: product.sizes,
    colors: product.colors,
    is_new: product.isNew ?? false,
    is_featured: product.isFeatured ?? false,
    stock: product.stock ?? 100,
  };
}

/**
 * Helper: Convert DB order to frontend Order interface
 */
export function dbOrderToFrontend(db: DbOrder) {
  return {
    id: db.id,
    items: db.items,
    customer: db.customer,
    total: db.total,
    date: db.date,
    paymentMethod: db.payment_method,
    paymentStatus: db.payment_status,
    subtotal: db.subtotal,
    shipping: db.shipping,
    paymentFee: db.payment_fee,
  };
}
