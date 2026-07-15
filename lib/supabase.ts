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

/**
 * A value counts as a real Supabase credential only if it is present AND not a
 * local-dev placeholder. When Supabase is NOT configured, the app transparently
 * falls back to the persistent in-memory store in `lib/localStore.ts` (wired via
 * `lib/db.ts`) so the whole storefront + admin work locally without a backend —
 * instead of hanging forever on fetches to a dead placeholder URL.
 */
function isReal(value: string | undefined): value is string {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v.length > 0 && !v.includes('placeholder') && v !== 'your-key-here';
}

export function isSupabaseConfigured(): boolean {
  if (!isReal(supabaseUrl) || !isReal(supabaseServiceKey)) return false;
  try {
    // A real project URL must parse and be a supabase.co (or custom) https host,
    // not the literal placeholder.
    const u = new URL(supabaseUrl as string);
    return u.protocol === 'https:' && !u.hostname.startsWith('placeholder');
  } catch {
    return false;
  }
}

const configured = isSupabaseConfigured();

// Browser client (RLS-protected, read-only catalog per RLS policies).
// `null` when Supabase is unconfigured — server code must go through lib/db.ts,
// which checks isSupabaseConfigured() before touching these clients.
export const supabase = configured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : (null as any);

// Server client (service role, bypasses RLS — use ONLY in API routes, never in
// a 'use client' component).
export const supabaseAdmin = configured
  ? createClient(supabaseUrl as string, supabaseServiceKey as string)
  : (null as any);

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
