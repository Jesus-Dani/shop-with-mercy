# Product Requirements Document (PRD)

**Project:** Shop With Mercy — single-vendor casual clothing store
**Status:** v1.0 — agreed June 2026
**Audience for this doc:** the developer and the project owner

> This is the first of six planning artifacts. It captures *what* we are building and *why*. The *how* — framework, database, payment provider, hosting topology, exact performance budget — is deliberately deferred to the Technical Requirements Document (TRD) and is flagged as such at the end.

---

## 1. Overview

**Shop With Mercy** is a live e-commerce store for a single vendor selling casual women's clothing, primarily to the Redeemer's University (RUN) campus community and secondarily to off-campus customers in Nigeria. The owner runs everything herself through a self-service admin portal — products, stock, orders, and business analytics — with no developer involvement after launch.

The site is also a public portfolio project on GitHub, so the build and the documentation are part of the deliverable, and the codebase is assumed to be readable by anyone (security never relies on obscurity).

The audience shapes every decision: customers are on low-end Android phones, intermittent 3G/4G, and metered data, so the storefront must be lightweight and resilient on poor connections. The project runs on free or low-cost infrastructure.

## 1b. Owner Contact & Brand Presence

- **Business name:** Shop With Mercy
- **Website:** `https://shopwithmercywears.com`
- **WhatsApp (customer contact):** `https://wa.me/2349049435149` (09049435149)
- **TikTok:** `https://www.tiktok.com/@shopwithmercy_`
- **Support email:** `support@shopwithmercywears.com`

---

## 2. Goals

- Let the owner sell online and manage the entire business herself, without technical help.
- Give customers a fast, trustworthy buying experience even on weak connections and cheap devices.
- Handle real money and real personal data safely and lawfully (no raw card data on the server; aligned with Nigeria's NDPA).
- Keep the first launch right-sized — resilient and maintainable, not over-built — with a clear path to grow later.
- Produce a repo that tells a coherent story of how and why it was built (portfolio quality).

## 3. Target users

**Primary — RUN campus customer.** A student or staff member at Redeemer's University. Buys on a phone, often on a slow connection. Wants to browse quickly, find their size, pay, and collect on campus.

**Secondary — off-campus customer.** A customer elsewhere in Nigeria. Same browsing experience; delivery is arranged manually over WhatsApp after purchase.

**The owner (admin).** Non-technical. Needs a simple portal to add and edit products, manage orders, message customers, and understand how the business is doing.

## 4. Core features (v1 scope)

### Storefront — browsing
- Product catalogue organised by **type** categories (e.g. Tops, Skirts), with categories the owner can add or rename.
- Products have one or more **colours**, each with its own image(s), and a set of **sizes** chosen per product.
- **Filters:** colour, size, price range, on-sale. **Sort:** newest (default), price low–high, price high–low.
- Sold-out products stay visible with a clear **"Sold out"** badge.

### Cart & checkout
- Anyone can browse and **add to cart without an account**.
- An **account is required to check out**.
- At checkout the customer chooses **Within RUN** or **Outside RUN** and provides a **phone/WhatsApp number**.
- Payment taken through Paystack's hosted checkout — **card details never touch the server**.
- **Stock is decremented at the moment of successful payment.**
- A single **automatic confirmation email with a receipt** is sent on successful payment.

### Fulfilment & communication
- **Delivery is arranged and paid for off-platform** after purchase.
- **Within RUN:** owner emails the pickup point and time (manually).
- **Outside RUN:** owner contacts the customer on **WhatsApp** via a one-tap `wa.me` link in the admin.

### Customer accounts
- **Order history** with status and detail view.
- **Wishlist** saved as a specific variant (product + colour + size).
- **Profile:** name, email, phone/WhatsApp, and password.
- **Account deletion:** self-serve anonymisation.

### Reviews & ratings
- Star rating (1–5) and optional written review.
- **Only verified buyers can review** — once per product.
- Admin can hide or remove reviews.

### Notifications
- Transactional email: account verification, password reset, order confirmation/receipt.
- **Back-in-stock alerts** for sold-out variants.

### Refunds & returns
- Policy: no refunds after payment except if the order can't be fulfilled or didn't reach the customer.
- Single admin **refund/cancel** action via Paystack API.
- Fixed (non-editable) **Refund Policy page** in the menu.

### Admin portal
- Password-protected at `/admin`, same database as the shop.
- **Product management:** create/edit products; upload photos per colour; set descriptions, sizes, stock, price, sale price, cost price.
- **Order management:** view orders, mark fulfilled/delivered, refund/cancel, WhatsApp link.
- **Reviews:** see and moderate reviews.
- **Business analytics dashboard:** revenue, orders, AOV, profit/margin, best sellers, stock overview, new vs returning customers, demand signals.

## 5. Non-functional requirements (summary)

- **Security:** managed auth; HTTPS everywhere; OWASP Top 10 defence; least-privilege access enforced server-side.
- **Privacy / NDPA:** privacy policy; lawful basis per purpose; data-subject rights including erasure.
- **Performance:** mobile-first; hard performance budget (critical JS ≤ 130 KB compressed, transfer ≤ 500 KB, Lighthouse mobile ≥ 90).

## 6. Success criteria

- Owner can manage the full catalogue, process orders, and read her business performance with no developer involvement.
- A customer on a low-end Android phone over 3G can complete a purchase without the site breaching its performance budget.
- Card data never reaches the server.
- Stock never oversells.

## 7. Out of scope (non-goals for v1)

- Guest checkout
- Self-service returns/RMA portal
- Automated WhatsApp messaging
- Multiple vendors; multiple currencies; international sales
- Promo codes / coupons
- Traffic analytics (GA, Facebook Pixel)
- Loyalty / rewards programmes
