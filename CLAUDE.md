# CLAUDE.md — Sneaker Air

Guidance for Claude Code (and humans) working in this repository.

## What this is

**Sneaker Air** is a premium sneaker e-commerce storefront + admin panel,
rebranded from a women's-clothing shop ("Dress Code"). If you find lingering
"Dress Code" / clothing wording, treat it as a bug. Visual identity is a
dark-first cinematic "void" system ported from blancographics.xyz.

- **Framework:** Next.js 14 (App Router) · React 18 · TypeScript
- **Styling:** Tailwind CSS 3, forced dark (`app/layout.tsx` sets `className="dark"`)
- **Data:** Supabase (Postgres) when configured — **with a full local fallback**
  when it isn't (see "Data layer" below). This is the most important
  architectural fact in this repo; read that section before touching any API route.
- **Payments:** Stripe (checkout + webhook) · Cash-on-delivery
- **Email:** Resend (`app/api/email/send-order/route.ts`) — no-ops gracefully if unconfigured
- **Auth (admin):** bcrypt password + trusted-device cookie gate + durable session
- **3D:** react-three-fiber + drei + three (live sneaker viewer, `public/models/shoe.glb`)
- **Motion:** GSAP (`lib/motion.ts`, `lib/reveal.ts`) + Lenis smooth scroll + framer-motion
- **i18n:** custom `t()` provider, English + Greek (`context/LanguageContext.tsx`)
- **Currency:** EUR (€) everywhere. **Sizes:** EU 38–46.

## Commands

```bash
npm install
npm run dev      # dev server — WORKS with zero configuration (see Data layer)
npm run build    # production build (also type-checks)
npm run lint     # next lint
npm start        # serve the production build
```

No test suite. "Verifying" = `npx tsc --noEmit` clean + drive the flow against
`npm run dev` with curl or a browser.

## Data layer — READ THIS FIRST

Every API route goes through **`lib/db.ts`**, never Supabase directly. `lib/db.ts`
checks `isSupabaseConfigured()` (in `lib/supabase.ts` — true only if the URL/keys
are present AND not the `.env.local` placeholder values) and transparently picks
one of two backends:

- **Configured:** real Supabase, via the service-role client.
- **Not configured** (e.g. fresh clone, no `.env.local` secrets): **`lib/localStore.ts`**
  — an in-memory store seeded from `data/products.ts`, persisted to
  `.data/local-db.json` (gitignored) so it survives dev-server restarts.

**This means the app is 100% functional out of the box with zero setup** — shop,
product pages, checkout, and the full admin panel all work against the local
store. When you add real Supabase env vars, it switches over automatically with
no code changes. **Never add a new API route that imports `supabaseAdmin`
directly** — go through `lib/db.ts` (`productsDb`, `ordersDb`, `collectionsDb`,
`newsletterDb`, `contactsDb`) so both backends keep working.

Admin sessions follow the same pattern but live in **`lib/admin-sessions.ts`**
(Supabase `admin_sessions` table when configured, `globalThis`-pinned in-memory
Map otherwise) — see "Admin panel" below for why this matters on Vercel.

Image uploads (`lib/image-upload.ts`) follow the same pattern too: Supabase
Storage when configured, else writes to `public/uploads/` (gitignored).

## Environment

Copy `.env.local.example` → `.env.local`. **The app runs with zero env vars
filled in** (local data layer kicks in). Fill in real values only when you want
a real backend. Key vars:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (public). Omit/leave as placeholder to use the local data layer. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role — **server only**, bypasses RLS |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe |
| `RESEND_API_KEY` / `ADMIN_EMAIL` / `ORDERS_FROM_EMAIL` | Order emails (best-effort; never blocks checkout) |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password. **Escape `$` as `\$` in a raw `.env` file** (dotenv-expand treats `$` as interpolation) — paste it RAW (no `\`) into Vercel's env UI, which doesn't do that expansion. |
| `ADMIN_SECRET_URL` | The slug the admin panel lives under (`/<slug>`) |
| `ADMIN_DEVICE_SECRET` / `ADMIN_DEVICE_TOKEN` | Trusted-device gate (see Admin panel) — **fails closed in production if unset** |
| `ADMIN_ALLOWED_IPS` | Optional secondary IP allow-list (empty = allow all) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (checkout redirects, sitemap, emails, CSP) |

Generate an admin hash: `node -e "const b=require('bcryptjs');b.hash('YourPassword',12).then(console.log)"`
Generate a device token: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Architecture

```
app/
  page.tsx                 Home (cinematic hero, live 3D, featured drops, showcase)
  shop/                    Product listing (filter by category, sort)
  product/[id]/            Product detail (sizes, colors, add to cart, 3D/photo toggle)
  checkout/                Checkout (COD + Stripe)
  contact/  legal/*        Contact form + legal pages
  layout.tsx               Fonts (Clash Display / General Sans / JetBrains Mono), forced dark
  sitemap.ts  robots.ts    SEO
  [secret-slug]/           ADMIN PANEL (see below)
  api/                     Route handlers (see below) — all go through lib/db.ts
components/
  Header / Footer / BottomNav / CartDrawer / MainContent — cinematic void/neon system
  three/SneakerViewer.tsx      R3F scene (client, heavy)
  three/SneakerViewer3D.tsx    Public wrapper: dynamic ssr:false + WebGL/reduced-motion fallback
  Magnetic / TextRoll / Cursor / immersive/*   Motion vocabulary
context/  CartContext · LanguageContext (en/gr) · ThemeContext (forced dark)
lib/
  db.ts                  ★ Data-access layer — ALL routes go through this
  localStore.ts           In-memory/file-backed fallback store (see Data layer above)
  supabase.ts              isSupabaseConfigured() + the two Supabase clients
  admin-sessions.ts        Durable (Supabase) / in-memory (dev) session store
  admin-device.ts           Trusted-device cookie gate helpers
  auth-middleware.ts · ip-whitelist.ts · sanitize.ts · image-upload.ts
  payment-config.ts · sneaker-models.ts (3D colorway map)
  motion.ts · reveal.ts · quality.tsx    GSAP vocabulary + reveal system + quality tiers
data/products.ts           Static catalog — ALSO the seed for lib/localStore.ts. Keep in
                            sync with the seed section of lib/supabase-schema.sql.
public/models/shoe.glb     CC0 base 3D model (KHR_materials_variants: midnight/beach/street)
middleware.ts              Admin route protection (fake-404, device gate, IP allowlist)
```

### Admin panel

- Lives at **`/<ADMIN_SECRET_URL>`** (dynamic `app/[secret-slug]/`): `dashboard`,
  `products`, `orders`, `sales-collections`. The slug is derived **client-side
  from the URL** (`pathname.split('/')[1]`) — there is intentionally no API
  endpoint that returns it (see Security below).
- `/admin` is always fake-404'd by `middleware.ts` (decoy for the old path).
- **Auth is layered — all three must pass:**
  1. **Trusted-device cookie** (`lib/admin-device.ts`) — set only via
     `GET /api/admin/enroll?key=<ADMIN_DEVICE_SECRET>`, visited once per device
     in a browser. Without it, the admin slug and every `/api/admin/*` route
     return a fake 404, *regardless of password knowledge*. **Fails closed** in
     production if `ADMIN_DEVICE_SECRET`/`ADMIN_DEVICE_TOKEN` are unset — don't
     "fix" a locked-out admin by disabling this; set the env vars instead.
  2. **Optional IP allow-list** (`ADMIN_ALLOWED_IPS`) — secondary layer.
  3. **bcrypt password** → `POST /api/admin/login` → durable session via
     `lib/admin-sessions.ts` (Supabase `admin_sessions` table in prod, so logins
     survive across Vercel lambda instances; in-memory `globalThis` Map in local
     dev), HttpOnly `admin_session` cookie, 30-min TTL. Mutating routes call
     `requireAdmin` (`lib/auth-middleware.ts`).
- To revoke ALL enrolled devices at once (lost phone, etc.): rotate
  `ADMIN_DEVICE_TOKEN` in Vercel + redeploy, then re-enroll your own devices.

### API routes (`app/api`)

- `products`, `products/[id]` — catalog CRUD via `productsDb` (writes require admin)
- `orders`, `orders/[id]` — order list/create/update via `ordersDb`. Quantity is
  validated (1–25 integer); `payment_status` is server-forced to `pending` on
  creation (only the Stripe webhook may mark an order paid); totals/shipping are
  always recomputed from stored prices, never trusted from the client. **GET
  [id] requires admin** (contains PII). Order IDs are server-generated
  `ORD-<uuid>`.
- `checkout/session` — creates a Stripe Checkout Session; re-validates prices via `productsDb`.
- `webhooks/stripe` — verifies signature, creates/updates the order via `ordersDb`
  idempotently. Authoritative order creation for the card path.
- `sales-collections` — promo campaigns via `collectionsDb` (admin CRUD; `?admin=true` shows inactive)
- `contact`, `newsletter/subscribe` — public, rate-limited (globalThis-pinned per-IP maps, trusted-IP keyed)
- `email/send-order` — Resend order email (admin-gated; HTML is escaped)
- `admin/{login,logout,verify,enroll}` — session + device enrollment endpoints.
  **There is no `admin/config` route** — it leaked the secret slug and was deleted.
- `upload` — product image via `lib/image-upload.ts` (admin; MIME + magic-byte + size checks)

## Database

Schema + seed: **`lib/supabase-schema.sql`** (run on a fresh Supabase project).
For an existing DB, run **`lib/supabase-migration.sql`** (non-destructive).

No migration tooling — SQL is applied by hand in the Supabase SQL Editor. When
you change a table, update the schema file AND, if it affects the shape the app
reads, `data/products.ts` / `lib/localStore.ts` seed / `types/index.ts`.

Tables: `products`, `orders`, `sales_collections`, `newsletter_subscribers`,
`contact_submissions`, `admin_sessions`. Also create a public Storage bucket
named **`product_images`** for uploads.

### RLS posture (important)

All app DB access goes through the **service-role** client (`supabaseAdmin`),
which bypasses RLS. RLS is still locked down as defense-in-depth:
- `products`: anon **read-only**.
- Every other table: RLS enabled, **no anon policy** ⇒ anon fully denied.
  Do NOT re-add "allow all" policies — a previous `USING(true)` policy was a
  critical hole (anyone with the public anon key could read all orders / mutate
  the catalog / read admin sessions).

`sizes` JSONB (`[{name, available, stock}]`) is the real per-size inventory
model. Orders decrement per-size stock in `app/api/orders/route.ts` via
`productsDb.decrementSize`.

## Order / checkout flow

- **Cash on delivery:** `POST /api/orders` → validates quantities → recalculates
  total from DB prices → inserts order (`payment_status: 'pending'`, forced
  server-side) → decrements per-size stock → `POST /api/email/send-order`.
- **Stripe:** `POST /api/checkout/session` (re-validates prices, EUR) → Stripe
  Checkout → on `checkout.session.completed`, `webhooks/stripe` creates the order
  idempotently. The order is NOT created before payment for the card path.

## Security posture (do not regress these)

- **No `/api/debug`, no `/admin-emergency` backdoor, no `admin/config` slug leak** —
  all deliberately removed. Don't re-add anything like them.
- **Device gate fails closed** in production — see Admin panel above.
- **Blocked admin slug returns a true 404**, byte-for-byte indistinguishable from
  a genuinely missing route (`middleware.ts` rewrites with `{ status: 404 }`).
- **Rate limiters must key off `getClientIP()`** (`lib/ip-whitelist.ts`, prefers
  Vercel's trustworthy `x-real-ip`), never a raw `x-forwarded-for` read — that
  header is client-spoofable and lets an attacker reset their bucket every request.
- **Rate-limit / session Maps must be pinned to `globalThis`** (see any of
  `app/api/{orders,contact,admin/login,admin/enroll,newsletter/subscribe}/route.ts`
  for the pattern) — a plain module-level Map is not a reliable singleton across
  Next.js route bundles / serverless instances.
- **Client-supplied price, quantity bounds, and payment status are never trusted** —
  server always recomputes/validates. `quantity` must be a 1–25 integer.
- Keep API error messages generic; log details server-side only.
- `.env.local` is gitignored — never commit real secrets. The old master
  password `blancodebug123` is in git history; it's irrelevant now (the feature
  it unlocked is deleted) but don't reuse it anywhere.

## Design system / immersive front-end

Dark-first cinematic "void" system (ported from blancographics.xyz): void/carbon/steel
surfaces, fog/mist/ghost type, volt/plasma/flare neon accents, Clash Display /
General Sans / JetBrains Mono. All storefront pages (home, shop, product,
contact, checkout, cart, header, footer, legal) share this system — see
`app/globals.css` for the recipe classes (`.panel-glass`, `.panel-metal`,
`.text-hollow`, `.text-neon`, `.line-mask`, `.grain-overlay`, `.aura-blob-*`) and
`tailwind.config.ts` for the color keys. Admin panel keeps a lighter charcoal
theme (functional, not the full cinematic treatment).

- `useReveal` (`lib/reveal.ts`) drives scroll-in animation via `data-reveal` /
  `data-reveal-group` / `.line-mask` attributes — GSAP-based, respects
  `prefers-reduced-motion`.
- `Cursor.tsx` — custom GSAP cursor with contextual states via `data-cursor="link"|"view"`.
- `Magnetic` / `TextRoll` — hover interaction primitives, used throughout CTAs/nav.

### 3D sneaker viewer

- Use **`components/three/SneakerViewer3D`** (NOT `SneakerViewer` directly) —
  dynamic-imports the three.js bundle `ssr:false`, detects WebGL, honors
  reduced-motion, falls back to a product image on failure/mobile.
- Props: `fallbackImage`, `variant` (`midnight` | `beach` | `street`), `autoRotate`, `interactive`, `className`.
- Model: `public/models/shoe.glb`. Colorways map via `lib/sneaker-models.ts`'s
  `variantForColorwayIndex()` to the model's built-in KHR material variants.
- Do NOT use drei `Environment`/`Stage` **presets** — they fetch HDRIs from a CDN
  the CSP blocks. Use the manual light rig already in `SneakerViewer`.
- **Dev-mode CSP must allow `'unsafe-eval'`** (`next.config.js`, dev-only) —
  without it, Next's React Refresh throws and the entire client bundle fails to
  hydrate, which looks exactly like "stuck loading forever" everywhere
  (3D viewer, shop, admin). Production CSP has no `unsafe-eval`.

## Conventions & gotchas

- **Sneaker categories** (ids): `running`, `basketball`, `lifestyle`, `skate`,
  `training`, `limited`. Whitelisted in `lib/sanitize.ts` (unknown → `lifestyle`).
- **Sizes:** EU 38–46 as string names in the `sizes` JSONB.
- **Bilingual:** every user-facing string should have en + gr entries in
  `context/LanguageContext.tsx`.
- **Two "dresscode" copies exist on disk.** The real app is `D:\apps\dresscode`
  (one word). `D:\apps\dress-code` (hyphen) is an unrelated old decoy — never edit it.
- Deployed on Vercel; `next.config.js` sets CSP + security headers and derives
  the Supabase origin from `NEXT_PUBLIC_SUPABASE_URL`.
- See **`DEPLOY.md`** for the full production checklist (Supabase setup, Vercel
  env vars, Resend, device enrollment).
