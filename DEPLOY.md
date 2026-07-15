# DEPLOY.md — Sneaker Air production checklist

Step-by-step to take this repo from `npm run dev` (local data store) to a live
Vercel deployment backed by real Supabase, Stripe, and Resend. Do these in
order — later steps depend on earlier ones.

Background reading: `CLAUDE.md` (architecture, data layer, security posture).

---

## 1. Push the code

```bash
git add -A
git commit -m "your message"
git push origin <branch>
```

In Vercel: **New Project → Import `qolar-pro/dresscode`.** If you're deploying
from a feature branch (not `main`), either merge it to `main` first, or set
Vercel's **Production Branch** to that branch (Project → Settings → Git).

The build will succeed with **zero env vars** (it falls back to the local data
store and dummy Stripe/Resend keys lazily fail per-request, not at build time) —
but the site won't be fully functional until you complete the steps below.

## 2. Supabase — the real backend

1. **[supabase.com](https://supabase.com) → New project.** Pick a region close
   to your customers. Set a strong DB password. Wait ~2 min for provisioning.
2. **SQL Editor → New query** → paste the entire contents of
   **`lib/supabase-schema.sql`** → **Run**. This creates every table
   (`products`, `orders`, `sales_collections`, `newsletter_subscribers`,
   `contact_submissions`, `admin_sessions`), locks down RLS, and seeds the
   12-sneaker catalog.
   - *(If you're migrating an existing database that already has the old
     schema, run `lib/supabase-migration.sql` instead — it's non-destructive.)*
3. **Storage → New bucket** → name it exactly `product_images` → toggle
   **Public bucket** → Save. (Admin product-image uploads go here.)
4. **Settings → API** → copy three values: **Project URL**, **anon public**
   key, **service_role** key. You'll need them in step 4.

## 3. Generate your production secrets

Run these locally and save the output somewhere safe (a password manager, not
a committed file):

```bash
# Admin login password hash (pick your own real password, not the example)
node -e "const b=require('bcryptjs');b.hash('YourStrongPassword!',12).then(console.log)"

# Admin device-enrollment passphrase (used in the enroll URL)
node -e "console.log('enroll-'+require('crypto').randomBytes(6).toString('hex'))"

# Admin device token (the actual cookie value — never share this one)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Vercel environment variables

**Project → Settings → Environment Variables.** Set each for **Production AND
Preview** (the device gate fails closed if these are missing on either):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase step 2.4 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase step 2.4 |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase step 2.4 — **server-only, keep secret** |
| `ADMIN_SECRET_URL` | your chosen admin slug, e.g. a random word — not `admin`/`dashboard` |
| `ADMIN_PASSWORD_HASH` | the bcrypt hash from step 3 — **paste raw, no `\$` escaping** (that escaping is only needed in a literal `.env` file; Vercel's UI stores the value literally) |
| `ADMIN_DEVICE_SECRET` | the enrollment passphrase from step 3 |
| `ADMIN_DEVICE_TOKEN` | the device token from step 3 |
| `NEXT_PUBLIC_SITE_URL` | your production URL, e.g. `https://sneakerair.com` |
| `RESEND_API_KEY` | from step 5 |
| `ADMIN_EMAIL` | where you want a copy of every order |
| `ORDERS_FROM_EMAIL` | must be on your verified Resend domain (step 5) |
| `STRIPE_SECRET_KEY` | from Stripe dashboard, only if selling by card |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ditto |
| `STRIPE_WEBHOOK_SECRET` | from step 6, only if selling by card |

You do **not** need `ADMIN_ALLOWED_IPS` or `ADMIN_MASTER_PASSWORD` — the former
is optional, the latter no longer exists (that backdoor was removed).

After saving, **Redeploy** (env var changes require a fresh build to take effect).

## 5. Resend — transactional email

Without this, checkout still works fine, but no confirmation emails send (the
email step is best-effort and never blocks an order).

1. **[resend.com](https://resend.com) →** sign up → **API Keys →** create one.
2. **Domains →** add your sending domain → add the DNS records Resend gives you
   → wait for verification. *(No domain yet? For testing only, you can send
   from `onboarding@resend.dev` to your own email address.)*
3. Set `RESEND_API_KEY`, `ADMIN_EMAIL`, `ORDERS_FROM_EMAIL` in Vercel (step 4) —
   `ORDERS_FROM_EMAIL` **must** be `@your-verified-domain`.

## 6. Stripe (only if accepting card payments)

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**:
   `https://your-domain.com/api/webhooks/stripe`
2. Select event: `checkout.session.completed`.
3. Copy the **signing secret** (`whsec_...`) → set as `STRIPE_WEBHOOK_SECRET` in Vercel.
4. Set `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from
   Developers → API keys. Use test keys until you're ready to go live, then
   switch to live keys + a live webhook endpoint.

## 7. Enroll your devices

Once deployed with env vars set, on **each device you'll admin from** (your
laptop, your phone, the store PC), open its browser and visit:

```
https://your-domain.com/api/admin/enroll?key=<ADMIN_DEVICE_SECRET>
```

You'll see "Device enrolled ✓". That device can now reach
`https://your-domain.com/<ADMIN_SECRET_URL>` and log in with your password.
Every other device gets an indistinguishable-from-missing 404.

**Lost a device / need to revoke access everywhere:** rotate
`ADMIN_DEVICE_TOKEN` in Vercel, redeploy, then re-enroll only the devices you
still trust.

## 8. Verify

- [ ] Home, shop, product pages load and show live data (not the local seed —
      edit a product's price in admin and confirm it changes on the storefront)
- [ ] 3D viewer rotates on home + product pages
- [ ] Place a test cash-on-delivery order → appears in `/<slug>/orders` →
      confirmation email arrives (if Resend is set up)
- [ ] Place a test Stripe order (test card `4242 4242 4242 4242`) → webhook
      creates the order → appears in admin
- [ ] From a **non-enrolled** device/browser, confirm `/<slug>` and `/admin`
      both 404 identically
- [ ] From an **enrolled** device, log in, edit a product, create a sales
      collection, update an order status

## Rotating secrets later

Any of `ADMIN_PASSWORD_HASH`, `ADMIN_DEVICE_TOKEN`, `ADMIN_DEVICE_SECRET`,
`ADMIN_SECRET_URL`, or `SUPABASE_SERVICE_ROLE_KEY` can be rotated at any time:
update the Vercel env var → Redeploy. Rotating `ADMIN_DEVICE_TOKEN` logs out
every enrolled device (re-enroll after). Rotating `ADMIN_SECRET_URL` changes
your admin URL — no data is affected either way.
