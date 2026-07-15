/**
 * Unified data-access layer.
 *
 * Every API route goes through this module instead of touching Supabase
 * directly. When Supabase is configured it uses the service-role client;
 * otherwise it transparently uses the persistent local store
 * (`lib/localStore.ts`). This is what makes the storefront + admin fully
 * functional in local dev with placeholder env values.
 */
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import {
  localProducts,
  localOrders,
  localCollections,
  localNewsletter,
  localContacts,
  type DbProductRow,
  type DbOrderRow,
  type DbCollectionRow,
} from '@/lib/localStore';

const useLocal = () => !isSupabaseConfigured();

// ------------------------------- products --------------------------------
export const productsDb = {
  async list(): Promise<DbProductRow[]> {
    if (useLocal()) return localProducts.list();
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async get(id: number | string): Promise<DbProductRow | null> {
    if (useLocal()) return localProducts.get(Number(id));
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', Number(id))
      .single();
    if (error) return null;
    return data;
  },

  async create(row: any): Promise<DbProductRow> {
    if (useLocal()) return localProducts.create(row);
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([row])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: number | string, updates: any): Promise<DbProductRow> {
    if (useLocal()) {
      const updated = localProducts.update(Number(id), updates);
      if (!updated) throw new Error('Product not found');
      return updated;
    }
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: number | string): Promise<void> {
    if (useLocal()) {
      localProducts.remove(Number(id));
      return;
    }
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  /** Read a product's price for server-side order total validation. */
  async priceOf(id: number | string): Promise<number | null> {
    const p = await this.get(id);
    return p ? Number(p.price) : null;
  },

  /** Decrement per-size stock (used after an order is placed). */
  async decrementSize(id: number | string, sizeName: string, qty: number): Promise<void> {
    if (useLocal()) {
      localProducts.decrementSize(Number(id), sizeName, qty);
      return;
    }
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('id, sizes')
      .eq('id', id)
      .single();
    if (error || !product) return;
    const updatedSizes = (product.sizes || []).map((s: any) =>
      s.name === sizeName
        ? { ...s, stock: Math.max(0, (s.stock ?? 0) - qty) }
        : s
    );
    await supabaseAdmin.from('products').update({ sizes: updatedSizes }).eq('id', id);
  },
};

// -------------------------------- orders ---------------------------------
export const ordersDb = {
  async list(): Promise<DbOrderRow[]> {
    if (useLocal()) return localOrders.list();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async get(id: string): Promise<DbOrderRow | null> {
    if (useLocal()) return localOrders.get(id);
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async create(row: any): Promise<DbOrderRow> {
    if (useLocal()) {
      return localOrders.create({
        created_at: new Date().toISOString(),
        ...row,
      });
    }
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([row])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string): Promise<DbOrderRow> {
    if (useLocal()) {
      const updated = localOrders.updateStatus(id, status);
      if (!updated) throw new Error('Order not found');
      return updated;
    }
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    if (useLocal()) {
      localOrders.remove(id);
      return;
    }
    const { error } = await supabaseAdmin.from('orders').delete().eq('id', id);
    if (error) throw error;
  },
};

// ----------------------------- collections -------------------------------
export const collectionsDb = {
  async list(activeOnly: boolean): Promise<DbCollectionRow[]> {
    if (useLocal()) return localCollections.list(activeOnly);
    let query = supabaseAdmin.from('sales_collections').select('*');
    if (activeOnly) query = query.eq('is_active', true);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((c: any) => ({
      ...c,
      product_ids: Array.isArray(c.product_ids) ? c.product_ids : [],
    }));
  },

  async create(row: any): Promise<DbCollectionRow> {
    if (useLocal()) return localCollections.create(row);
    const { data, error } = await supabaseAdmin
      .from('sales_collections')
      .insert([row])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any): Promise<DbCollectionRow> {
    if (useLocal()) {
      const updated = localCollections.update(id, updates);
      if (!updated) throw new Error('Collection not found');
      return updated;
    }
    const { data, error } = await supabaseAdmin
      .from('sales_collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    if (useLocal()) {
      localCollections.remove(id);
      return;
    }
    const { error } = await supabaseAdmin
      .from('sales_collections')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ------------------------------ newsletter -------------------------------
export const newsletterDb = {
  /** Returns { duplicate } — never throws for the "already subscribed" case. */
  async subscribe(email: string): Promise<{ duplicate: boolean }> {
    if (useLocal()) return localNewsletter.add(email);
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert([{ email, subscribed_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) {
      if (error.code === '23505') return { duplicate: true };
      // Table missing / other soft failure — treat as success (best-effort).
      console.warn('Newsletter insert soft-failed:', error.message);
    }
    return { duplicate: false };
  },
};

// ------------------------------- contacts --------------------------------
export const contactsDb = {
  async add(row: { email: string; name: string; message: string }): Promise<void> {
    if (useLocal()) {
      localContacts.add(row);
      return;
    }
    const { error } = await supabaseAdmin
      .from('contact_submissions')
      .insert([{ ...row, date: new Date().toISOString() }])
      .select()
      .single();
    if (error) {
      // Best-effort: contact form should not hard-fail if the table is missing.
      console.warn('Contact insert soft-failed:', error.message);
    }
  },
};
