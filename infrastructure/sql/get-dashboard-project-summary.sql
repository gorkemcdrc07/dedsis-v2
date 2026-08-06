create or replace function public.get_dashboard_project_summary(
    p_start_date date,
    p_end_date date
)
returns table (
    project_name text,
    shipment_count bigint,
    revenue numeric,
    expense numeric
)
language sql
stable
security invoker
set search_path = public
as $$
    select
        coalesce(
            nullif(trim(si.project_name), ''),
            'PROJESİZ'
        ) as project_name,

        count(
            distinct coalesce(
                si.legacy_shipment_id::text,
                si.legacy_income_expense_id::text,
                si.id::text
            )
        ) as shipment_count,

        coalesce(
            sum(si.sales_invoice_income),
            0
        ) as revenue,

        coalesce(
            sum(si.purchase_invoice_income),
            0
        ) as expense

    from public.shipment_imports si

    where si.despatch_date >= p_start_date
      and si.despatch_date <= p_end_date

    group by
        coalesce(
            nullif(trim(si.project_name), ''),
            'PROJESİZ'
        );
$$;

grant execute
on function public.get_dashboard_project_summary(date, date)
to authenticated, service_role;
