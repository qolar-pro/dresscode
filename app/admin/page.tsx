import { notFound } from 'next/navigation';

/**
 * BLOCK /admin route
 * 
 * This file exists to override the catch-all [secret-slug] route.
 * Next.js gives priority to specific routes over dynamic ones,
 * so /admin/page.tsx wins over /[secret-slug]/page.tsx.
 */
export default function BlockedAdmin() {
  notFound();
}
