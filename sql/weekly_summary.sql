with bounds as (
  select
    date_trunc('week', current_date)::date as current_week_start,
    (date_trunc('week', current_date) - interval '7 days')::date as previous_week_start
)
select
  (
    select coalesce(sum(o.total_amount), 0)
    from orders o, bounds b
    where o.created_at >= b.current_week_start
      and o.created_at < b.current_week_start + interval '7 days'
  ) as total_sales,
  (
    select coalesce(sum(o.total_amount), 0)
    from orders o, bounds b
    where o.created_at >= b.previous_week_start
      and o.created_at < b.current_week_start
  ) as previous_total_sales,
  (
    select count(*)
    from users u, bounds b
    where u.created_at >= b.current_week_start
      and u.created_at < b.current_week_start + interval '7 days'
  ) as new_users,
  (
    select count(*)
    from users u, bounds b
    where u.created_at >= b.previous_week_start
      and u.created_at < b.current_week_start
  ) as previous_new_users,
  (
    select coalesce(
      round(
        (
          count(*) filter (where s.status = 'cancelled')::numeric
          / nullif(count(*), 0)
        ) * 100,
        2
      ),
      0
    )
    from subscriptions s, bounds b
    where s.updated_at >= b.current_week_start
      and s.updated_at < b.current_week_start + interval '7 days'
  ) as churn_rate,
  (
    select coalesce(
      round(
        (
          count(*) filter (where s.status = 'cancelled')::numeric
          / nullif(count(*), 0)
        ) * 100,
        2
      ),
      0
    )
    from subscriptions s, bounds b
    where s.updated_at >= b.previous_week_start
      and s.updated_at < b.current_week_start
  ) as previous_churn_rate,
  (
    select count(*)
    from orders o, bounds b
    where o.created_at >= b.current_week_start
      and o.created_at < b.current_week_start + interval '7 days'
  ) as order_count;
