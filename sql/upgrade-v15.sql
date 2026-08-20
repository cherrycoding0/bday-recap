-- v1.5 마이그레이션: 순번(seq) + 하트(hearts)
-- Supabase SQL Editor에서 실행 (schema.sql 실행 이후)

-- 순번: "#0134번째 원도어" 각인용. 자동 증가.
alter table messages add column if not exists seq bigint generated always as identity;

-- 하트 수
alter table messages add column if not exists hearts int not null default 0;

-- 하트는 "1씩 증가"만 허용 — 익명 사용자가 messages를 직접 update 못 하게
-- security definer 함수로만 열어준다.
create or replace function heart_message(mid uuid)
returns int
language sql
security definer
set search_path = public
as $$
  update messages set hearts = hearts + 1 where id = mid returning hearts;
$$;

grant execute on function heart_message(uuid) to anon;

-- 메시지 최소 10자 (2026-08-20 추가, 실행 완료)
-- NOT VALID: 기존 행은 검사하지 않고 새 행부터 적용
alter table messages drop constraint if exists content_min_length;
alter table messages add constraint content_min_length
  check (char_length(trim(content)) >= 10) not valid;
