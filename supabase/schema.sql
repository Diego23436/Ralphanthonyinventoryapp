-- =========================================================================
-- Ralph Anthony — Construction Materials & Equipment Tracking Platform
-- Core schema, derived directly from Section 5 (Entity-Relationship Model)
-- of the Cahier des Charges v2.0.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a
-- fresh project, in this order:
--   1. schema.sql        (this file — tables)
--   2. triggers.sql       (stock automation + low-stock alerts)
--   3. rls_policies.sql   (row-level security)
-- =========================================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- LEVEL (Niveau)
-- -------------------------------------------------------------------------
create table if not exists levels (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  description             text,
  start_date              date not null,
  estimated_finish_date   date
);

-- -------------------------------------------------------------------------
-- EQUIPMENT (Matériel / material)
-- -------------------------------------------------------------------------
create table if not exists materials (
  id                  uuid primary key default gen_random_uuid(),
  short_code          text unique,                 -- e.g. MAT-001, assigned by trigger below
  name                text not null,
  description         text,
  current_quantity    integer not null default 0,  -- trigger-maintained only, see triggers.sql
  minimum_threshold   integer not null default 0,
  is_archived         boolean not null default false,
  created_at          timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- USER (base) — mirrors auth.users, extended with app-level profile fields
-- -------------------------------------------------------------------------
create table if not exists users (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  role        text not null check (role in ('admin', 'storekeeper')),
  created_at  timestamptz not null default now()
);

-- ADMIN (subtype, 1:1 with users)
create table if not exists admins (
  id            uuid primary key references users (id) on delete cascade,
  access_level  text not null default 'standard' check (access_level in ('standard', 'super_admin'))
);

-- STOREKEEPER (subtype, 1:1 with users)
create table if not exists storekeepers (
  id             uuid primary key references users (id) on delete cascade,
  assigned_area  text,
  phone          text
);

-- -------------------------------------------------------------------------
-- STOCK_IN (Entrée / Livraison) — append-only ledger, see FR5
-- -------------------------------------------------------------------------
create table if not exists stock_in (
  id              uuid primary key default gen_random_uuid(),
  delivery_date   date not null,
  quantity        integer not null check (quantity > 0),
  material_id     uuid not null references materials (id),
  delivered_by    text not null,                       -- external supplier/courier, not a system user
  received_by_id  uuid not null references storekeepers (id),
  created_at      timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- STOCK_OUT (Sortie / Utilisation) — append-only ledger, see FR5
-- -------------------------------------------------------------------------
create table if not exists stock_out (
  id                uuid primary key default gen_random_uuid(),
  date              date not null,
  level_id          uuid not null references levels (id),
  material_id       uuid not null references materials (id),
  quantity          integer not null check (quantity > 0),
  performed_by_id   uuid not null references storekeepers (id),
  description       text,
  is_damaged        boolean not null default false,
  created_at        timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- NOTIFICATIONS — low-stock alerts (created by trigger, see triggers.sql)
-- -------------------------------------------------------------------------
create table if not exists notifications (
  id            uuid primary key default gen_random_uuid(),
  material_id   uuid not null references materials (id),
  message       text not null,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Helpful indexes for filtering/exporting history (FR7)
create index if not exists idx_stock_in_material_date on stock_in (material_id, delivery_date);
create index if not exists idx_stock_out_material_date on stock_out (material_id, date);
create index if not exists idx_materials_archived on materials (is_archived);
