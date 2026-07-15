<div align="center">

# 👟 SNEAKER AIR

### Premium sneakers, drops & street style — previewed in **live 3D**.

A high-end sneaker storefront with an interactive 3D shoe viewer, a bilingual
(English / Ελληνικά) shopping experience, Stripe & cash-on-delivery checkout,
and a security-hardened admin panel.

</div>

---

## ✨ Highlights

- **Live 3D sneaker viewer** — drag to rotate, scroll to zoom, switch colorways
  and watch the material change in real time. On the home page ("See every
  angle") and every product page (3D / Photo toggle). Falls back to a product
  photo on mobile, when WebGL is unavailable, or when the visitor prefers
  reduced motion.
- **Cinematic "void" design system** — dark-first, one signature gradient
  (electric blue → violet → magenta) threaded through text/borders/glows,
  frosted glass panels, drifting ambient light, film grain, a custom cursor,
  and GSAP scroll reveals. Applied end-to-end: home, shop, product, cart,
  checkout, contact, and the footer.
- **Bilingual** — full English + Greek copy via a lightweight `t()` provider.
- **Real commerce** — cart, checkout (Stripe card payments + cash on delivery),
  server-validated pricing & quantities, per-size stock, order emails.
- **Runs with zero setup.** No Supabase, no Stripe keys, nothing — `npm run dev`
  gives you a fully working shop *and* admin panel out of the box, backed by a
  local data store. Add real Supabase credentials later and it switches over
  automatically, no code changes.
- **Hardened admin panel** — secret URL (never leaked to the client), a
  trusted-device cookie gate (admin only reachable from devices you've
  explicitly enrolled), bcrypt password, and durable serverless-safe sessions.

## 🧱 Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3, forced dark theme |
| 3D | three.js · @react-three/fiber · @react-three/drei |
| Motion | GSAP · Lenis (smooth scroll) · framer-motion |
| Database | Supabase (Postgres) — with a full local fallback for dev |
| Payments | Stripe + Cash on Delivery |
| Email | Resend |
| Auth (admin) | bcrypt + trusted-device cookie gate + durable sessions |

## 🚀 Getting started

**Prerequisites:** Node.js 18+.

```bash
npm install
npm run dev          # http://localhost:3000 — works immediately, zero config
```

That's it. No `.env.local` is required to develop: the app detects that
Supabase isn't configured and transparently uses a local data store (seeded
from `data/products.ts`), so the shop, product pages, checkout, and admin panel
are all fully functional locally. See **`CLAUDE.md` → "Data layer"** for how
this works.

To connect a real backend (Supabase, Stripe, email) or before deploying, copy
`.env.local.example` → `.env.local` and fill in real values — or follow
**`DEPLOY.md`** for the full production walkthrough.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | Lint |

## 🗂️ Project structure

```
app/
  page.tsx              Home (cinematic hero, live 3D showcase, featured drops)
  shop/                 Product listing (filter + sort)
  product/[id]/         Product detail (sizes, colors, 3D / photo viewer)
  checkout/              Checkout (Stripe + cash on delivery)
  contact/  legal/*     Supporting pages
  [secret-slug]/        ADMIN PANEL (see below)
  api/                  Route handlers — all go through lib/db.ts
components/
  Header · Footer · CartDrawer · BottomNav — cinematic void/neon system
  Sneaker3DShowcase.tsx        Home "pick a sneaker, see it live" section
  three/SneakerViewer3D.tsx    3D viewer wrapper (dynamic, WebGL/fallback aware)
  Magnetic · TextRoll · Cursor · immersive/*   Motion vocabulary
context/  Cart · Language (en/gr) · Theme (forced dark)
lib/
  db.ts                 ★ Data-access layer every API route uses
  localStore.ts          Local fallback store (zero-setup dev)
  admin-sessions.ts       Durable (Supabase) / in-memory (dev) admin sessions
  admin-device.ts          Trusted-device gate
  supabase.ts · auth-middleware.ts · sanitize.ts · sneaker-models.ts (3D map)
data/products.ts         Catalog fallback + category/sort lists + local-store seed
public/models/shoe.glb   Self-hosted CC0 3D sneaker model
```

For the full architecture reference (data flow, security posture, gotchas) see
**`CLAUDE.md`**. For deployment, see **`DEPLOY.md`**.

## 🔐 Admin panel

The admin panel is **not** at `/admin` (that path always shows a fake 404, for
everyone). It lives at a **secret URL** you choose via `ADMIN_SECRET_URL`,
e.g. `https://your-site.com/<your-secret-slug>` — and that slug is never sent
to an unauthenticated browser, so it can't be discovered by inspecting network
traffic.

**Access is layered — all three must pass:**

1. **Trusted device** — even if someone learns the slug and password, the admin
   area is unreachable from a device that hasn't been explicitly enrolled.
   Enroll a device (once, per device — your laptop, your phone, the store PC)
   by visiting:
   ```
   https://your-site.com/api/admin/enroll?key=<ADMIN_DEVICE_SECRET>
   ```
   in that device's browser. It sets a 1-year httpOnly cookie. Any other device
   gets a fake 404, regardless of what they know.
2. **Password** — bcrypt-checked against `ADMIN_PASSWORD_HASH`; on success you
   get an HttpOnly session cookie (30-min TTL, durable across serverless
   restarts once Supabase is configured).
3. **Optional IP allow-list** — set `ADMIN_ALLOWED_IPS` for an additional layer.

**What you can manage:**

| Section | Path | Does |
|---|---|---|
| **Dashboard** | `/<slug>/dashboard` | Stats (orders, revenue, products), recent orders, send a test email |
| **Products** | `/<slug>/products` | Add / edit / delete sneakers — name, price, category, description, images (upload), colorways, per-size (EU 38–46) stock |
| **Orders** | `/<slug>/orders` | View orders + customer details, update fulfillment status, delete |
| **Sales Collections** | `/<slug>/sales-collections` | Promo campaigns (discount %, product set, active window) |

Sign out clears the session. All admin write endpoints re-check the session
server-side, on top of the device gate.

## ☁️ Deployment

Deploys cleanly to **Vercel**. See **`DEPLOY.md`** for the exact step-by-step:
Supabase project + schema, Vercel env vars, Resend email setup, Stripe webhook,
and device enrollment.

---

<div align="center">
<sub>Built with Next.js · Sneaker Air © 2026</sub>
</div>
