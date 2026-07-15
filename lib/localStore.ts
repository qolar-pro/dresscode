/**
 * Local, dependency-free data store used when Supabase is NOT configured
 * (e.g. local development with placeholder env values). It mirrors the shape
 * of the Supabase tables so `lib/db.ts` can transparently swap between the two.
 *
 * Data is seeded from `data/products.ts` and persisted to `.data/local-db.json`
 * so admin edits (products, orders, collections) survive dev-server restarts.
 *
 * This is intentionally simple and single-process. In production Supabase is
 * configured, so this module is never the active backend.
 */
import fs from 'fs';
import path from 'path';
import { products as seedProducts } from '@/data/products';

export interface DbProductRow {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: { name: string; available: boolean; stock?: number }[];
  colors: { name: string; hex: string; available: boolean }[];
  is_new: boolean;
  is_featured: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface DbOrderRow {
  id: string;
  items: any[];
  customer: any;
  total: number;
  subtotal: number;
  shipping: number;
  payment_fee: number;
  payment_method: string;
  payment_status: string;
  status: string;
  date: string;
  created_at: string;
}

export interface DbCollectionRow {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  image_url: string;
  product_ids: number[];
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface StoreShape {
  products: DbProductRow[];
  orders: DbOrderRow[];
  collections: DbCollectionRow[];
  newsletter: { email: string; subscribed_at: string }[];
  contacts: { id: string; email: string; name: string; message: string; date: string }[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'local-db.json');

// Seed products.ts (frontend shape) → DB row shape. Give each a deterministic
// created_at (newer id = newer) so "newest first" ordering is stable.
function seed(): StoreShape {
  const base = Date.parse('2026-01-01T00:00:00.000Z');
  const products: DbProductRow[] = seedProducts.map((p) => {
    const created = new Date(base + p.id * 60_000).toISOString();
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      description: p.description,
      images: p.images ?? [],
      sizes: (p.sizes as any) ?? [],
      colors: (p.colors as any) ?? [],
      is_new: !!p.isNew,
      is_featured: !!p.isFeatured,
      stock: (p as any).stock ?? 0,
      created_at: created,
      updated_at: created,
    };
  });
  return { products, orders: [], collections: [], newsletter: [], contacts: [] };
}

// Persist across HMR reloads in dev by stashing the store on globalThis.
const g = globalThis as any;

function load(): StoreShape {
  if (g.__sneakerAirStore) return g.__sneakerAirStore as StoreShape;

  let store: StoreShape | null = null;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<StoreShape>;
      // Basic shape guard — if the products array is missing/empty, reseed.
      if (parsed && Array.isArray(parsed.products) && parsed.products.length) {
        store = {
          products: parsed.products as DbProductRow[],
          orders: (parsed.orders as DbOrderRow[]) ?? [],
          collections: (parsed.collections as DbCollectionRow[]) ?? [],
          newsletter: (parsed.newsletter as any[]) ?? [],
          contacts: (parsed.contacts as any[]) ?? [],
        };
      }
    }
  } catch {
    store = null; // corrupt file → reseed
  }

  if (!store) {
    store = seed();
    persist(store);
  }

  g.__sneakerAirStore = store;
  return store;
}

function persist(store: StoreShape) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch {
    // Best-effort: in read-only environments we keep the in-memory copy.
  }
}

function save() {
  if (g.__sneakerAirStore) persist(g.__sneakerAirStore as StoreShape);
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

// ------------------------------- products --------------------------------
export const localProducts = {
  list(): DbProductRow[] {
    const s = load();
    return clone(
      [...s.products].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    );
  },
  get(id: number): DbProductRow | null {
    const s = load();
    const found = s.products.find((p) => Number(p.id) === Number(id));
    return found ? clone(found) : null;
  },
  create(row: Partial<DbProductRow>): DbProductRow {
    const s = load();
    const now = new Date().toISOString();
    const id = Number(row.id) || Math.max(0, ...s.products.map((p) => p.id)) + 1;
    const product: DbProductRow = {
      id,
      name: row.name ?? 'Untitled',
      price: Number(row.price) || 0,
      category: row.category ?? 'lifestyle',
      description: row.description ?? '',
      images: row.images ?? [],
      sizes: row.sizes ?? [],
      colors: row.colors ?? [],
      is_new: row.is_new ?? false,
      is_featured: row.is_featured ?? false,
      stock: row.stock ?? 0,
      created_at: now,
      updated_at: now,
    };
    s.products.unshift(product);
    save();
    return clone(product);
  },
  update(id: number, updates: Partial<DbProductRow>): DbProductRow | null {
    const s = load();
    const idx = s.products.findIndex((p) => Number(p.id) === Number(id));
    if (idx < 0) return null;
    s.products[idx] = {
      ...s.products[idx],
      ...updates,
      id: s.products[idx].id,
      created_at: s.products[idx].created_at,
      updated_at: new Date().toISOString(),
    };
    save();
    return clone(s.products[idx]);
  },
  remove(id: number): boolean {
    const s = load();
    const before = s.products.length;
    s.products = s.products.filter((p) => Number(p.id) !== Number(id));
    save();
    return s.products.length < before;
  },
  decrementSize(id: number, sizeName: string, qty: number) {
    const s = load();
    const p = s.products.find((x) => Number(x.id) === Number(id));
    if (!p) return;
    p.sizes = (p.sizes || []).map((sz) =>
      sz.name === sizeName
        ? { ...sz, stock: Math.max(0, (sz.stock ?? 0) - qty) }
        : sz
    );
    p.updated_at = new Date().toISOString();
    save();
  },
};

// -------------------------------- orders ---------------------------------
export const localOrders = {
  list(): DbOrderRow[] {
    const s = load();
    return clone([...s.orders].sort((a, b) => (a.date < b.date ? 1 : -1)));
  },
  get(id: string): DbOrderRow | null {
    const s = load();
    const found = s.orders.find((o) => o.id === id);
    return found ? clone(found) : null;
  },
  create(row: DbOrderRow): DbOrderRow {
    const s = load();
    s.orders.unshift(row);
    save();
    return clone(row);
  },
  updateStatus(id: string, status: string): DbOrderRow | null {
    const s = load();
    const o = s.orders.find((x) => x.id === id);
    if (!o) return null;
    o.status = status;
    save();
    return clone(o);
  },
  remove(id: string): boolean {
    const s = load();
    const before = s.orders.length;
    s.orders = s.orders.filter((o) => o.id !== id);
    save();
    return s.orders.length < before;
  },
};

// ----------------------------- collections -------------------------------
export const localCollections = {
  list(activeOnly: boolean): DbCollectionRow[] {
    const s = load();
    let rows = [...s.collections];
    if (activeOnly) rows = rows.filter((c) => c.is_active);
    return clone(rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)));
  },
  create(row: Omit<DbCollectionRow, 'id' | 'created_at'>): DbCollectionRow {
    const s = load();
    const collection: DbCollectionRow = {
      ...row,
      id: 'col_' + Math.random().toString(36).slice(2, 10),
      created_at: new Date().toISOString(),
    };
    s.collections.unshift(collection);
    save();
    return clone(collection);
  },
  update(id: string, updates: Partial<DbCollectionRow>): DbCollectionRow | null {
    const s = load();
    const c = s.collections.find((x) => x.id === id);
    if (!c) return null;
    Object.assign(c, updates, { id: c.id, created_at: c.created_at });
    save();
    return clone(c);
  },
  remove(id: string): boolean {
    const s = load();
    const before = s.collections.length;
    s.collections = s.collections.filter((c) => c.id !== id);
    save();
    return s.collections.length < before;
  },
};

// ------------------------------ newsletter -------------------------------
export const localNewsletter = {
  add(email: string): { duplicate: boolean } {
    const s = load();
    if (s.newsletter.some((n) => n.email.toLowerCase() === email.toLowerCase())) {
      return { duplicate: true };
    }
    s.newsletter.push({ email, subscribed_at: new Date().toISOString() });
    save();
    return { duplicate: false };
  },
};

// ------------------------------- contacts --------------------------------
export const localContacts = {
  add(row: { email: string; name: string; message: string }) {
    const s = load();
    s.contacts.unshift({
      id: 'msg_' + Math.random().toString(36).slice(2, 10),
      email: row.email,
      name: row.name,
      message: row.message,
      date: new Date().toISOString(),
    });
    save();
  },
};
