-- =========================================================================
-- Ralph Anthony - Construction Materials & Equipment Tracking Platform
-- Core schema
-- =========================================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- LEVEL (Niveau)
-- -------------------------------------------------------------------------
create table if not exists levels (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  description           text,
  start_date            date not null,
  estimated_finish_date date
);

-- -------------------------------------------------------------------------
-- MATERIAL (Equipment / material)
-- -------------------------------------------------------------------------
create table if not exists materials (
  id                uuid primary key default gen_random_uuid(),
  short_code        text unique,
  name              text not null,
  description       text,
  current_quantity  integer not null default 0,
  minimum_threshold integer not null default 0,
  is_archived       boolean not null default false,
  created_at        timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- USER profile
-- -------------------------------------------------------------------------
create table if not exists users (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null,
  role       text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create table if not exists admins (
  id           uuid primary key references users (id) on delete cascade,
  access_level  text not null default 'standard' check (access_level in ('standard', 'super_admin'))
);

-- -------------------------------------------------------------------------
-- STOCK IN
-- -------------------------------------------------------------------------
create table if not exists stock_in (
  id             uuid primary key default gen_random_uuid(),
  delivery_date  date not null,
  quantity       integer not null check (quantity > 0),
  material_id    uuid not null references materials (id),
  delivered_by   text not null,
  received_by_id uuid not null references users (id),
  created_at     timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- STOCK OUT
-- -------------------------------------------------------------------------
create table if not exists stock_out (
  id               uuid primary key default gen_random_uuid(),
  date             date not null,
  level_id         uuid not null references levels (id),
  material_id      uuid not null references materials (id),
  quantity         integer not null check (quantity > 0),
  performed_by_id   uuid not null references users (id),
  description      text,
  is_damaged       boolean not null default false,
  created_at       timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- NOTIFICATIONS
-- -------------------------------------------------------------------------
create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  material_id  uuid not null references materials (id),
  message      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists idx_stock_in_material_date on stock_in (material_id, delivery_date);
create index if not exists idx_stock_out_material_date on stock_out (material_id, date);
create index if not exists idx_materials_archived on materials (is_archived);
