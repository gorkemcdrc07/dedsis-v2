-- =========================================================
-- DEDSİS V2 - Employee Project Architecture
-- =========================================================


-- ---------------------------------------------------------
-- Operasyon personeli
-- ---------------------------------------------------------

create table if not exists public.v2_employees (

    id bigint generated always as identity primary key,

    legacy_user_id bigint unique,

    username text,

    full_name text not null,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);



create index if not exists
idx_v2_employees_legacy
on public.v2_employees(legacy_user_id);



-- ---------------------------------------------------------
-- Personel proje yetkileri
-- ---------------------------------------------------------

create table if not exists public.v2_employee_projects (

    id bigint generated always as identity primary key,


    employee_id bigint not null
        references public.v2_employees(id)
        on delete cascade,


    project_id bigint not null
        references public.v2_projects(id)
        on delete cascade,


    percentage numeric(5,2)
        not null default 0,


    created_at timestamptz not null default now(),


    updated_at timestamptz not null default now(),


    unique(employee_id, project_id)
);



create index if not exists
idx_v2_employee_projects_employee
on public.v2_employee_projects(employee_id);



create index if not exists
idx_v2_employee_projects_project
on public.v2_employee_projects(project_id);



-- ---------------------------------------------------------
-- Eski kullanıcıları aktar
-- ---------------------------------------------------------

insert into public.v2_employees
(
    legacy_user_id,
    username,
    full_name
)

select
    id,
    kullanici,
    kullanici_adi

from public.kullanicilar

where durum = 'aktif'

on conflict (legacy_user_id)
do update set

full_name = excluded.full_name;



-- ---------------------------------------------------------
-- Eski proje dağılımlarını aktar
-- ---------------------------------------------------------

insert into public.v2_employee_projects
(
    employee_id,
    project_id,
    percentage
)

select
    employee_id,
    project_id,
    percentage

from
(
    select

        e.id as employee_id,

        p.id as project_id,

        d.dagilim_yuzde as percentage,

        row_number() over (
            partition by
                e.id,
                p.id

            order by
                d.id desc
        ) as rn


    from public.kullanici_proje_dagilim d


    join public.v2_employees e
        on e.legacy_user_id = d.kullanici_id


    join public.projeler old_p
        on old_p.id = d.proje_id


    join public.v2_projects p
        on p.code = upper(old_p.proje_adi)

) x

where rn = 1


on conflict(employee_id, project_id)

do update set

percentage = excluded.percentage;