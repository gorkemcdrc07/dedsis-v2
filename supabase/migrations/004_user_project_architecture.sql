-- =========================================================
-- DEDSİS V2 - User Project Architecture
-- =========================================================


-- ---------------------------------------------------------
-- Proje master tablosu
-- ---------------------------------------------------------

alter table public.v2_projects
add column if not exists code text;

alter table public.v2_projects
add column if not exists display_name text;


update public.v2_projects
set
    display_name = coalesce(display_name, name),
    code = coalesce(
        code,
        upper(
            regexp_replace(
                name,
                '[^a-zA-Z0-9]+',
                '_',
                'g'
            )
        )
    )
where
    code is null
    or display_name is null;


create unique index if not exists
idx_v2_projects_code_unique
on public.v2_projects(code);



-- ---------------------------------------------------------
-- Kullanıcı Proje Yetkileri
-- ---------------------------------------------------------

create table if not exists public.v2_user_projects (

    id bigint generated always as identity primary key,


    user_id uuid not null
        references public.v2_profiles(id)
        on delete cascade,


    project_id bigint not null
        references public.v2_projects(id)
        on delete cascade,


    access_level text not null
        default 'viewer'
        check (
            access_level in (
                'viewer',
                'operator',
                'manager'
            )
        ),


    percentage numeric(5,2)
        not null
        default 0,


    created_at timestamptz
        not null
        default now(),


    updated_at timestamptz
        not null
        default now(),


    unique(user_id, project_id)
);



create index if not exists
idx_v2_user_projects_user
on public.v2_user_projects(user_id);



create index if not exists
idx_v2_user_projects_project
on public.v2_user_projects(project_id);



drop trigger if exists
v2_user_projects_set_updated_at
on public.v2_user_projects;


create trigger
v2_user_projects_set_updated_at

before update
on public.v2_user_projects

for each row

execute function public.v2_set_updated_at();



-- ---------------------------------------------------------
-- Eski dağılım tablosundan geçici veri taşıma
-- (şimdilik boş bırakıyoruz)
-- ---------------------------------------------------------
