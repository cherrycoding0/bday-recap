-- v1.8 (2026-08-21): 사진드컵 명예의 전당 집계
create or replace function worldcup_ranks()
returns table (photo text, wins bigint)
language sql
security definer
set search_path = public
as $$
  select meta->>'winner' as photo, count(*) as wins
  from events
  where event = 'worldcup_complete' and meta->>'winner' is not null
  group by 1
  order by wins desc, max(created_at) desc
  limit 10;
$$;
grant execute on function worldcup_ranks() to anon;
