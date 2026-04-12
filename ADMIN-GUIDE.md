# DRESS CODE - Admin Panel Guide

## 🔐 ACCESSING THE ADMIN PANEL

### URL
- **Localhost:** `http://localhost:3000/admin`
- **Live Site:** `https://blancographics.xyz/admin`

### Default Login Credentials
- **Password:** `DressCode2026!`
- **Change it in:** `lib/admin-config.ts`

---

## 🔒 SECURITY FEATURES

### Password Protection
- SHA-256 encrypted password storage
- Password is hashed, never stored as plain text
- Change password via `lib/admin-config.ts`

### Session Security
- **Auto-logout after 30 minutes** of inactivity
- Session timer visible in admin header
- Manual logout button always available

### Brute-Force Protection
- **5 failed login attempts = 15 minute lockout**
- Lockout timer shown on login page
- Prevents unauthorized access attempts

### Activity Logging
- All login attempts logged
- Logout events recorded
- Session expirations tracked
- View logs in browser localStorage

---

## 📱 HOW TO USE ON PC & PHONE

### On Your PC (Localhost)
1. Open `http://localhost:3000/admin`
2. Enter password: `DressCode2026!`
3. Manage products, view orders
4. All data saved to browser localStorage

### On Your Phone (Same WiFi Network)
1. Find your PC's local IP address:
   - Open Command Prompt
   - Type `ipconfig`
   - Look for "IPv4 Address" (e.g., `192.168.1.100`)
2. On your phone, open: `http://192.168.1.100:3000/admin`
3. Login with same password
4. **Note:** Phone and PC have separate localStorage (data won't sync)

### Important Note About Data Sync
Currently, products and orders are stored in **browser localStorage**:
- ✅ Works perfectly on one device
- ❌ PC and phone won't share the same data
- ❌ Data lost if browser cache cleared

**For cross-device sync, you'll need a cloud database (Firebase, Supabase, etc.) when you deploy to production.**

---

## 💳 PAYMENT GATEWAYS

### Current Status
- **Active:** Cash on Delivery only
- **Ready for integration:**
  - Stripe (Credit/Debit Cards)
  - PayPal
  - Viva Wallet (Greece)

### How to Enable a New Payment Gateway

1. **Get API Keys** from the payment provider:
   - Stripe: [stripe.com](https://stripe.com)
   - PayPal: [paypal.com/business](https://paypal.com/business)
   - Viva Wallet: [vivawallet.com](https://vivawallet.com)

2. **Update Configuration** in `lib/payment-config.ts`:
   ```typescript
   stripe: {
     enabled: true,  // Change from false to true
     testMode: false, // Change to false for live payments
     // Add your API keys here
   }
   ```

3. **Add API Keys** (create `.env.local` file):
   ```
   STRIPE_SECRET_KEY=sk_live_your_key_here
   STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
   ```

4. **Install Payment SDK**:
   ```bash
   npm install @stripe/stripe-js
   ```

5. **Create Payment Processor** in `lib/payments/stripe.ts`

---

## 🛠️ CHANGING THE ADMIN PASSWORD

### Method 1: Using Online Tool (Easiest)
1. Go to: https://emn178.github.io/online-tools/sha256.html
2. Enter your new password
3. Copy the 64-character hash
4. Open `lib/admin-config.ts`
5. Replace `ADMIN_PASSWORD_HASH` with your new hash

### Method 2: Using Code
1. Open browser console (F12)
2. Run:
   ```javascript
   const password = 'YourNewPassword123!';
   const encoder = new TextEncoder();
   const data = encoder.encode(password);
   crypto.subtle.digest('SHA-256', data).then(hash => {
     console.log(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
   });
   ```
3. Copy the output hash
4. Update `lib/admin-config.ts`

---

## 📊 ADMIN PANEL FEATURES

### Dashboard (`/admin/dashboard`)
- Total orders count
- Total revenue
- Customer count
- Product count
- Recent orders list
- Quick action buttons

### Orders (`/admin/orders`)
- View all customer orders
- Search by order ID, name, or email
- View order details:
  - Customer information
  - Items ordered
  - Sizes & colors
  - Payment method
  - Total amount
- Delete orders

### Products (`/admin/products`)
- View all products in grid
- **Add new product:**
  - Name, price, category
  - Description
  - Sizes (toggle available/unavailable)
  - Mark as "New Arrival" or "Featured"
- **Edit existing products**
- **Delete products**
- All changes saved to localStorage

---

## 🚀 DEPLOYMENT CHECKLIST

Before uploading to `blancographics.xyz`:

### Security
- [ ] Change admin password hash
- [ ] Update `ADMIN_EMAIL` in config
- [ ] Test session timeout works
- [ ] Verify brute-force protection

### Data
- [ ] Decide on database solution (Firebase/Supabase/MongoDB)
- [ ] Migrate from localStorage to cloud database
- [ ] Set up database backup

### Payments
- [ ] Choose payment gateway(s)
- [ ] Get API keys from provider
- [ ] Test in sandbox/test mode first
- [ ] Enable live mode only after testing

### Environment Variables
Create `.env.local` file:
```
# Admin
ADMIN_PASSWORD_HASH=your_hash_here
ADMIN_EMAIL=admin@blancographics.xyz

# Payments (when ready)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
```

---

## 🆘 TROUBLESHOOTING

### "Account Locked" Error
- Wait 15 minutes and try again
- Or clear browser localStorage:
  - Press F12 → Application → Local Storage → Clear

### Can't Access Admin on Phone
- Make sure phone and PC are on same WiFi
- Use PC's local IP (not localhost)
- Check Windows Firewall allows port 3000

### Changes Not Saving
- Check browser localStorage isn't full
- Try different browser
- Clear cache and reload

### Session Keeps Expiring
- Increase `SESSION_TIMEOUT` in `lib/admin-config.ts`
- Check if browser is blocking localStorage

---

## 📞 SUPPORT

For help with:
- **Firebase integration:** [firebase.google.com/docs](https://firebase.google.com/docs)
- **Stripe payments:** [stripe.com/docs](https://stripe.com/docs)
- **Next.js deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**Built with ❤️ for DRESS CODE**
**Version 1.0 - 2026**
