# ANUBIS Web Platform - Handover Documentation

This document covers everything needed to operate, deploy, and maintain the
ANUBIS web platform at https://www.anubiskemet2.com.

Sensitive credentials (API keys, secrets) are **NOT** included in this file.
They are delivered separately via a one-time Bitwarden Send link sent to
anubiskemet2@gmail.com.

---

## 1. Service Inventory

| Service | Purpose | Account Email |
|---|---|---|
| Vercel | Hosting and deployments | anubiskemet2@gmail.com (after invite) |
| Supabase | Database, auth, storage | anubiskemet2@gmail.com (after invite) |
| GitHub | Source code | kkrobertson1 (this repo) |
| Cloudinary | Media (image/video) hosting | du31h170u (cloud name) |
| Resend | Transactional email | account tied to API key |
| PayPal | Payment processing (live) | RR&W business account |
| Helcim | Payment processing (live) | merchant 324363 |
| Google AdSense | Ad revenue | pub-2240572702544337 |
| Google Maps | Maps + geocoding | via Google Cloud project |
| Google OAuth | Social login | via Google Cloud project |
| Domain Registrar | anubiskemet2.com | RR&W (Keith's account) |

---

## 2. Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth + Storage + RLS)
- Hosted on Vercel
- Node.js 20+ recommended

---

## 3. Local Setup

```bash
cd anubis-platform
npm install
cp .env.example .env.local   # then fill in values from the Bitwarden Send
npm run dev
```

Open http://localhost:3000.

### Required Environment Variables

All variables below must be set in `.env.local` for local development, and in
Vercel project settings (Production + Preview) for the deployed site.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pqxhziopecnmepaarwok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard -> Settings -> API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard -> Settings -> API>

# App
NEXT_PUBLIC_APP_URL=https://www.anubiskemet2.com

# Helcim (payment provider 1)
HELCIM_API_TOKEN=<from Helcim merchant portal>
HELCIM_MERCHANT_ID=324363

# PayPal (payment provider 2, LIVE mode)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<from PayPal developer dashboard>
PAYPAL_CLIENT_SECRET=<from PayPal developer dashboard>
PAYPAL_MERCHANT_ID=5XDB9DEWWPVJU

# Google OAuth (social login)
GOOGLE_CLIENT_ID=<from Google Cloud Console -> APIs and Services -> Credentials>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# Cloudinary
CLOUDINARY_CLOUD_NAME=du31h170u
CLOUDINARY_API_KEY=<from Cloudinary dashboard>
CLOUDINARY_API_SECRET=<from Cloudinary dashboard>

# Google AdSense
NEXT_PUBLIC_ADSENSE_SLOT_HOME=<ad unit slot ID>
NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD=<ad unit slot ID>
NEXT_PUBLIC_ADSENSE_SLOT_MEMORIAL=<ad unit slot ID>
NEXT_PUBLIC_ADSENSE_SLOT_COMMUNITY=<ad unit slot ID>

# Resend (email)
RESEND_API_KEY=<from Resend dashboard>
RESEND_FROM_EMAIL=ANUBIS <noreply@anubiskemet2.com>

# Webhook signing
WEBHOOK_SECRET=<random 32-byte hex string>
```

---

## 4. Project Structure

```
anubis-platform/
  src/
    app/               Next.js App Router pages and API routes
      api/             Server-side API endpoints
      dashboard/       Authenticated member area
      memorial/[id]/   Public memorial pages
      community/       Public community feed
      ...
    components/        Reusable React components
    lib/               Utilities (supabase clients, helpers, upgrade tiers)
    middleware.ts      Auth middleware
  public/              Static assets (images, ads.txt, favicon)
  supabase/            Database schema and migration SQL files
  package.json
  next.config.ts
  HANDOVER.md          (this file)
```

### Key Routes

- `/` - Marketing home page
- `/login` - Member sign-in (Supabase auth + Google OAuth)
- `/signup` - New member registration + payment
- `/checkout` - Payment flow (PayPal / Helcim)
- `/dashboard` - Member home, grid view of memorials
- `/dashboard/tree` - Family tree view
- `/dashboard/gravesite/new` - Add new memorial (also called from mobile apps via deep link)
- `/dashboard/gravesite/[id]` - Edit memorial
- `/dashboard/connections` - Family connection requests
- `/dashboard/upgrade` - Upgrade plan / additional slots
- `/memorial/[id]` - Public memorial page (indexed for SEO)
- `/community` - Public memorial feed with filters
- `/about`, `/contact`, `/disclaimer`, `/faq` - Trust / info pages

### API Routes (`src/app/api/`)

- `cloudinary/sign` - Signed upload URLs for media
- `gravesite/[id]` - GET/PATCH/DELETE memorial
- `gravesite/[id]/media` - POST/DELETE media attachments
- `notifications/email` - Trigger email via Resend
- `payments/helcim/init`, `verify`, `init-upgrade`, `verify-upgrade` - Helcim flow
- `payments/paypal/create-order`, `capture-order`, `create-upgrade-order`,
  `capture-upgrade-order` - PayPal flow
- `profile` - Member profile updates

---

## 5. Database (Supabase)

Project URL: `https://pqxhziopecnmepaarwok.supabase.co`

### Tables

All tables live in the `public` schema. Full DDL is in
`supabase/schema.sql`, with incremental migrations in the other `*.sql` files.

- `profiles` - extends `auth.users`, holds member metadata (name, slots used,
  payment status)
- `gravesite_profiles` - memorial records
- `gravesite_media` - photos and videos attached to memorials
- `guestbook_entries` - visitor messages on public memorials
- `location_matches` - geographic match candidates from the location trigger
- `connection_requests` - family connection requests between members
- `payments` - payment history (Helcim + PayPal)
- `notifications` - in-app notifications

### Row Level Security (RLS)

RLS is enabled on every table. Policies are defined in `supabase/schema.sql`:
- Members can only read/write their own data
- Public memorials are readable by anyone (anonymous + authenticated)
- Service role key bypasses RLS for server-side admin operations

### Storage Buckets

Media is stored on **Cloudinary**, not Supabase Storage. Supabase Storage is
not currently used.

### Migrations

Run new SQL migrations via the Supabase dashboard SQL editor. Files in the
`supabase/` folder are tracked manually (not via the Supabase CLI). When
adding a new migration:
1. Create a new `*.sql` file in `supabase/`
2. Run it in the SQL editor
3. Commit the file

---

## 6. Deployment

### Production

- **Domain**: https://www.anubiskemet2.com
- **Vercel Project**: `anubis-platform`
- **Git branch**: `main` -> auto-deploys to production
- **Preview**: any other branch -> Vercel auto-creates preview URL on push

### Deploying Updates

1. Make code changes locally
2. `git add` and `git commit`
3. `git push origin main` - Vercel automatically builds and deploys
4. Watch the deploy at https://vercel.com/<team>/anubis-platform/deployments

### Rollback

Vercel keeps every previous deployment. To roll back:
1. Open the project in Vercel
2. Deployments tab -> find the last good deploy
3. Three-dot menu -> "Promote to Production"

### Domain Configuration

The domain `anubiskemet2.com` is managed in Keith's registrar account. DNS
records point to Vercel via:
- `A` record `@` -> Vercel IP (76.76.21.21)
- `CNAME` record `www` -> `cname.vercel-dns.com`

If you ever change hosting providers, update these records in the registrar.

---

## 7. Third-Party Service Notes

### PayPal (LIVE mode)

- Account: RR&W business
- Mode: LIVE (real transactions)
- Currency: USD
- Webhook: Not currently used. We rely on PayPal's order capture flow
  (capture-order route).

### Helcim

- Merchant ID: 324363
- Used as secondary payment processor
- HelcimPay.js modal embedded on `/checkout` and `/dashboard/upgrade`

### Cloudinary

- Cloud name: `du31h170u`
- Folder structure: `anubis/gravesites/<gravesite_id>/`
- Signed uploads via `/api/cloudinary/sign`
- Free tier currently sufficient

### Resend

- Sender: `noreply@anubiskemet2.com` (requires DNS verification on the domain)
- Domain verification is at https://resend.com/domains
- If emails stop sending after the handover, check that the domain is still
  verified in Resend

### Google AdSense

- Publisher ID: `pub-2240572702544337`
- Slot IDs are set in Vercel env vars
- `public/ads.txt` is published at `/ads.txt` for authorized digital sellers verification

### Google Maps + OAuth

- Both share a single Google Cloud project
- APIs enabled: Maps SDK for Android, Maps SDK for iOS, Maps JavaScript API,
  Geocoding API, Places API, OAuth 2.0
- API key restrictions: restricted to anubiskemet2.com domain for web,
  bundle ID `com.rrw.anubis` for mobile

---

## 8. Mobile App Integration

The web platform integrates with the iOS and Android apps (in `CemeteryApp/`
and `cemetery-ios-main/` in this repo) via a deep link:

```
https://www.anubiskemet2.com/dashboard/gravesite/new?lat=<LAT>&lng=<LNG>
```

When a user taps "Save to ANUBIS" in either mobile app, the app captures the
current GPS coordinates and opens this URL. The web platform's
`/dashboard/gravesite/new` page reads the `lat` and `lng` query params and
pre-populates the new memorial form.

If you change this URL pattern on the web side, the mobile apps need to be
updated and resubmitted to the App Store / Play Store.

---

## 9. Common Maintenance Tasks

### Reset a user's password

Supabase dashboard -> Authentication -> Users -> select user -> Send
password reset email.

### Refund a payment

- PayPal: log into PayPal business account, refund from there
- Helcim: log into Helcim merchant portal, refund from there
- After refunding, update the `payments` table in Supabase (set status to
  `refunded`) and update the user's `payment_status` in `profiles` if needed

### Add a memorial manually

Use the Supabase SQL editor or Table editor on `gravesite_profiles`. The
user must already exist in `profiles`.

### Backups

Supabase free tier includes daily Point-in-Time-Recovery for 7 days.
**Upgrade to Supabase Pro is recommended before public launch** (see
`feedback_infrastructure` notes) for longer retention and better SLAs.

### Monitor logs

- Vercel: project dashboard -> Logs tab
- Supabase: project dashboard -> Logs -> select source (API, Auth, etc.)
- Resend: dashboard -> Emails (last 30 days)

---

## 10. Known Pending Items

These are items flagged for after handover:

1. **Upgrade Supabase to Pro plan** before heavy traffic. Free tier has
   limits on connection count and storage that may bottleneck at scale.
2. **Set AdSense ad unit slot IDs** in Vercel env vars. AdSense has approved
   the publisher; ad unit IDs need to be created in the AdSense dashboard
   and pasted into the four `NEXT_PUBLIC_ADSENSE_SLOT_*` variables.
3. **Custom email domain in Resend**: currently sending from `onboarding@resend.dev`
   (Resend's shared domain). To send from `noreply@anubiskemet2.com`, add
   DNS records in the registrar and verify the domain in Resend.

---

## 11. Contacts

- **Original developer**: James (jzappi@gmail.com)
- **Client**: Keith Robertson (RR&W)
- **Service ownership**: anubiskemet2@gmail.com (Vercel, Supabase)
- **Code repository**: github.com/kkrobertson1/Anubis

---

*Last updated: 2026-05-14*
