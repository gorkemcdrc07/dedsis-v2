-- =========================================================
-- DEDSİS V2 - Kullanıcı, Rol ve Yetkilendirme Altyapısı
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- Kullanıcı profilleri
-- Supabase auth.users tablosuna bağlıdır.
-- ---------------------------------------------------------
create table if not exists public.v2_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Roller
-- ---------------------------------------------------------
create table if not exists public.v2_roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Yetkiler
-- ---------------------------------------------------------
create table if not exists public.v2_permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  module text not null,
  description text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Rol - Yetki ilişkisi
-- ---------------------------------------------------------
create table if not exists public.v2_role_permissions (
  role_id uuid not null references public.v2_roles(id) on delete cascade,
  permission_id uuid not null references public.v2_permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

-- ---------------------------------------------------------
-- Kullanıcı - Rol ilişkisi
-- ---------------------------------------------------------
create table if not exists public.v2_user_roles (
  user_id uuid not null references public.v2_profiles(id) on delete cascade,
  role_id uuid not null references public.v2_roles(id) on delete cascade,
  assigned_by uuid references public.v2_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- ---------------------------------------------------------
-- İşlem kayıtları
-- ---------------------------------------------------------
create table if not exists public.v2_audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.v2_profiles(id) on delete set null,
  action text not null,
  module text not null,
  entity_type text,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- updated_at otomatik güncelleme fonksiyonu
-- ---------------------------------------------------------
create or replace function public.v2_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists v2_profiles_set_updated_at
on public.v2_profiles;

create trigger v2_profiles_set_updated_at
before update on public.v2_profiles
for each row
execute function public.v2_set_updated_at();

drop trigger if exists v2_roles_set_updated_at
on public.v2_roles;

create trigger v2_roles_set_updated_at
before update on public.v2_roles
for each row
execute function public.v2_set_updated_at();

-- ---------------------------------------------------------
-- Yeni Supabase Auth kullanıcısı oluşunca profil oluştur
-- ---------------------------------------------------------
create or replace function public.v2_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.v2_profiles (
    id,
    email,
    full_name
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;

  insert into public.v2_user_roles (
    user_id,
    role_id
  )
  select
    new.id,
    role.id
  from public.v2_roles role
  where role.code = 'user'
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.v2_handle_new_user();

-- ---------------------------------------------------------
-- Yetki kontrol fonksiyonu
-- ---------------------------------------------------------
create or replace function public.v2_has_permission(
  requested_permission text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.v2_user_roles ur
    join public.v2_roles r
      on r.id = ur.role_id
    join public.v2_role_permissions rp
      on rp.role_id = r.id
    join public.v2_permissions p
      on p.id = rp.permission_id
    join public.v2_profiles profile
      on profile.id = ur.user_id
    where ur.user_id = auth.uid()
      and profile.is_active = true
      and r.is_active = true
      and p.code = requested_permission
  );
$$;

-- ---------------------------------------------------------
-- Başlangıç rolleri
-- ---------------------------------------------------------
insert into public.v2_roles (
  code,
  name,
  description,
  is_system
)
values
  (
    'super_admin',
    'Süper Yönetici',
    'Sistemdeki tüm yetkilere sahiptir.',
    true
  ),
  (
    'admin',
    'Yönetici',
    'Kullanıcı ve sistem yönetimi yetkilerine sahiptir.',
    true
  ),
  (
    'user',
    'Kullanıcı',
    'Standart sistem kullanıcısıdır.',
    true
  )
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system;

-- ---------------------------------------------------------
-- Başlangıç yetkileri
-- ---------------------------------------------------------
insert into public.v2_permissions (
  code,
  name,
  module,
  description
)
values
  (
    'dashboard.view',
    'Dashboard görüntüleme',
    'dashboard',
    'Ana gösterge panelini görüntüleyebilir.'
  ),
  (
    'users.view',
    'Kullanıcıları görüntüleme',
    'users',
    'Kullanıcı listesini görüntüleyebilir.'
  ),
  (
    'users.create',
    'Kullanıcı oluşturma',
    'users',
    'Yeni kullanıcı oluşturabilir.'
  ),
  (
    'users.update',
    'Kullanıcı güncelleme',
    'users',
    'Kullanıcı bilgilerini güncelleyebilir.'
  ),
  (
    'users.roles.manage',
    'Kullanıcı rollerini yönetme',
    'users',
    'Kullanıcılara rol atayabilir veya kaldırabilir.'
  ),
  (
    'roles.view',
    'Rolleri görüntüleme',
    'roles',
    'Rol ve yetki yapılandırmasını görüntüleyebilir.'
  ),
  (
    'roles.manage',
    'Rolleri yönetme',
    'roles',
    'Rol ve yetki yapılandırmasını değiştirebilir.'
  ),
  (
    'audit.view',
    'İşlem kayıtlarını görüntüleme',
    'audit',
    'Sistem işlem kayıtlarını görüntüleyebilir.'
  )
on conflict (code) do update
set
  name = excluded.name,
  module = excluded.module,
  description = excluded.description;

-- Süper yöneticiye bütün yetkileri ver.
insert into public.v2_role_permissions (
  role_id,
  permission_id
)
select
  role.id,
  permission.id
from public.v2_roles role
cross join public.v2_permissions permission
where role.code = 'super_admin'
on conflict do nothing;

-- Yönetici yetkileri
insert into public.v2_role_permissions (
  role_id,
  permission_id
)
select
  role.id,
  permission.id
from public.v2_roles role
join public.v2_permissions permission
  on permission.code in (
    'dashboard.view',
    'users.view',
    'users.create',
    'users.update',
    'users.roles.manage',
    'roles.view',
    'audit.view'
  )
where role.code = 'admin'
on conflict do nothing;

-- Standart kullanıcı yetkileri
insert into public.v2_role_permissions (
  role_id,
  permission_id
)
select
  role.id,
  permission.id
from public.v2_roles role
join public.v2_permissions permission
  on permission.code in (
    'dashboard.view'
  )
where role.code = 'user'
on conflict do nothing;

-- ---------------------------------------------------------
-- RLS
-- ---------------------------------------------------------
alter table public.v2_profiles enable row level security;
alter table public.v2_roles enable row level security;
alter table public.v2_permissions enable row level security;
alter table public.v2_role_permissions enable row level security;
alter table public.v2_user_roles enable row level security;
alter table public.v2_audit_logs enable row level security;

-- Kullanıcı kendi profilini görebilir.
drop policy if exists "v2_profiles_select_own"
on public.v2_profiles;

create policy "v2_profiles_select_own"
on public.v2_profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.v2_has_permission('users.view')
);

-- Kullanıcı kendi profilini güncelleyebilir.
drop policy if exists "v2_profiles_update_own"
on public.v2_profiles;

create policy "v2_profiles_update_own"
on public.v2_profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.v2_has_permission('users.update')
)
with check (
  id = auth.uid()
  or public.v2_has_permission('users.update')
);

-- Giriş yapan kullanıcılar aktif rolleri görebilir.
drop policy if exists "v2_roles_select_authenticated"
on public.v2_roles;

create policy "v2_roles_select_authenticated"
on public.v2_roles
for select
to authenticated
using (
  is_active = true
);

-- Giriş yapan kullanıcılar yetki listesini görebilir.
drop policy if exists "v2_permissions_select_authenticated"
on public.v2_permissions;

create policy "v2_permissions_select_authenticated"
on public.v2_permissions
for select
to authenticated
using (true);

-- Kullanıcı kendi rollerini veya yetkili olduğu kullanıcıların rollerini görebilir.
drop policy if exists "v2_user_roles_select"
on public.v2_user_roles;

create policy "v2_user_roles_select"
on public.v2_user_roles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.v2_has_permission('users.view')
);

-- Rol-yetki ilişkileri görüntülenebilir.
drop policy if exists "v2_role_permissions_select"
on public.v2_role_permissions;

create policy "v2_role_permissions_select"
on public.v2_role_permissions
for select
to authenticated
using (true);

-- Audit kayıtlarını yalnızca yetkili kişiler görebilir.
drop policy if exists "v2_audit_logs_select"
on public.v2_audit_logs;

create policy "v2_audit_logs_select"
on public.v2_audit_logs
for select
to authenticated
using (
  public.v2_has_permission('audit.view')
);

-- Faydalı indeksler
create index if not exists v2_profiles_email_idx
  on public.v2_profiles(email);

create index if not exists v2_user_roles_user_id_idx
  on public.v2_user_roles(user_id);

create index if not exists v2_user_roles_role_id_idx
  on public.v2_user_roles(role_id);

create index if not exists v2_audit_logs_user_id_idx
  on public.v2_audit_logs(user_id);

create index if not exists v2_audit_logs_created_at_idx
  on public.v2_audit_logs(created_at desc);
