# Shop With Mercy

A single-vendor e-commerce store for casual women's clothing, serving customers across Nigeria.

Built as a portfolio project — the full planning documentation is in [`/docs`](./docs/).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [SvelteKit](https://svelte.dev) with `@sveltejs/adapter-netlify` |
| Hosting | [Netlify](https://netlify.com) — auto-deploy from `main` |
| Database / Auth | [Supabase](https://supabase.com) (PostgreSQL + Supabase Auth + RLS) |
| Images | [Cloudinary](https://cloudinary.com) — `cloud: derhxxq6s` |
| Email | [Resend](https://resend.com) — transactional email |
| Payments | [Paystack](https://paystack.com) — hosted checkout (card data never touches this server) |
| CSS | Plain CSS custom properties — no Tailwind |
| Icons | Inline SVGs (Tabler Icons outline style) |
| Body font | DM Sans (Google Fonts variable font) |

---

## Project Structure

```
shop-with-mercy/
├── docs/
│   ├── PRD.md                   Product Requirements Document
│   ├── TRD.md                   Technical Requirements Document
│   ├── APP_FLOW.md              User journeys and screen flows
│   ├── UI_UX_BRIEF.md           Design system and component patterns
│   ├── BACKEND_SCHEMA.md        Database schema and RLS policies
│   ├── IMPLEMENTATION_PLAN.md   Eight-phase build plan
│   ├── migrations/
│   │   └── 001_initial_schema.sql  Full database migration
│   ├── setup/
│   │   └── admin_user.sql       One-time admin user setup
│   └── decisions/               Lightweight decision records
├── src/
│   ├── app.css                  Design system (CSS custom properties)
│   ├── app.html                 HTML shell with anti-flash theme script
│   ├── app.d.ts                 SvelteKit type extensions
│   ├── hooks.server.ts          Supabase session injection
│   ├── components/              Shared UI components (Nav, Footer, …)
│   ├── lib/
│   │   ├── supabase.ts          Browser + server Supabase clients
│   │   ├── theme.svelte.ts      Dark/light mode state
│   │   └── database.types.ts   Generated Supabase types
│   └── routes/                  SvelteKit file-based routes
└── static/                      Static assets (favicon, etc.)
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- A Supabase project (or use the existing project: `nqiuxsmzccxiicxdlvnd`)

### 1. Clone and install

```bash
git clone https://github.com/Jesus-Dani/shop-with-mercy.git
cd shop-with-mercy
npm install
```

### 2. Configure environment variables

Copy the example file and fill in values from the services below:

```bash
cp .env.local.example .env.local
```

Values are in the Netlify dashboard (Environment variables) and the respective service dashboards. **Never commit `.env.local`.**

### 3. Apply the database migration

In the [Supabase SQL Editor](https://app.supabase.com/project/nqiuxsmzccxiicxdlvnd/sql/new), paste and run the contents of [`docs/migrations/001_initial_schema.sql`](./docs/migrations/001_initial_schema.sql).

### 4. Set up the admin user

After the owner signs up through the app, follow [`docs/setup/admin_user.sql`](./docs/setup/admin_user.sql).

### 5. Regenerate TypeScript types (after any schema change)

```bash
npx supabase gen types typescript --project-id nqiuxsmzccxiicxdlvnd > src/lib/database.types.ts
```

### 6. Start the dev server

```bash
npm run dev
```

---

## Environment Variables

All values are set in Netlify. For local dev, add to `.env.local`.

| Variable | Description | Secret? |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase project URL | No |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | No |
| `SUPABASE_SECRET_KEY` | Supabase service role key | **Yes** |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Sensitive |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | **Yes** |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset name | No |
| `RESEND_API_KEY` | Resend API key | **Yes** |
| `PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key | No |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | **Yes** |
| `EMAIL_FROM` | From address for emails | No |

---

## Build & Deploy

Netlify auto-deploys on push to `main`. To build locally:

```bash
npm run build
npm run preview
```

---

## Planning Documents

All six planning documents are in [`/docs`](./docs/). Read them in this order to understand why decisions were made:

1. [PRD](./docs/PRD.md) — what we're building and why
2. [TRD](./docs/TRD.md) — how it's built, full stack and integrations
3. [APP_FLOW](./docs/APP_FLOW.md) — every user journey
4. [UI_UX_BRIEF](./docs/UI_UX_BRIEF.md) — design system
5. [BACKEND_SCHEMA](./docs/BACKEND_SCHEMA.md) — database design
6. [IMPLEMENTATION_PLAN](./docs/IMPLEMENTATION_PLAN.md) — build phases

---

## Testing as both admin and customer

The admin area (`/admin`) and the storefront use the same browser session. There is deliberately no "dual login" — that would fight Supabase Auth and add complexity a single-owner shop doesn't need.

**To preview the storefront as a customer while signed in as admin:** open a separate browser profile or an incognito/private window. That gives you a clean session without logging out of the admin.

---

## Key Identifiers (non-secret)

- Supabase project: `nqiuxsmzccxiicxdlvnd` (eu-west-3)
- Cloudinary cloud: `derhxxq6s`
- Site: `https://shopwithmercywears.com`
- Paystack webhook: `https://shopwithmercywears.com/api/paystack/webhook`
- Pinterest App ID: `1579509`
