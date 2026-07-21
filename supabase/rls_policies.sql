-- =========================================================================
-- Row-Level Security
-- Apply after schema.sql and triggers.sql
-- =========================================================================

alter table levels enable row level security;
alter table materials enable row level security;
alter table users enable row level security;
alter table stock_in enable row level security;
alter table stock_out enable row level security;
alter table notifications enable row level security;

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  );
$$ language sql stable;

drop policy if exists "levels: read for authenticated users" on levels;
create policy "levels: read for authenticated users"
  on levels for select using (auth.role() = 'authenticated');
drop policy if exists "levels: insert for authenticated users" on levels;
create policy "levels: insert for authenticated users"
  on levels for insert with check (auth.role() = 'authenticated');
drop policy if exists "levels: update for admins only" on levels;
create policy "levels: update for admins only"
  on levels for update using (is_admin());

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

drop policy if exists "users: read own row, admins read all" on users;
create policy "users: read own row, admins read all"
  on users for select using (id = auth.uid() or is_admin());
drop policy if exists "users: admins manage accounts" on users;
create policy "users: admins manage accounts"
  on users for insert with check (is_admin());
drop policy if exists "users: admins update accounts" on users;
create policy "users: admins update accounts"
  on users for update using (is_admin());

drop policy if exists "stock_in: read for authenticated users" on stock_in;
create policy "stock_in: read for authenticated users"
  on stock_in for select using (auth.role() = 'authenticated');
drop policy if exists "stock_in: insert for authenticated users" on stock_in;
create policy "stock_in: insert for authenticated users"
  on stock_in for insert with check (auth.role() = 'authenticated');

drop policy if exists "stock_out: read for authenticated users" on stock_out;
create policy "stock_out: read for authenticated users"
  on stock_out for select using (auth.role() = 'authenticated');
drop policy if exists "stock_out: insert for authenticated users" on stock_out;
create policy "stock_out: insert for authenticated users"
  on stock_out for insert with check (auth.role() = 'authenticated');

drop policy if exists "notifications: read for admins only" on notifications;
create policy "notifications: read for admins only"
  on notifications for select using (is_admin());
drop policy if exists "notifications: mark read, admins only" on notifications;
create policy "notifications: mark read, admins only"
  on notifications for update using (is_admin());

