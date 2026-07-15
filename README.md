<div align="center">

# 👟 SNEAKER AIR

### Premium sneakers, drops & street style — previewed in **live 3D**.

Step into the future. A high-end sneaker storefront with an interactive 3D
shoe viewer, a bilingual (English / Ελληνικά) shopping experience, Stripe &
cash-on-delivery checkout, and a secure admin panel.

</div>

---

## ✨ Highlights

- **Live 3D sneaker viewer** — drag to rotate, scroll to zoom, and switch
  colorways to see the material change in real time. On the home page ("See
  every angle") and on every product page (3D / Photo toggle). Gracefully falls
  back to a product photo on mobile, when WebGL is unavailable, or when the
  visitor prefers reduced motion.
- **Award-winning immersive UI** — a dark "aura" design system (signature
  gradient, frosted glass, film grain, drifting light), smooth scrolling,
  scroll-reveal animations, and a custom cursor.
- **Bilingual** — full English + Greek copy via a lightweight `t()` provider.
- **Real commerce** — cart, checkout (Stripe card payments + cash on delivery),
  server-validated pricing, per-size stock, order emails.
- **Secure admin panel** — products, orders, sales collections and a dashboard,
  behind a secret URL + password + optional IP allow-list.

## 🧱 Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3 (`darkMode: 'class'`) |
| 3D | three.js · @react-three/fiber · @react-three/drei |
| Motion | framer-motion · lenis (smooth scroll) |
| Database | Supabase (Postgres) |
| Payments | Stripe + Cash on Delivery |
| Email | Resend |
| Auth (admin) | bcrypt + HttpOnly cookie session |

## 🚀 Getting started

**Prerequisites:** Node.js 18+.

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.local.example .env.local
#   then fill in the values (see "Environment" below)

# 3. Run
npm run dev          # http://localhost:3000
```

> You can browse the storefront immediately with placeholder env values — if
> Supabase isn't configured, the shop falls back to the built-in sneaker catalog
> in `data/products.ts`, and the 3D viewer works fully (the model is
> self-hosted). Stripe/Supabase-backed features (real checkout, saving orders,
> admin data) need real keys.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | Lint |

### Environment

Copy `.env.local.example` → `.env.local`. Key variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role — **server only** |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhooks (required for card orders) |
| `RESEND_API_KEY`, `ADMIN_EMAIL`, `ORDERS_FROM_EMAIL` | Order emails |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password |
| `ADMIN_SECRET_URL` | The slug the admin panel lives at (`/<slug>`) |
| `ADMIN_ALLOWED_IPS` | Comma-separated admin IP allow-list (empty = allow all) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |

Generate an admin password hash:

```bash
node -e "const b=require('bcryptjs');b.hash('YourStrongPassword',12).then(console.log)"
```

### Database setup

There's no migration tool — apply SQL by hand in the Supabase SQL Editor:

- **Fresh project:** run `lib/supabase-schema.sql` (creates tables + RLS + seeds
  the sneaker catalog).
- **Existing database:** run `lib/supabase-migration.sql` (non-destructive: adds
  the missing column/tables and locks down RLS).
- Create a **public Storage bucket** named `product_images` for uploads.

## 🗂️ Project structure

```
app/
  page.tsx              Home (hero, categories, live 3D showcase, featured, newsletter)
  shop/                 Product listing (filter + sort)
  product/[id]/         Product detail (sizes, colors, 3D / photo viewer)
  checkout/             Checkout (Stripe + cash on delivery)
  contact/  legal/*     Supporting pages
  [secret-slug]/        ADMIN PANEL (see below)
  api/                  Route handlers (products, orders, checkout, webhooks, admin…)
components/
  Header · Footer · CartDrawer · BottomNav
  Sneaker3DShowcase.tsx        Home "pick a sneaker, see it live" section
  three/SneakerViewer3D.tsx    3D viewer wrapper (dynamic, WebGL/fallback aware)
  immersive/                   SmoothScroll · CustomCursor · Reveal · Marquee
context/  Cart · Language (en/gr) · Theme (dark)
lib/      supabase · auth · sanitize · sneaker-models (3D map) · schema/migration SQL
data/products.ts        Catalog fallback + category/sort lists
public/models/shoe.glb  Self-hosted CC0 3D sneaker model
```

For a deeper architecture reference (data flow, security posture, gotchas) see
**`CLAUDE.md`**.

## 🔐 Admin panel

The admin panel is **not** at `/admin` (that path deliberately shows a fake 404).
It lives at a **secret URL** you choose via `ADMIN_SECRET_URL`, e.g.
`https://your-site.com/<your-secret-slug>`.

**Access is layered:**
1. **Secret URL** — you must know the slug (`ADMIN_SECRET_URL`).
2. **Password** — bcrypt-checked against `ADMIN_PASSWORD_HASH`; on success you
   get an HttpOnly session cookie (30-min TTL).
3. **Optional IP allow-list** — set `ADMIN_ALLOWED_IPS` to restrict admin access
   (and the admin API) to specific IPs.

**What you can manage:**

| Section | Path | Does |
|---|---|---|
| **Dashboard** | `/<slug>/dashboard` | Stats (orders, revenue, products), recent orders, send a test email |
| **Products** | `/<slug>/products` | Add / edit / delete sneakers — name, price, category, description, images (upload), colorways, and **per-size (EU 38–46) stock** |
| **Orders** | `/<slug>/orders` | View orders + customer details, update fulfillment status, delete |
| **Sales Collections** | `/<slug>/sales-collections` | Create promo campaigns (discount %, product set, active window) |

Sign out clears the session. All admin write endpoints re-check the session
server-side.

> **Security notes:** admin sessions are stored in-memory, so on serverless
> (Vercel) they can drop across instances — for production, move sessions to a
> shared store (Redis/Upstash). Always set a long random `ADMIN_SECRET_URL`, a
> strong password, and (in production) `ADMIN_ALLOWED_IPS`.

## ☁️ Deployment

Deploys cleanly to **Vercel**. Set all env vars in the project settings, run the
Supabase schema, create the `product_images` bucket, and add the Stripe webhook
endpoint (`/api/webhooks/stripe`) with its signing secret. `next.config.js`
ships the CSP + security headers and derives the Supabase origin from your env.

---

<div align="center">
<sub>Built with Next.js · Sneaker Air © 2026</sub>
</div>
