-- Supabase 프로젝트 생성 후, SQL Editor에서 이 파일 내용을 그대로 실행하세요.

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 1 and 20),
  content text not null check (char_length(content) between 1 and 300),
  created_at timestamp with time zone default now()
);

-- 누구나 메시지를 읽고 쓸 수 있도록 RLS(행 단위 보안) 정책을 연다.
-- (도배/악성 메시지 방지용 필터는 애플리케이션 레벨에서 추가로 처리 — 3주차 작업)
alter table messages enable row level security;

create policy "누구나 메시지 읽기 가능"
  on messages for select
  using (true);

create policy "누구나 메시지 쓰기 가능"
  on messages for insert
  with check (true);

-- 나중에 v2에서 여러 아티스트를 지원하게 되면 artist_id 컬럼을 추가해서 확장.
