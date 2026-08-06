-- =========================================================
-- DEDSİS V2 - Import Legacy Projects
-- =========================================================


insert into public.v2_projects
(
    code,
    name,
    display_name
)

select
    code,
    name,
    display_name

from
(
    select
        upper(proje_adi) as code,
        proje_adi as name,
        coalesce(
            reel_proje_adi,
            proje_adi
        ) as display_name,

        row_number() over (
            partition by upper(proje_adi)
            order by id
        ) as rn

    from public.projeler

    where proje_adi is not null

) x

where rn = 1

on conflict (code)
do update set

name = excluded.name,
display_name = excluded.display_name;