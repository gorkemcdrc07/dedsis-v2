-- =========================================================
-- DEDSİS V2 - Kullanıcı Proje Dağılım Yetkileri
-- =========================================================

create table if not exists public.v2_projects (
    id bigint generated always as identity primary key,

    name text not null unique,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


create table if not exists public.v2_user_project_distributions (

    id bigint generated always as identity primary key,

    user_id uuid not null
        references public.v2_profiles(id)
        on delete cascade,

    project_id bigint not null
        references public.v2_projects(id)
        on delete cascade,

    percentage numeric(5,2)
        not null default 0,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique(user_id, project_id)
);


create index if not exists idx_v2_user_project_user
on public.v2_user_project_distributions(user_id);


create index if not exists idx_v2_user_project_project
on public.v2_user_project_distributions(project_id);



drop trigger if exists v2_projects_set_updated_at
on public.v2_projects;

create trigger v2_projects_set_updated_at
before update on public.v2_projects
for each row
execute function public.v2_set_updated_at();



drop trigger if exists v2_user_project_distribution_set_updated_at
on public.v2_user_project_distributions;

create trigger v2_user_project_distribution_set_updated_at
before update on public.v2_user_project_distributions
for each row
execute function public.v2_set_updated_at();