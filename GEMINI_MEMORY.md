# 🧠 DRESS CODE - Project Memory

## 📌 Project Overview
- **Project Name:** DRESS CODE (Luxury Fashion Boutique)
- **Live URL:** [blancographics.xyz](https://blancographics.xyz)
- **Stack:** Next.js 14 (App Router), Supabase, Stripe, Resend.
- **Currency:** EUR (€)
- **Languages:** English (en), Greek (gr)

## 🛠️ Recent Fixes & Implementation (Completed)
- **Stripe Security:** API version synced to `2026-03-25.dahlia`. Checkout sessions now verify prices against Supabase to prevent client-side manipulation.
- **Order Flow:** Implemented Stripe Webhook (`/api/webhooks/stripe`). Orders are now created in Supabase **only after** payment confirmation to prevent "ghost orders."
- **Premium UI:** Replaced category emojis with Lucide Icons (`Shirt`, `Wind`, `Sun`, `Gem`).
- **Navigation:** Upgraded the Header to include a dynamic Categories Dropdown.
- **Translations:** Fixed major Greek localization gaps in:
    - Active Sales section
    - Category item counts ("items" -> "αντικείμενα")
    - Product card category labels
    - Shop page sort and filter options

## 🔐 Security & Config State
- **IP Whitelist:** Currently **DISABLED** (returns `true`) in `lib/ip-whitelist.ts` for ease of admin setup.
- **Stripe Webhook:** The endpoint is `https://blancographics.xyz/api/webhooks/stripe`.
- **Environment Variables Needed:**
    - `STRIPE_WEBHOOK_SECRET`: (Required for order syncing. Starts with `whsec_`)
    - `ADMIN_SECRET_URL`: The slug for the admin portal.

## 📋 Pending / Next Steps
- **Placeholder Data:** Still using "123 Fashion Street" and "(555) 123-4567" in `LanguageContext.tsx`. Update before official marketing.
- **Stock Management:** Implement stock decrement logic inside the Stripe webhook.
- **Responsive Images:** Audit hero sections for `next/image` optimization to improve LCP.
- **Re-enable IP Whitelist:** Once the admin setup is stable, update `lib/ip-whitelist.ts` to strictly allow only authorized IPs.

---
*Last updated: April 16, 2026*
