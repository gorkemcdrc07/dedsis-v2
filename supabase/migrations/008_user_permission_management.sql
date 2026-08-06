-- DEDSIS V2 - Kullanici bazli ekran ve islem yetkileri

create table if not exists public.v2_user_permissions (
  user_id uuid not null references public.v2_profiles(id) on delete cascade,
  permission_id uuid not null references public.v2_permissions(id) on delete cascade,
  is_allowed boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, permission_id)
);

insert into public.v2_permissions (code, name, module, description)
values
  ('screen.dashboard', 'Ana Panel', 'screens', 'Ana Panel ekranini gorebilir.'),
  ('screen.operations', 'Operasyon Kayitlari', 'screens', 'Operasyon Kayitlari ekranini gorebilir.'),
  ('screen.management', 'Yonetim', 'screens', 'Yonetim ekranini gorebilir.'),
  ('screen.accounting', 'Muhasebe', 'screens', 'Muhasebe ekranini gorebilir.'),
  ('screen.hr', 'Insan Kaynaklari', 'screens', 'Insan Kaynaklari ekranini gorebilir.'),
  ('screen.project_operations', 'Operasyon', 'screens', 'Proje Operasyon ekranini gorebilir.'),
  ('screen.evidea', 'Evidea', 'screens', 'Evidea ekranini gorebilir.'),
  ('screen.basbug', 'Basbug', 'screens', 'Basbug ekranini gorebilir.'),
  ('dashboard.detail', 'Proje detayini acma', 'dashboard', 'Ana Panel proje detaylarini acabilir.'),
  ('dashboard.export', 'Rapor disari aktarma', 'dashboard', 'Ana Panel raporlarini disari aktarabilir.'),
  ('operations.detail', 'Operasyon detayi', 'operations', 'Operasyon kaydi detayini gorebilir.'),
  ('operations.export', 'Operasyon disari aktarma', 'operations', 'Operasyon listesini disari aktarabilir.'),
  ('accounting.import', 'Muhasebe ice aktarma', 'accounting', 'Muhasebe dosyasi yukleyebilir.'),
  ('accounting.assign', 'Muhasebe atama', 'accounting', 'Muhasebe kayitlarini projelere atayabilir.'),
  ('accounting.edit', 'Muhasebe duzenleme', 'accounting', 'Muhasebe kayitlarini duzenleyebilir.'),
  ('accounting.delete', 'Muhasebe silme', 'accounting', 'Muhasebe kayitlarini silebilir.'),
  ('accounting.export', 'Muhasebe disari aktarma', 'accounting', 'Muhasebe raporlarini disari aktarabilir.'),
  ('hr.import', 'IK ice aktarma', 'hr', 'IK dosyasi yukleyebilir.'),
  ('hr.assign', 'IK atama', 'hr', 'IK kayitlarini projelere atayabilir.'),
  ('hr.edit', 'IK duzenleme', 'hr', 'IK kayitlarini duzenleyebilir.'),
  ('hr.delete', 'IK silme', 'hr', 'IK kayitlarini silebilir.'),
  ('hr.export', 'IK disari aktarma', 'hr', 'IK raporlarini disari aktarabilir.'),
  ('evidea.create', 'Evidea kaydi ekleme', 'evidea', 'Evidea kaydi ekleyebilir.'),
  ('evidea.edit', 'Evidea kaydi duzenleme', 'evidea', 'Evidea kaydini duzenleyebilir.'),
  ('evidea.delete', 'Evidea kaydi silme', 'evidea', 'Evidea kaydini silebilir.'),
  ('evidea.export', 'Evidea disari aktarma', 'evidea', 'Evidea listesini disari aktarabilir.'),
  ('basbug.create', 'Basbug kaydi ekleme', 'basbug', 'Basbug kaydi ekleyebilir.'),
  ('basbug.edit', 'Basbug kaydi duzenleme', 'basbug', 'Basbug kaydini duzenleyebilir.'),
  ('basbug.delete', 'Basbug kaydi silme', 'basbug', 'Basbug kaydini silebilir.'),
  ('basbug.export', 'Basbug disari aktarma', 'basbug', 'Basbug listesini disari aktarabilir.')
on conflict (code) do update set
  name = excluded.name,
  module = excluded.module,
  description = excluded.description;

insert into public.v2_role_permissions (role_id, permission_id)
select role.id, permission.id
from public.v2_roles role
cross join public.v2_permissions permission
where role.code = 'super_admin'
on conflict do nothing;

alter table public.v2_user_permissions enable row level security;

create index if not exists v2_user_permissions_user_id_idx
  on public.v2_user_permissions(user_id);

