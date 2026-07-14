/**
 * Input sanitization utilities
 * Use these on ALL user inputs before saving to database
 */

/**
 * Sanitize a string to prevent XSS
 * Removes HTML tags and script content
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string): string {
  const sanitized = sanitizeString(input).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email address');
  }
  return sanitized;
}

/**
 * Sanitize phone number (allow only digits, +, -, spaces, parentheses)
 */
export function sanitizePhone(input: string): string {
  return input.replace(/[^\d+\-\s()]/g, '').trim();
}

/**
 * Sanitize a number (ensure it's a valid number)
 */
export function sanitizeNumber(input: string | number, fallback = 0): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? fallback : num;
}

/**
 * Sanitize an entire order object
 */
export function sanitizeOrderData(order: any): any {
  return {
    ...order,
    customer: {
      firstName: sanitizeString(order.customer?.firstName || ''),
      lastName: sanitizeString(order.customer?.lastName || ''),
      email: sanitizeEmail(order.customer?.email || ''),
      phone: sanitizePhone(order.customer?.phone || ''),
      address: sanitizeString(order.customer?.address || ''),
      city: sanitizeString(order.customer?.city || ''),
      zipCode: sanitizeString(order.customer?.zipCode || ''),
      notes: sanitizeString(order.customer?.notes || ''),
    },
    paymentMethod: sanitizeString(order.paymentMethod || 'cash_on_delivery'),
    paymentStatus: sanitizeString(order.paymentStatus || 'pending'),
  };
}

/**
 * Allowed sneaker categories. Anything else falls back to 'lifestyle'.
 */
export const ALLOWED_CATEGORIES = [
  'running',
  'basketball',
  'lifestyle',
  'skate',
  'training',
  'limited',
] as const;

function sanitizeCategory(input: any): string {
  const c = sanitizeString(input || '').toLowerCase();
  return (ALLOWED_CATEGORIES as readonly string[]).includes(c) ? c : 'lifestyle';
}

/**
 * Sanitize an image URL: must be an http(s) URL, else dropped.
 */
function sanitizeImageUrl(input: any): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

/**
 * Sanitize the sizes array ([{ name, available, stock? }]).
 */
function sanitizeSizes(input: any): any[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((s) => s && typeof s === 'object')
    .map((s) => ({
      name: sanitizeString(String(s.name ?? '')),
      available: !!s.available,
      stock: sanitizeNumber(s.stock, 0),
    }))
    .filter((s) => s.name !== '');
}

/**
 * Sanitize the colors array ([{ name, hex, available }]).
 */
function sanitizeColors(input: any): any[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((c) => c && typeof c === 'object')
    .map((c) => {
      const hex = sanitizeString(String(c.hex ?? ''));
      return {
        name: sanitizeString(String(c.name ?? '')),
        hex: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex) ? hex : '#000000',
        available: c.available !== false,
      };
    })
    .filter((c) => c.name !== '');
}

/**
 * Sanitize a product object (incl. images / sizes / colors, which were
 * previously spread through unsanitized).
 */
export function sanitizeProductData(product: any): any {
  const images = Array.isArray(product.images)
    ? product.images.map(sanitizeImageUrl).filter((u: string | null): u is string => !!u)
    : [];

  return {
    ...product,
    name: sanitizeString(product.name || 'Unnamed Sneaker'),
    description: sanitizeString(product.description || ''),
    category: sanitizeCategory(product.category),
    price: sanitizeNumber(product.price, 0),
    stock: sanitizeNumber(product.stock, 0),
    images,
    sizes: sanitizeSizes(product.sizes),
    colors: sanitizeColors(product.colors),
  };
}
