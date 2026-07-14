/** @type {import('next').NextConfig} */

// Derive the Supabase origin from env so the CSP/image config follow the
// configured project instead of a hardcoded one. Falls back to a wildcard
// Supabase host for images if unset.
let supabaseHost = '*.supabase.co';
let supabaseOrigin = 'https://*.supabase.co';
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    supabaseHost = u.hostname;
    supabaseOrigin = u.origin;
  }
} catch (_) {
  // keep wildcard fallback
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: supabaseHost,
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-Frame-Options: DENY is safe alongside frame-src (which restricts
          // frames THIS site embeds, e.g. Stripe). frame-ancestors 'none' in the
          // CSP below restricts who can embed THIS site — X-Frame-Options: DENY
          // is the equivalent legacy-browser fallback for that same protection,
          // it does not conflict with frame-src.
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '0',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            // 'unsafe-eval' removed: not required by Next.js production output or
            // Stripe.js; only kept historically for dev-time convenience. If a
            // future dependency needs eval() (e.g. certain WASM/analytics libs),
            // re-add it deliberately with a comment explaining why.
            // 'unsafe-inline' is kept for script-src/style-src because Next.js
            // injects inline bootstrap scripts/styles that don't use nonces here.
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' data:; connect-src 'self' ${supabaseOrigin} https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`,
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
