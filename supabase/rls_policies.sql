-- =========================================================================
-- Row-Level Security — Section 7.4 (Security & Access Control)
-- Apply after schema.sql and triggers.sql
--
-- Model: Admins get full access. Storekeepers can read materials, create
-- stock_in/stock_out rows, and read their own data. Nobody can UPDATE/DELETE
-- stock_in or stock_out (also enforced by triggers.sql as defense in depth).
-- =========================================================================

alter table levels enable row level security;
alter table materials enable row level security;
alter table users enable row level security;
alter table admins enable row level security;
alter table storekeepers enable row level security;
alter table stock_in enable row level security;
alter table stock_out enable row level security;
alter table notifications enable row level security;

-- Helper: is the current authenticated user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  );
$$ language sql stable;

-- ---- levels ----
drop policy if exists "levels: read for authenticated users" on levels;
create policy "levels: read for authenticated users"
  on levels for select using (auth.role() = 'authenticated');
drop policy if exists "levels: write for admins only" on levels;
drop policy if exists "levels: insert for authenticated users" on levels;
create policy "levels: insert for authenticated users"
  on levels for insert with check (auth.role() = 'authenticated');
drop policy if exists "levels: update for admins only" on levels;
create policy "levels: update for admins only"
  on levels for update using (is_admin());

-- ---- materials ----
drop policy if exists "materials: read for authenticated users" on materials;
create policy "materials: read for authenticated users"
  on materials for select using (auth.role() = 'authenticated');
drop policy if exists "materials: insert for authenticated users" on materials;
create policy "materials: insert for authenticated users"
  on materials for insert with check (auth.role() = 'authenticated');
drop policy if exists "materials: update name/description/threshold, any authenticated user" on materials;
create policy "materials: update name/description/threshold, any authenticated user"
  on materials for update using (auth.role() = 'authenticated');
drop policy if exists "materials: archive/delete for admins only" on materials;
create policy "materials: archive/delete for admins only"
  on materials for delete using (is_admin());

-- ---- users / admins / storekeepers ----
drop policy if exists "users: read own row, admins read all" on users;
create policy "users: read own row, admins read all"
  on users for select using (id = auth.uid() or is_admin());
drop policy if exists "users: admins manage accounts" on users;
create policy "users: admins manage accounts"
  on users for insert with check (is_admin());
drop policy if exists "users: admins update accounts" on users;
create policy "users: admins update accounts"
  on users for update using (is_admin());

drop policy if exists "admins: readable by admins" on admins;
create policy "admins: readable by admins"
  on admins for select using (is_admin());
drop policy if exists "storekeepers: readable by admins and self" on storekeepers;
create policy "storekeepers: readable by admins and self"
  on storekeepers for select using (id = auth.uid() or is_admin());

-- ---- stock_in ----
drop policy if exists "stock_in: read for authenticated users" on stock_in;
create policy "stock_in: read for authenticated users"
  on stock_in for select using (auth.role() = 'authenticated');
drop policy if exists "stock_in: insert for authenticated users" on stock_in;
create policy "stock_in: insert for authenticated users"
  on stock_in for insert with check (auth.role() = 'authenticated');
-- No UPDATE/DELETE policy is defined -> denied by default, reinforced by
-- the block_ledger_mutation trigger in triggers.sql.

-- ---- stock_out ----
drop policy if exists "stock_out: read for authenticated users" on stock_out;
create policy "stock_out: read for authenticated users"
  on stock_out for select using (auth.role() = 'authenticated');
drop policy if exists "stock_out: insert for authenticated users" on stock_out;
create policy "stock_out: insert for authenticated users"
  on stock_out for insert with check (auth.role() = 'authenticated');

-- ---- notifications ----
drop policy if exists "notifications: read for authenticated users" on notifications;
drop policy if exists "notifications: read for admins only" on notifications;
create policy "notifications: read for admins only"
  on notifications for select using (is_admin());
drop policy if exists "notifications: mark read, authenticated users" on notifications;
drop policy if exists "notifications: mark read, admins only" on notifications;
create policy "notifications: mark read, admins only"
  on notifications for update using (is_admin());

-- NOTE ON TRANSACTION HISTORY SCREEN (admin-only in the UX spec):
-- storekeepers can technically SELECT from stock_in/stock_out under these
-- policies (needed so their own Dashboard/Material Management views work).
-- The "admin only" boundary for the full Transaction History *screen* is
-- enforced in the frontend (see src/routes/AdminRoute.jsx). If a stricter
-- server-side boundary is required later, split a narrower admin-only view
-- (e.g. `transaction_history_full`) from the general-purpose read access
-- storekeepers need for their own dashboard.
