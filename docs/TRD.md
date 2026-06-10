# Technical Requirements Document (TRD)

**Project:** Shop With Mercy — single-vendor casual clothing store
**Status:** v1.0 — agreed June 2026
**Builds on:** the PRD (product scope and non-goals)

---

## 1. Architecture at a glance

One SvelteKit application, hosted on Netlify, talking to a small set of managed services.

- **Browser** loads the SvelteKit site from Netlify.
- **SvelteKit** renders pages and runs server-side logic (server routes / Netlify functions) for anything sensitive.
- **Supabase** holds all data (Postgres), handles login (Supabase Auth), and enforces row-level access rules.
- **Cloudinary** stores and serves product images.
- **Resend** sends all automated email.
- **Paystack** runs the hosted checkout and notifies the app when a payment succeeds.

## 2. Stack decisions

### Frontend / application framework — SvelteKit
Compiles to minimal JavaScript — directly serves the performance budget for low-end Android devices on slow, metered connections. Official Netlify adapter, pairs cleanly with Supabase.

### Hosting — Netlify
Free tier is sufficient at launch. Automatic HTTPS/TLS and a global CDN. Atomic deploys give zero-downtime releases and instant rollback.

### Domain — shopwithmercywears.com
Primary address (~$10–15/year). Required for authenticated, deliverable email.

### Database, authentication, storage — Supabase
Postgres database + Supabase Auth + Row-Level Security. Free-tier: 500 MB database, 50,000 monthly active users. Free projects pause after 7 days of inactivity — **$25/month Pro plan budgeted for once the store is live**.

### Images — Cloudinary
Cloud name: `derhxxq6s`. Upload preset: `shop-with-mercy`. Free tier: 25 monthly credits — ample for a small catalogue.

### Email — Resend
Free tier: 3,000 emails/month, 100/day. Configured as Supabase's custom SMTP and called directly from SvelteKit for app emails. Sends from `support@shopwithmercywears.com`.

### Payments — Paystack
Hosted checkout — raw card data never reaches the server. Fees: 1.5% + ₦100 on local cards (cap ₦2,000), 3.9% + ₦100 international. No setup or monthly fee. Next-working-day settlement.

## 3. Data flow for a purchase

1. Customer browses and adds variants to a cart held client-side.
2. At checkout they sign up / log in; the client cart merges into their account.
3. They choose Within RUN / Outside RUN and provide a phone/WhatsApp number.
4. A SvelteKit server route initialises a Paystack transaction.
5. Payment completed on Paystack's hosted checkout.
6. Paystack calls a webhook. On verified success, the app — in one transaction — marks the order paid, decrements stock, and triggers the receipt email via Resend.

## 4. Integrations

- **Paystack:** server-side transaction init + signed webhook verification (HMAC-SHA512).
- **Cloudinary:** admin uploads signed server-side; delivery uses `f_auto`/`q_auto` and responsive `srcset`.
- **Resend + Supabase SMTP:** one provider for both auth emails and app emails.
- **Supabase:** pooled connection string (`port 6543`) for serverless access.

## 5. Security requirements

- **Authentication:** Supabase Auth — bcrypt password hashing, HIBP check, short-lived JWT + rotating refresh tokens in httpOnly cookies.
- **Access control:** admin routes authorised server-side and enforced by RLS at the database — never by hiding UI.
- **OWASP Top 10:** parameterised queries, framework output-escaping + CSP, SameSite cookies, HSTS.
- **Admin privilege:** stored in `admin_users` table, checked server-side. Never a flag on `profiles`.
- **Pinterest tokens:** stored in Supabase Vault. Never plain columns.
- **Card data:** never stored or processed.

## 6. Performance requirements

**Performance budget (per key page):**
- JavaScript: ≤ ~130 KB compressed on the critical path.
- Total initial transfer: ≤ ~500 KB.
- Core Web Vitals (mobile): LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Lighthouse mobile ≥ 90.

**How the budget is held:**
- Images: Cloudinary responsive sizes, modern formats, lazy loading; client-side compression before upload.
- JavaScript: SvelteKit's minimal output, route-level code splitting, no heavy libraries.
- No third-party tracking scripts in the storefront.

## 7. Compliance (NDPA)

- Personal data held: name, email, phone, hashed password, orders, wishlist, reviews, back-in-stock emails.
- Lawful basis: contract performance for orders; consent for notification emails.
- Privacy policy published at `/privacy`.
- Account deletion implemented as anonymisation.
- Cross-border transfer disclosed in the privacy policy.
- NDPC registration required once processing data of more than ~200 people within six months.

## 8. Cost summary

- **At launch:** domain (~$10–15/year) is the only fixed cost.
- **Once taking real orders:** Supabase Pro ~$25/month.
- **Per sale:** Paystack transaction fee.

## 9. Accounts & services

| Service | Purpose | Tier / cost |
|---|---|---|
| GitHub | Code repository | Free |
| Cloudflare / Porkbun | Domain + DNS | ~$10–15/yr |
| Netlify | Hosting | Free |
| Supabase | Database, login, RLS | Free → $25/mo Pro |
| Cloudinary | Image storage + delivery | Free |
| Resend | Transactional email | Free |
| Paystack | Payments | Per-transaction fees |

## 10. Configuration reference

### Project identifiers (non-secret)
- GitHub repo: `https://github.com/Jesus-Dani/shop-with-mercy`
- Netlify site ID: `0e24b5b4-9008-4006-8601-f9dc871bc70d`
- Primary domain: `shopwithmercywears.com`
- Supabase project URL: `https://nqiuxsmzccxiicxdlvnd.supabase.co` · region: `eu-west-3`
- Cloudinary cloud name: `derhxxq6s` · upload preset: `shop-with-mercy`
- Resend from address: `support@shopwithmercywears.com`
- Paystack webhook URL: `https://shopwithmercywears.com/api/paystack/webhook`

### Environment variables (names only — values set privately in Netlify)

| Variable | Exposure | Secret? |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | client + server | No |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client + server | No |
| `SUPABASE_SECRET_KEY` | server only | **Yes** |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | client + server | No |
| `CLOUDINARY_API_KEY` | server | Sensitive |
| `CLOUDINARY_API_SECRET` | server only | **Yes** |
| `CLOUDINARY_UPLOAD_PRESET` | server | No |
| `RESEND_API_KEY` | server only | **Yes** |
| `PUBLIC_PAYSTACK_PUBLIC_KEY` | client + server | No |
| `PAYSTACK_SECRET_KEY` | server only | **Yes** |
| `EMAIL_FROM` | server | No |
