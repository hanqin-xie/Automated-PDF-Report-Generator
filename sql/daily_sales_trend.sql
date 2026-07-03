with bounds as (
  select date_trunc('week', current_date)::date as current_week_start
),
days as (
  select generate_series(
    (select current_week_start from bounds),
    (select current_week_start from bounds) + interval '6 days',
    interval '1 day'
  )::date as sales_day
)
select
  to_char(d.sales_day, 'Dy') as label,
  coalesce(sum(o.total_amount), 0) as value
from days d
left join orders o
  on o.created_at >= d.sales_day
 and o.created_at < d.sales_day + interval '1 day'
group by d.sales_day
order by d.sales_day;
