-- v1.7 (2026-08-21): 퍼널 측정 + 유형 통계 + 실시간

-- ① 이벤트 테이블 — 익명은 기록만 가능, 조회는 관리자만
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null check (char_length(session_id) <= 64),
  event text not null check (char_length(event) <= 40),
  meta jsonb,
  created_at timestamp with time zone default now()
);
alter table events enable row level security;

create policy "익명 이벤트 기록"
  on events for insert
  with check (true);

create policy "관리자만 이벤트 조회"
  on events for select
  to authenticated
  using ((select auth.jwt() ->> 'email') in (select email from admins));

create index if not exists events_created_idx on events (created_at);
create index if not exists events_event_idx on events (event);

-- ② 유형 분포 집계 — 익명도 "집계 결과만" 볼 수 있게 security definer 함수로
create or replace function type_stats()
returns table (type_id text, cnt bigint)
language sql
security definer
set search_path = public
as $$
  select meta->>'type' as type_id, count(*) as cnt
  from events
  where event = 'quiz_complete' and meta->>'type' is not null
  group by 1;
$$;
grant execute on function type_stats() to anon;

-- ③ 실시간: messages 변경(INSERT/DELETE)을 실시간 브로드캐스트
do $$ begin
  alter publication supabase_realtime add table messages;
exception when duplicate_object then null; end $$;
