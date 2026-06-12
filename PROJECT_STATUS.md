# Shop With Mercy — Project Status Report

## What Was Built

### Phase 0 — Foundation (Complete)

**SvelteKit 5 project scaffolded with:**
- Framework: SvelteKit 2.63 + Svelte 5 (runes mode — `$state`, `$derived`, `$effect`, `$props`)
- Adapter: `@sveltejs/adapter-netlify` v6 (server-side rendering on Netlify Functions)
- Database: `@supabase/ssr` + `@supabase/supabase-js` v2 (cookie-based auth)
- Build tool: Vite 8

**Core infrastructure files:**
- `svelte.config.js` — Netlify adapter, path aliases (`$components`, `$lib`)
- `netlify.toml` — build command, publish dir, Node 20
- `src/app.d.ts` — TypeScript types for `locals.supabase`, `locals.safeGetSession`
- `src/hooks.server.ts` — attaches Supabase client to every request, `safeGetSession` validates JWT before trusting it
- `src/lib/supabase.ts` — `createSupabaseBrowserClient()` and `createSupabaseServerClient()` using `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `src/lib/database.types.ts` — stub types for all 15 Supabase tables (to be replaced with real generated types once the schema is applied)
- `src/lib/theme.svelte.ts` — dark/light theme toggle persisted to localStorage
- `src/routes/+layout.server.ts` — loads session/user on every page, returns `cartCount: 0`, `wishlistCount: 0` (placeholders until Phase 2)
- `src/routes/+layout.svelte` — wraps every page in `<Nav>` + `<Footer>`, mounts theme on `onMount`
- `src/app.css` — full CSS design system: 5 brand tokens (Cornsilk, Black Forest, Olive Leaf, Sunlit Clay, Copperwood), spacing scale, typography scale, button variants, dark mode via `[data-theme="dark"]`
- `src/components/Nav.svelte` — top nav with logo, links (Home, Shop), cart/wishlist icon badges, user avatar, mobile hamburger menu
- `src/components/Footer.svelte` — site footer

**Design system tokens:**

| Token | Value | Used for |
|---|---|---|
| `--color-cornsilk` | `#FFF8E7` | Page backgrounds |
| `--color-black-forest` | `#1C2B1E` | Primary text, dark panels |
| `--color-olive-leaf` | `#6B7C3E` | Accents, hero panel |
| `--color-sunlit-clay` | `#C4714A` | Warm CTA alternative |
| `--color-copperwood` | `#8B4513` | Links, primary buttons |

---

### Phase 1 — Catalogue (Complete)

**New utility files:**
- `src/lib/cloudinary.ts` — `cdnUrl()` and `cdnSrcset()` for responsive Cloudinary image URLs (`f_auto`, `q_auto`, `ar_4:5`, `c_fill`); `CARD_SIZES` and `HERO_SIZES` `<sizes>` strings
- `src/lib/format.ts` — `formatNaira(amount)` — displays integer Naira with `₦` and locale comma formatting. Prices are never floating point.

**New components:**
- `src/components/ProductCard.svelte` — product card with responsive Cloudinary srcset, sale/sold-out badges, wishlist heart (always visible on mobile, hover only on desktop), CSS-only image zoom on hover
- `src/components/ProductCardSkeleton.svelte` — shimmer loading skeleton with `@keyframes shimmer`, respects `prefers-reduced-motion`

**New pages:**

| Route | File | What it does |
|---|---|---|
| `/` | `src/routes/+page.svelte` | Split hero (Black Forest left + Olive Leaf right), category chips, "New Arrivals" grid (newest 8 products), USP strip |
| `/` | `src/routes/+page.server.ts` | Loads categories + 8 newest published products with colours/images/variants |
| `/shop` | `src/routes/shop/+page.svelte` | Product grid with category chips, size chips, sale filter, colour filter, sort dropdown, active filter tags with clear buttons, empty state |
| `/shop` | `src/routes/shop/+page.server.ts` | URL-based filters (`?category=`, `?size=`, `?colour=`, `?sale=1`, `?min=`, `?max=`, `?sort=`). Category name→ID lookup. JS-level colour/size filtering (nested table traversal). |
| `/shop/[id]` | `src/routes/shop/[id]/+page.svelte` | Product detail: image gallery with thumbnails, colour swatches (hex circles or text chips), size picker (disabled/strikethrough for out-of-stock), add-to-cart (Phase 2 placeholder), WhatsApp contact link, reviews section with star ratings |
| `/shop/[id]` | `src/routes/shop/[id]/+page.server.ts` | Loads product with sorted colours/images/variants, visible reviews, avgRating |
| `/search` | `src/routes/search/+page.svelte` | Search form, results grid, empty state |
| `/search` | `src/routes/search/+page.server.ts` | Full-text search using `.or('name.ilike.%q%,description.ilike.%q%')`, limit 48 |
| `/category/[name]` | `src/routes/category/[name]/+page.server.ts` | Looks up category by name (case-insensitive), 302 redirects to `/shop?category=name` |

---

## Infrastructure Status

### Netlify

| Item | Status |
|---|---|
| Site name | `shop-with-mercy` |
| Netlify URL | `shop-with-mercy.netlify.app` — **WORKING** |
| Build command | `npm run build` |
| Publish dir | `build` |
| Latest deploy | Published (12:31 PM Jun 10) |
| Auto-deploy | On — triggers on every push to `main` |
| Custom domain `shopwithmercywears.com` | **NOT WORKING — DNS not pointing to Netlify** |

### Netlify Environment Variables (what was fixed)

Two variables had wrong names in the Netlify dashboard. They were corrected:

| Wrong name (old) | Correct name (now) |
|---|---|
| `PUBLIC_CLOUDINARY_NAME` | `PUBLIC_CLOUDINARY_CLOUD_NAME` |
| `PUBLIC_SUPABASE_PERISHABLE_KEY` | `PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

These are `$env/static/public` variables — they are baked into the build at compile time, so the build was failing until these were corrected.

### Variables still needed (not blocking Phase 1/2 but needed later)

| Variable | Purpose |
|---|---|
| `SUPABASE_SECRET_KEY` | Server-side admin operations (still empty) |
| `CLOUDINARY_API_KEY` | Image upload from admin panel |
| `CLOUDINARY_API_SECRET` | Image upload from admin panel |

### Supabase

| Item | Status |
|---|---|
| Project ID | `nqiuxsmzccxiicxdlvnd` |
| Connection | Configured via `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Tables | 15 tables defined in stub types — schema may not be applied yet |
| RLS | On all tables per security policy |
| Data | No test products added yet — pages will render empty |
| Real generated types | Not yet generated — using stub types with `as unknown as` cast workaround |

### Cloudinary

| Item | Status |
|---|---|
| Cloud name | Set in Netlify env as `PUBLIC_CLOUDINARY_CLOUD_NAME` |
| Image delivery | Configured via `cdnUrl()` / `cdnSrcset()` |
| Upload credentials | Not yet set up (needed for admin panel) |

---

## The Current Problem — Why "Server Can't Be Found"

**Root cause: DNS is not configured.**

Netlify confirmed this in the Domain Management page: both `shopwithmercywears.com` and `www.shopwithmercywears.com` show **"Pending DNS verification"**, and the SSL section says **"shopwithmercywears.com doesn't appear to be served by Netlify."**

This means: whoever registered `shopwithmercywears.com` has DNS records pointing somewhere else, or pointing nowhere. Netlify has no control over this — it must be fixed at the registrar.

**The site code is correct. The build succeeds. The problem is 100% DNS.**

### Fix: Add these DNS records at your domain registrar

| Type | Name | Value | What it does |
|---|---|---|---|
| `A` | `@` (the root domain) | `75.2.60.5` | Points `shopwithmercywears.com` to Netlify |
| `CNAME` | `www` | `shop-with-mercy.netlify.app` | Points `www.shopwithmercywears.com` to Netlify |

**Steps:**
1. Log in to wherever you bought `shopwithmercywears.com`
2. Find DNS settings
3. Add the two records above
4. Go back to Netlify → Domain Management → click **"Retry DNS verification"**
5. Wait for propagation (minutes to a few hours)
6. Netlify will automatically issue an SSL certificate

---

## What Is Working Right Now

- `https://shop-with-mercy.netlify.app` — visit this to confirm the site loads
- All code (home page, shop, product detail, search) is built and deployed
- Supabase connection is configured (pages show empty state until products are added)

---

## Remaining Work

| Priority | Task |
|---|---|
| **Immediate** | Fix DNS — add records at domain registrar |
| **Next** | Add test data — add categories and products in Supabase dashboard |
| **Next** | Generate real Supabase types: `npx supabase gen types typescript --project-id nqiuxsmzccxiicxdlvnd > src/lib/database.types.ts` |
| **Phase 2** | Cart — localStorage anonymous cart, add-to-cart, cart slide-in drawer, cart badge count, sold-out detection |
| **Phase 3+** | Checkout (Paystack), Auth, Wishlist, Admin panel, Pinterest sync |

---

## Security Constraints (non-negotiable)

- No secrets in the repo. All credentials live in Netlify environment variables only.
- Card data never reaches the server. Paystack hosted checkout only.
- RLS on every Supabase table. Never bypass RLS by using the service role key on the client side. Service role is server-side only.
- Admin privilege comes from the `admin_users` table, checked server-side on every admin route. Never trust a client-supplied claim.
- Pinterest tokens go into Supabase Vault, not plain columns.
- No floating-point money. All prices stored as integer Naira in the database. Multiply by 100 only at the Paystack API boundary.
