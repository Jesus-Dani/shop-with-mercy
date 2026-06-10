# Implementation Plan — Shop With Mercy
_Version 1.0 — agreed June 2026_

## Phase order

| Phase | Name | Depends on |
|---|---|---|
| 0 | Foundation | Pre-build checklist |
| 1 | Catalogue | Phase 0 |
| 2 | Cart | Phase 1 |
| 3 | Authentication | Phase 2 |
| 4 | Checkout & Payments | Phase 3 |
| 5 | Customer Account | Phase 4 |
| 6 | Dream Closet (Pinterest) | Phase 5 |
| 7 | Admin Portal | Phase 5 |
| 8 | Polish & Launch | Phases 6 + 7 |

Phases 6 and 7 can be built in parallel — they do not depend on each other.

---

## Phase 0 — Foundation ✓ (current)

SvelteKit scaffolded, design system implemented, Nav + Footer built, Supabase client wired up, database migration written, README committed.

**Done when:**
- `shopwithmercywears.com` loads over HTTPS with the correct nav and footer
- Dark/light mode toggle works and persists on refresh
- Database tables are present and RLS policies are active
- A push to GitHub triggers an automatic Netlify deploy

---

## Phase 1 — Catalogue

Home page hero, product listing grid (with filters/sort), product page (colour swatches, size picker, gallery), search. Cloudinary image delivery with `srcset`. Skeleton loading screens.

**Done when:**
- Owner has added ≥ 3 products with photos via Supabase dashboard
- All pages responsive from 375px to 1440px
- Lighthouse mobile ≥ 90, initial transfer ≤ 500 KB on Slow 3G

---

## Phase 2 — Cart

Add to cart, cart slide-in/page (edit quantity, remove), cart icon badge, anonymous cart in `localStorage`, sold-out detection at cart view.

---

## Phase 3 — Authentication

Sign-up, sign-in, Google OAuth, forgot password, email verification, cart merge on sign-in, session managed via Supabase Auth (httpOnly cookie).

---

## Phase 4 — Checkout & Payments

Checkout gate, delivery & contact step, review order step, Paystack hosted checkout, webhook handler (`/api/paystack/webhook`), order confirmed page, receipt email via Resend.

---

## Phase 5 — Customer Account

Orders tab, Wishlist tab (Add to cart, Notify me), Dream Closet tab placeholder, Profile tab (edit name/email/phone/password, account deletion).

---

## Phase 6 — Dream Closet (Pinterest)

Pinterest OAuth flow (popup), board selection, linked board display, token storage in Supabase Vault, `pinterest_pins` cache, admin analytics mood board grid.

---

## Phase 7 — Admin Portal

`/admin` route with server-side auth check, Products CMS (add/edit, image upload, colour variants, stock), Orders management (mark fulfilled/delivered, refund/cancel, WhatsApp link), Reviews moderation, full Analytics dashboard (7 sections), weekly summary email.

---

## Phase 8 — Polish & Launch

Lighthouse ≥ 90 on all key pages, WCAG AA audit, error/edge-case hardening, security sweep, Privacy Policy page, Refund Policy page confirmed, Pinterest Standard access application, Supabase Pro upgrade, go-live checklist.

---

## Non-goals for v1

Guest checkout · automated WhatsApp API · promo codes · multi-currency · return/exchange portal · bulk SMS/email · loyalty programme · traffic analytics (GA, Facebook Pixel) · multi-vendor · CRM
