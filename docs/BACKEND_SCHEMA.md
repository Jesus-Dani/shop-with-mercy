# Backend Schema Document — Shop With Mercy
_Version 1.1 — updated June 2026_

## 1. Overview

PostgreSQL database hosted on Supabase (project: `nqiuxsmzccxiicxdlvnd`, region: eu-west-3).
Full SQL is in `docs/migrations/001_initial_schema.sql`.

## 2. Row Level Security (RLS)

All tables have RLS enabled.

- **Authenticated user:** can only access their own rows.
- **Admin:** identified by a row in `admin_users` table (never by a flag on `profiles`). Checked server-side on every admin action.
- **Anon:** can read published products and insert restock notifications. Cannot read orders or profiles.

## 3. Tables

| Table | Description |
|---|---|
| `profiles` | Extends `auth.users`. Auto-created on sign-up via trigger. |
| `admin_users` | Admin privilege table — no client-accessible RLS. |
| `categories` | Owner-editable product categories. |
| `products` | One row per product. Prices stored as integer Naira. |
| `product_colours` | Each colour variant of a product. |
| `product_images` | One row per image. Stores Cloudinary public ID. |
| `product_variants` | Colour × size combinations. `stock_quantity ≥ 0` enforced. |
| `orders` | One row per order. Customer PII snapshotted for permanence. |
| `order_items` | Denormalised line items — snapshot price/name at purchase time. |
| `cart_items` | Server-persisted cart for signed-in users. Unique on `(user_id, variant_id)`. |
| `wishlist_items` | Saved variants. Unique on `(user_id, variant_id)`. |
| `restock_notifications` | "Notify me" requests — anonymous or logged-in. |
| `reviews` | One review per verified buyer per product. |
| `pinterest_pins` | Cached Pinterest pin data — refreshed on demand. |
| `admin_audit_log` | Append-only admin action log. |

## 4. Key Data Flows

### Placing an order
1. Shopper adds items → `cart_items` rows created or quantities incremented.
2. Paystack fires webhook to `/api/paystack/webhook`.
3. Webhook handler: verifies HMAC-SHA512 signature → atomic stock decrement inside a transaction → sets `orders.status = 'paid'` → clears `cart_items` → sends receipt via Resend.

### Stock concurrency (atomic update pattern)
```sql
UPDATE product_variants
SET stock_quantity = stock_quantity - $quantity
WHERE id = $variant_id AND stock_quantity >= $quantity
RETURNING id, stock_quantity;
```
If `RETURNING` returns no row, stock was insufficient — server flags the order for manual review.

### Restocking a variant
Admin updates `stock_quantity > 0` → database trigger fires → server queries `restock_notifications` for `notified_at IS NULL` → sends email via Resend → sets `notified_at = now()`.

### Account deletion
Server anonymises `profiles` PII, sets `orders.user_id = null`, deletes `cart_items`/`wishlist_items`/`restock_notifications`, sets `reviews.user_id = null`, deletes `pinterest_pins`, calls Supabase Auth to delete `auth.users` record.

## 5. Prices as Integers

All monetary values stored as **integer Naira** — never decimals. Paystack requires kobo: multiply by 100 at the API boundary only. This conversion lives in one utility function.

## 6. Security Additions (v1.1)

- **Vault tokens:** Pinterest access/refresh tokens stored in `vault.secrets`. `profiles` stores only the Vault secret IDs.
- **Admin table:** `admin_users` with no client-accessible RLS policies — privilege escalation is structurally impossible from the client.
- **Connection pooling:** use the Supabase pooler (`port 6543`, transaction mode) for all serverless function calls.
- **`updated_at` triggers:** `moddatetime` extension applied to `profiles`, `products`, `product_variants`, `orders`.
