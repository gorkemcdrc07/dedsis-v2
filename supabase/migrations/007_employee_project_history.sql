-- =========================================================
-- DEDSİS V2 - Employee Project Change History
-- =========================================================


create table if not exists public.v2_employee_project_history
(
    id bigint generated always as identity primary key,

    employee_id bigint not null
        references public.v2_employees(id)
        on delete cascade,

    project_id bigint not null
        references public.v2_projects(id)
        on delete cascade,


    old_percentage numeric(5,2),

    new_percentage numeric(5,2),


    changed_by bigint
        references public.v2_employees(id),


    created_at timestamptz default now()
);


create index if not exists idx_employee_project_history_employee
on public.v2_employee_project_history(employee_id);


create index if not exists idx_employee_project_history_project
on public.v2_employee_project_history(project_id);