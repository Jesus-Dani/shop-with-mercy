-- =============================================================
-- Shop With Mercy — Initial Schema Migration
-- Run once against the Supabase project: nqiuxsmzccxiicxdlvnd
-- Apply via: Supabase Dashboard → SQL Editor, or supabase db push
-- =============================================================

-- Enable required extensions
-- moddatetime: auto-updates updated_at columns on row change
-- pgcrypto: used by gen_random_uuid() (already enabled on Supabase)
create extension if not exists moddatetime schema extensions;

-- =============================================================
-- STEP 1: TABLES
-- =============================================================

-- -----------------------------------
-- 1.1 profiles
-- Extends auth.users; created via trigger on sign-up.
-- -----------------------------------
create table public.profiles (
  id                           uuid primary key references auth.users(id) on delete cascade,
  full_name                    text not null,
  phone                        text,
  -- Pinterest tokens stored as Vault secret IDs (never plain text)
  pinterest_access_token_id    uuid,
  pinterest_refresh_token_id   uuid,
  pinterest_board_id           text,
  pinterest_board_name         text,
  pinterest_token_expires_at   timestamptz,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

comment on column public.profiles.pinterest_access_token_id
  is 'References vault.secrets(id). The actual token is stored in Supabase Vault — never as plain text.';

-- -----------------------------------
-- 1.2 admin_users
-- Admin privilege is stored here, not as a flag on profiles.
-- No client-accessible RLS — service role only.
-- -----------------------------------
create table public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint admin_users_user_id_unique unique (user_id)
);

-- -----------------------------------
-- 1.3 categories
-- -----------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint categories_name_unique unique (name)
);

-- -----------------------------------
-- 1.4 products
-- All prices stored as integer Naira (never decimals).
-- -----------------------------------
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  price       integer not null check (price > 0),
  sale_price  integer check (sale_price > 0),
  cost_price  integer check (cost_price >= 0),
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------
-- 1.5 product_colours
-- -----------------------------------
create table public.product_colours (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  colour_name  text not null,
  colour_hex   text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- -----------------------------------
-- 1.6 product_images
-- -----------------------------------
create table public.product_images (
  id                   uuid primary key default gen_random_uuid(),
  product_colour_id    uuid not null references public.product_colours(id) on delete cascade,
  cloudinary_public_id text not null,
  sort_order           integer not null default 0,
  created_at           timestamptz not null default now()
);

-- -----------------------------------
-- 1.7 product_variants
-- Stock tracked at colour × size level.
-- stock_quantity can never go below 0.
-- -----------------------------------
create table public.product_variants (
  id                 uuid primary key default gen_random_uuid(),
  product_colour_id  uuid not null references public.product_colours(id) on delete cascade,
  size               text not null,
  stock_quantity     integer not null default 0 check (stock_quantity >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- -----------------------------------
-- 1.8 orders
-- customer_* columns are snapshots — preserved after account deletion.
-- -----------------------------------
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null,
  user_id             uuid references public.profiles(id) on delete set null,
  customer_name       text not null,
  customer_email      text not null,
  customer_phone      text not null,
  delivery_type       text not null check (delivery_type in ('within_run', 'outside_run')),
  status              text not null default 'pending'
                        check (status in ('pending','paid','fulfilled','delivered','cancelled','refunded')),
  subtotal            integer not null check (subtotal > 0),
  paystack_reference  text not null,
  paystack_channel    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint orders_order_number_unique unique (order_number),
  constraint orders_paystack_reference_unique unique (paystack_reference)
);

-- Auto-generate human-readable order number: SWM-00001, SWM-00002, …
create sequence if not exists public.order_number_seq start 1;

create or replace function public.generate_order_number()
returns trigger language plpgsql as $$
begin
  new.order_number := 'SWM-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  return new;
end;
$$;

create trigger orders_generate_number
  before insert on public.orders
  for each row
  when (new.order_number is null or new.order_number = '')
  execute function public.generate_order_number();

-- -----------------------------------
-- 1.9 order_items
-- Denormalised: snapshot product/colour/size/price at purchase time.
-- -----------------------------------
create table public.order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  product_variant_id  uuid references public.product_variants(id) on delete set null,
  product_name        text not null,
  colour_name         text not null,
  size                text not null,
  quantity            integer not null check (quantity >= 1),
  unit_price          integer not null check (unit_price > 0),
  cost_price          integer
);

-- -----------------------------------
-- 1.10 cart_items
-- -----------------------------------
create table public.cart_items (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  product_variant_id  uuid not null references public.product_variants(id) on delete cascade,
  quantity            integer not null default 1 check (quantity >= 1),
  added_at            timestamptz not null default now(),
  constraint cart_items_user_variant_unique unique (user_id, product_variant_id)
);

-- -----------------------------------
-- 1.11 wishlist_items
-- -----------------------------------
create table public.wishlist_items (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  product_variant_id  uuid not null references public.product_variants(id) on delete cascade,
  added_at            timestamptz not null default now(),
  constraint wishlist_items_user_variant_unique unique (user_id, product_variant_id)
);

-- -----------------------------------
-- 1.12 restock_notifications
-- Works for both anonymous (email only) and logged-in users.
-- -----------------------------------
create table public.restock_notifications (
  id                  uuid primary key default gen_random_uuid(),
  product_variant_id  uuid not null references public.product_variants(id) on delete cascade,
  email               text not null,
  user_id             uuid references public.profiles(id) on delete set null,
  notified_at         timestamptz,
  created_at          timestamptz not null default now(),
  constraint restock_notifications_variant_email_unique unique (product_variant_id, email)
);

-- -----------------------------------
-- 1.13 reviews
-- One review per verified buyer per product.
-- -----------------------------------
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  order_id    uuid not null references public.orders(id) on delete cascade,
  rating      smallint not null check (rating >= 1 and rating <= 5),
  body        text,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint reviews_product_user_unique unique (product_id, user_id)
);

-- -----------------------------------
-- 1.14 pinterest_pins (cache)
-- -----------------------------------
create table public.pinterest_pins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  pin_id      text not null,
  image_url   text not null,
  pin_title   text,
  fetched_at  timestamptz not null default now(),
  constraint pinterest_pins_user_pin_unique unique (user_id, pin_id)
);

-- -----------------------------------
-- 1.15 admin_audit_log
-- Append-only. No UPDATE or DELETE.
-- -----------------------------------
create table public.admin_audit_log (
  id            uuid primary key default gen_random_uuid(),
  admin_id      uuid not null references public.profiles(id),
  action        text not null,
  target_table  text not null,
  target_id     uuid not null,
  old_value     jsonb,
  new_value     jsonb,
  created_at    timestamptz not null default now()
);


-- =============================================================
-- STEP 2: INDEXES
-- =============================================================

create index products_category_id_idx     on public.products(category_id);
create index products_published_idx       on public.products(published);
create index products_created_at_idx      on public.products(created_at desc);

create index product_colours_product_id_idx    on public.product_colours(product_id);
create index product_images_colour_id_idx      on public.product_images(product_colour_id);
create index product_variants_colour_id_idx    on public.product_variants(product_colour_id);
create index product_variants_stock_idx        on public.product_variants(stock_quantity);

create index orders_user_id_idx               on public.orders(user_id);
create index orders_status_idx                on public.orders(status);
create index orders_created_at_idx            on public.orders(created_at desc);

create index order_items_order_id_idx         on public.order_items(order_id);
create index order_items_variant_id_idx       on public.order_items(product_variant_id);

create index cart_items_user_id_idx           on public.cart_items(user_id);

create index wishlist_items_user_id_idx       on public.wishlist_items(user_id);
create index wishlist_items_variant_id_idx    on public.wishlist_items(product_variant_id);

create index restock_notifications_variant_idx    on public.restock_notifications(product_variant_id);
create index restock_notifications_notified_idx   on public.restock_notifications(notified_at);

create index reviews_product_id_idx   on public.reviews(product_id);
create index reviews_visible_idx      on public.reviews(is_visible);

create index pinterest_pins_user_id_idx    on public.pinterest_pins(user_id);
create index pinterest_pins_fetched_idx    on public.pinterest_pins(fetched_at);


-- =============================================================
-- STEP 3: updated_at TRIGGERS (moddatetime extension)
-- =============================================================

create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row execute function extensions.moddatetime(updated_at);

create trigger handle_updated_at_products
  before update on public.products
  for each row execute function extensions.moddatetime(updated_at);

create trigger handle_updated_at_product_variants
  before update on public.product_variants
  for each row execute function extensions.moddatetime(updated_at);

create trigger handle_updated_at_orders
  before update on public.orders
  for each row execute function extensions.moddatetime(updated_at);


-- =============================================================
-- STEP 4: Auto-create profile on sign-up
-- =============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================
-- STEP 5: ROW LEVEL SECURITY
-- =============================================================

-- Enable RLS on all tables
alter table public.profiles               enable row level security;
alter table public.admin_users            enable row level security;
alter table public.categories             enable row level security;
alter table public.products               enable row level security;
alter table public.product_colours        enable row level security;
alter table public.product_images         enable row level security;
alter table public.product_variants       enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.cart_items             enable row level security;
alter table public.wishlist_items         enable row level security;
alter table public.restock_notifications  enable row level security;
alter table public.reviews                enable row level security;
alter table public.pinterest_pins         enable row level security;
alter table public.admin_audit_log        enable row level security;

-- ── Helper: is the current user an admin? ──────────────────
-- Used in RLS policies. Reads admin_users via service role — no recursion risk.
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;


-- ── profiles ──────────────────────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());


-- ── admin_users ──────────────────────────────────────────
-- No client-accessible policies — all access via service role.


-- ── categories ──────────────────────────────────────────
create policy "Anyone can read categories"
  on public.categories for select
  using (true);

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());


-- ── products ────────────────────────────────────────────
create policy "Anyone can read published products"
  on public.products for select
  using (published = true);

create policy "Admins can manage all products"
  on public.products for all
  using (public.is_admin());


-- ── product_colours ──────────────────────────────────────
create policy "Anyone can read colours of published products"
  on public.product_colours for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.published = true
    )
  );

create policy "Admins can manage product colours"
  on public.product_colours for all
  using (public.is_admin());


-- ── product_images ───────────────────────────────────────
create policy "Anyone can read images of published products"
  on public.product_images for select
  using (
    exists (
      select 1 from public.product_colours pc
      join public.products p on p.id = pc.product_id
      where pc.id = product_colour_id and p.published = true
    )
  );

create policy "Admins can manage product images"
  on public.product_images for all
  using (public.is_admin());


-- ── product_variants ─────────────────────────────────────
create policy "Anyone can read variants of published products"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.product_colours pc
      join public.products p on p.id = pc.product_id
      where pc.id = product_colour_id and p.published = true
    )
  );

create policy "Admins can manage product variants"
  on public.product_variants for all
  using (public.is_admin());


-- ── orders ───────────────────────────────────────────────
create policy "Users can view own orders"
  on public.orders for select
  using (user_id = auth.uid());

create policy "Admins can manage all orders"
  on public.orders for all
  using (public.is_admin());


-- ── order_items ──────────────────────────────────────────
create policy "Users can view items on own orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can manage all order items"
  on public.order_items for all
  using (public.is_admin());


-- ── cart_items ───────────────────────────────────────────
create policy "Users can manage own cart"
  on public.cart_items for all
  using (user_id = auth.uid());


-- ── wishlist_items ───────────────────────────────────────
create policy "Users can manage own wishlist"
  on public.wishlist_items for all
  using (user_id = auth.uid());

create policy "Admins can read all wishlists"
  on public.wishlist_items for select
  using (public.is_admin());


-- ── restock_notifications ────────────────────────────────
create policy "Anyone can register for restock notifications"
  on public.restock_notifications for insert
  with check (true);

create policy "Users can view and delete own notifications"
  on public.restock_notifications for select
  using (user_id = auth.uid());

create policy "Users can delete own notifications"
  on public.restock_notifications for delete
  using (user_id = auth.uid());

create policy "Admins can read all restock notifications"
  on public.restock_notifications for select
  using (public.is_admin());


-- ── reviews ──────────────────────────────────────────────
create policy "Anyone can read visible reviews"
  on public.reviews for select
  using (is_visible = true);

create policy "Verified buyers can insert reviews"
  on public.reviews for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      join public.product_variants pv on pv.id = oi.product_variant_id
      join public.product_colours pc on pc.id = pv.product_colour_id
      where o.user_id = auth.uid()
        and pc.product_id = product_id
        and o.status in ('paid','fulfilled','delivered')
    )
  );

create policy "Admins can manage all reviews"
  on public.reviews for all
  using (public.is_admin());


-- ── pinterest_pins ───────────────────────────────────────
create policy "Admins can read all pinterest pins"
  on public.pinterest_pins for select
  using (public.is_admin());

-- Server-side only: no client insert/update policies (service role handles writes)


-- ── admin_audit_log ──────────────────────────────────────
create policy "Admins can read audit log"
  on public.admin_audit_log for select
  using (public.is_admin());

-- Insert happens server-side via service role; no client insert policy.


-- =============================================================
-- STEP 6: SEED DATA — default categories
-- =============================================================

insert into public.categories (name, sort_order) values
  ('Tops',   0),
  ('Skirts', 1)
on conflict (name) do nothing;


-- =============================================================
-- DONE
-- After running this migration:
--   1. Verify all tables exist in Supabase dashboard (Table Editor)
--   2. Confirm RLS is enabled on each table (Auth → Policies)
--   3. Insert the admin_users row (see docs/setup/admin_user.sql)
--   4. Run: npx supabase gen types typescript --project-id nqiuxsmzccxiicxdlvnd > src/lib/database.types.ts
-- =============================================================
