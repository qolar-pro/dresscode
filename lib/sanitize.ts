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
 * Sanitize a product object
 */
export function sanitizeProductData(product: any): any {
  return {
    ...product,
    name: sanitizeString(product.name || 'Unnamed Product'),
    description: sanitizeString(product.description || ''),
    category: sanitizeString(product.category || 'dresses'),
    price: sanitizeNumber(product.price, 0),
    stock: sanitizeNumber(product.stock, 0),
  };
}
