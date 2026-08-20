-- v1.6: 관리자 삭제 권한 (2026-08-20 실행 완료)
-- 관리자 이메일 목록 — 여기 등록된 이메일로 로그인한 계정만 메시지 삭제 가능.
-- 관리자 추가: insert into admins (email) values ('you@example.com');
create table if not exists admins (email text primary key);
alter table admins enable row level security;

create policy "본인 관리자 여부 확인"
  on admins for select
  to authenticated
  using ((select auth.jwt() ->> 'email') = email);

create policy "관리자만 메시지 삭제"
  on messages for delete
  to authenticated
  using ((select auth.jwt() ->> 'email') in (select email from admins));
