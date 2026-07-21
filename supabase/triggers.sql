-- =========================================================================
-- Business rules & automation
-- Apply after schema.sql
-- =========================================================================

create sequence if not exists materials_short_code_seq;

create or replace function assign_material_short_code()
returns trigger as $$
begin
  if new.short_code is null then
    new.short_code := 'MAT-' || lpad(nextval('materials_short_code_seq')::text, 3, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_assign_material_short_code on materials;
create trigger trg_assign_material_short_code
  before insert on materials
  for each row execute function assign_material_short_code();

create or replace function increment_material_quantity()
returns trigger as $$
begin
  update materials
    set current_quantity = current_quantity + new.quantity
    where id = new.material_id;
  perform check_low_stock(new.material_id);
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_stock_in_increment on stock_in;
create trigger trg_stock_in_increment
  after insert on stock_in
  for each row execute function increment_material_quantity();

create or replace function decrement_material_quantity()
returns trigger as $$
declare
  available integer;
begin
  select current_quantity into available from materials where id = new.material_id;

  if available < new.quantity then
    raise exception 'Insufficient stock: % available, % requested', available, new.quantity;
  end if;

  update materials
    set current_quantity = current_quantity - new.quantity
    where id = new.material_id;
  perform check_low_stock(new.material_id);
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_stock_out_decrement on stock_out;
create trigger trg_stock_out_decrement
  after insert on stock_out
  for each row execute function decrement_material_quantity();

create or replace function check_low_stock(p_material_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m materials%rowtype;
begin
  select * into m from materials where id = p_material_id;

  if m.minimum_threshold > 0 and m.current_quantity <= m.minimum_threshold then
    insert into notifications (material_id, message)
    select
      m.id,
      m.name || ' needs stock. Current quantity is ' || m.current_quantity || ', threshold is ' || m.minimum_threshold || '.'
    where not exists (
      select 1
      from notifications
      where material_id = m.id
        and is_read = false
    );
  end if;
end;
$$;

drop trigger if exists trg_material_low_stock_check on materials;
create or replace function check_material_low_stock_after_change()
returns trigger as $$
begin
  perform check_low_stock(new.id);
  return new;
end;
$$ language plpgsql;

create trigger trg_material_low_stock_check
  after insert or update of current_quantity, minimum_threshold on materials
  for each row execute function check_material_low_stock_after_change();

create or replace function block_ledger_mutation()
returns trigger as $$
begin
  raise exception 'stock_in/stock_out rows are append-only and cannot be updated or deleted';
end;
$$ language plpgsql;

drop trigger if exists trg_block_stock_in_mutation on stock_in;
create trigger trg_block_stock_in_mutation
  before update or delete on stock_in
  for each row execute function block_ledger_mutation();

drop trigger if exists trg_block_stock_out_mutation on stock_out;
create trigger trg_block_stock_out_mutation
  before update or delete on stock_out
  for each row execute function block_ledger_mutation();

create or replace function enforce_user_subtype()
returns trigger as $$
begin
  insert into admins (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_enforce_user_subtype on users;
create trigger trg_enforce_user_subtype
  after insert on users
  for each row execute function enforce_user_subtype();

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)),
    'admin'
  )
  on conflict (id) do update
    set name = excluded.name,
        role = excluded.role;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();
