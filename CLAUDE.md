# CLAUDE.md — Sneaker Air

Guidance for Claude Code (and humans) working in this repository.

## What this is

**Sneaker Air** is a premium sneaker e-commerce storefront + admin panel. It was
rebranded from a women's-clothing shop ("Dress Code"); if you find any lingering
"Dress Code" / clothing wording, treat it as a bug to fix.

- **Framework:** Next.js 14 (App Router) · React 18 · TypeScript
- **Styling:** Tailwind CSS 3 (`tailwind.config.ts` + `app/globals.css`), `darkMode: 'class'`
- **Data:** Supabase (Postgres) — `lib/supabase.ts`
- **Payments:** Stripe (checkout + webhook) · Cash-on-delivery
- **Email:** Resend (`app/api/email/send-order/route.ts`)
- **Auth (admin):** bcrypt password + HttpOnly cookie session (`lib/admin-*.ts`)
- **3D:** react-three-fiber + drei + three (live sneaker viewer)
- **Motion:** framer-motion + lenis (smooth scroll)
- **i18n:** custom `t()` provider, English + Greek (`context/LanguageContext.tsx`)
- **Currency:** EUR (€) everywhere. **Sizes:** EU 38–46.

## Commands

```bash
npm install
npm run dev      # dev server (needs .env.local — see below)
npm run build    # production build (also type-checks)
npm run lint     # next lint
npm start        # serve the production build
```

There is no test suite. "Verifying" = `npm run build` clean + driving the flow
in `npm run dev`.

## Environment

Copy `.env.local.example` → `.env.local` and fill in real values. `.env.local`
is gitignored — never commit real secrets. Key vars:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role — **server only**, bypasses RLS |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook signatures (required for card orders) |
| `RESEND_API_KEY` / `ADMIN_EMAIL` / `ORDERS_FROM_EMAIL` | Order emails |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password (login checks this) |
| `ADMIN_SECRET_URL` | The slug the admin panel lives under (`/<slug>`). Use a long random value. |
| `ADMIN_ALLOWED_IPS` | Comma-separated IP allow-list for admin (empty = allow all, dev only) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (checkout redirects, sitemap, emails) |

Generate an admin hash: `node -e "const b=require('bcryptjs');b.hash('YourPassword',12).then(console.log)"`

If Supabase vars are missing, `lib/supabase.ts` throws a clear "Supabase not
configured" error. If Stripe key is missing, Stripe routes fail per-request
(lazy init) rather than crashing the whole build.

## Architecture

```
app/
  page.tsx                 Home (hero, categories, featured, sales, newsletter)
  shop/                    Product listing (filter by category, sort)
  product/[id]/            Product detail (sizes, colors, add to cart, 3D viewer)
  checkout/                Checkout (COD + Stripe)
  contact/  legal/*        Static-ish pages
  layout.tsx               Fonts (Unbounded/Manrope/JetBrains Mono) + SEO metadata
  sitemap.ts  robots.ts    SEO
  icon.svg                 Favicon (SA monogram on the signature gradient)
  [secret-slug]/           ADMIN PANEL (see below)
  api/                     Route handlers (see below)
components/
  Header / Footer / BottomNav / CartDrawer / MainContent
  three/SneakerViewer.tsx      R3F scene (client, heavy)
  three/SneakerViewer3D.tsx    Public wrapper: dynamic ssr:false + WebGL/reduced-motion fallback
context/  CartContext · LanguageContext (en/gr) · ThemeContext (dark class)
lib/      supabase · admin-config · admin-sessions · auth-middleware · ip-whitelist ·
          sanitize · image-upload · payment-config · sneaker-models (3D map)
data/products.ts           Static catalog fallback + category/sort lists (mirror of DB seed)
public/models/shoe.glb     CC0 base 3D model (Khronos MaterialsVariantsShoe)
middleware.ts              Admin route protection
```

### Admin panel

- Lives at **`/<ADMIN_SECRET_URL>`** (dynamic `app/[secret-slug]/`): `dashboard`,
  `products`, `orders`, `sales-collections`. `layout.tsx` gates children by
  polling `/api/admin/verify`.
- `/admin` is intentionally **fake-404'd** by `middleware.ts` (a decoy).
- **Auth:** `POST /api/admin/login` bcrypt-compares against `ADMIN_PASSWORD_HASH`,
  creates a UUID session (`lib/admin-sessions.ts`, in-memory Map, 30-min TTL),
  sets an HttpOnly `admin_session` cookie. Mutating API routes call
  `requireAdmin` (`lib/auth-middleware.ts`).
- **IP allow-list:** `middleware.ts` + `lib/ip-whitelist.ts` restrict the admin
  slug and `/api/admin/*` when `ADMIN_ALLOWED_IPS` is set.

> ⚠️ **Known limitation:** sessions and rate-limit counters are in-memory Maps.
> On serverless (Vercel) each instance has its own memory, so sessions can be
> lost across instances / cold starts. For production reliability move these to
> a shared store (Redis/Upstash or a DB table). Left in-memory intentionally to
> avoid adding infra without sign-off.

### API routes (`app/api`)

- `products`, `products/[id]` — catalog CRUD (writes require admin)
- `orders`, `orders/[id]` — order list/create/update; **GET [id] requires admin**
  (contains PII). Order IDs are server-generated `ORD-<uuid>` (unguessable).
- `checkout/session` — creates a Stripe Checkout Session; re-validates prices
  from the DB; generates the order id server-side into session metadata.
- `webhooks/stripe` — verifies the signature and **creates the order** for card
  payments (idempotent). This is the authoritative order creation for Stripe.
- `sales-collections` — promo campaigns (admin CRUD; `?admin=true` shows inactive)
- `contact`, `newsletter/subscribe` — public, rate-limited (in-memory per IP)
- `email/send-order` — Resend order email (admin-gated; HTML is escaped)
- `admin/{login,logout,verify,config}` — admin session endpoints
- `upload` — product image upload to Supabase Storage (admin; MIME + magic-byte
  + size checks in `app/api/upload/route.ts` / `lib/image-upload.ts`)

## Database

Schema + seed: **`lib/supabase-schema.sql`** (run on a fresh Supabase project).
For an existing DB, run **`lib/supabase-migration.sql`** (non-destructive: adds
the missing `orders.status` column + `sales_collections`, `newsletter_subscribers`,
`contact_submissions` tables, and locks RLS).

There is **no migration tooling** — SQL is applied by hand in the Supabase SQL
Editor. When you change a table, update BOTH the schema file and (if it affects
the shape the app reads) `data/products.ts` / `types/index.ts`.

Tables: `products`, `orders`, `sales_collections`, `newsletter_subscribers`,
`contact_submissions`. Also create a public Storage bucket named
**`product_images`** for uploads.

### RLS posture (important)

All app DB access goes through the **service-role** client (`supabaseAdmin`),
which bypasses RLS. RLS is still locked down as defense-in-depth:
- `products`: anon **read-only** (`products_public_read`).
- `orders` / `sales_collections` / `newsletter_subscribers` / `contact_submissions`:
  RLS enabled, **no anon policy** ⇒ anon denied. Do NOT re-add "allow all"
  policies — the previous `USING(true)` policies were a critical hole (anyone
  with the public anon key could read all orders / mutate the catalog).

`products.stock` is the top-level stock (now persisted); real per-size inventory
lives in the `sizes` JSONB (`[{name, available, stock}]`). Orders decrement
per-size stock in `app/api/orders/route.ts`.

## Order / checkout flow

- **Cash on delivery:** `POST /api/orders` → server recalculates the total from
  DB prices (never trusts the client), inserts the order, decrements per-size
  stock, then `POST /api/email/send-order`.
- **Stripe:** `POST /api/checkout/session` (re-validates prices, EUR) → Stripe
  Checkout → on `checkout.session.completed`, `webhooks/stripe` creates the order
  idempotently. The order is NOT created before payment for the card path.

## Design system / immersive front-end

The look is a dark-first "aura HUD": one signature gradient (electric blue →
violet → magenta) threaded through text/borders/glows, big display type
(Unbounded) vs micro mono labels (JetBrains Mono), frosted glass, a living
ambient background, and tactile buttons.

- Palette + fonts: `tailwind.config.ts` (existing color keys `charcoal`/`pearl`/
  `cream`/`accent`/`luxury` were re-pointed to the sneaker palette — keep the key
  names so existing classNames keep working).
- Reusable recipes in `app/globals.css`: `.aura-text`, `.aura-border`,
  `.aura-glass` / `.aura-glass-strong`, `.aura-gradient`, `.grid-overlay`,
  `.noise-overlay`, `.aura-blob(-a/-b/-c)`, `.btn-glow`, `.marquee-track`.
  All ambient animations are disabled under `prefers-reduced-motion`.

### 3D sneaker viewer

- Use **`components/three/SneakerViewer3D`** (NOT `SneakerViewer` directly) —
  it dynamic-imports the three.js bundle with `ssr:false`, detects WebGL, honors
  reduced-motion, and falls back to a product image on failure/mobile.
- Props: `fallbackImage`, `variant` (`midnight` | `beach` | `street`),
  `autoRotate`, `interactive`, `className`.
- Model: `public/models/shoe.glb` (CC0). Colorways map to the model's built-in
  KHR material variants via `lib/sneaker-models.ts`. To give a product its own
  silhouette, drop a `.glb` in `public/models/` and map its id in
  `MODEL_BY_PRODUCT`.
- Do NOT use drei `Environment`/`Stage` **presets** — they fetch HDRIs from a CDN
  that the strict CSP blocks. Use the manual light rig already in `SneakerViewer`.

## Conventions & gotchas

- **Sneaker categories** (ids): `running`, `basketball`, `lifestyle`, `skate`,
  `training`, `limited`. Whitelisted in `lib/sanitize.ts` (unknown → `lifestyle`).
- **Sizes:** EU 38–46 as string names in the `sizes` JSONB.
- **Bilingual:** every user-facing string should have en + gr entries in
  `context/LanguageContext.tsx`. Some pages still hardcode English — prefer `t()`.
- **Two "Dress Code" copies exist on disk.** The real app is `D:\apps\dresscode`
  (one word). `D:\apps\dress-code` (hyphen) is an unrelated old Vite demo — never
  edit it.
- **Security:** don't reintroduce the `/api/debug` route, the `/admin-emergency`
  master-password backdoor, wide-open RLS, or client-supplied order IDs — all were
  removed deliberately. Keep returning generic API error messages (log details
  server-side).
- Deployed on Vercel; `next.config.js` sets CSP + security headers and derives the
  Supabase origin from `NEXT_PUBLIC_SUPABASE_URL`.
