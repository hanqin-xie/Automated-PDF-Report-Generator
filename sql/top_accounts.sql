with bounds as (
  select date_trunc('week', current_date)::date as current_week_start
)
select
  a.name,
  coalesce(sum(o.total_amount), 0) as revenue,
  count(o.id) as orders,
  coalesce(a.region, 'Unknown') as region
from orders o
join accounts a on a.id = o.account_id
cross join bounds b
where o.created_at >= b.current_week_start
  and o.created_at < b.current_week_start + interval '7 days'
group by a.id, a.name, a.region
order by revenue desc
limit 8;
