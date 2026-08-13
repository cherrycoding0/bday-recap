# bday-recap — 성호 생일 축하 페이지 (v1)

BOYNEXTDOOR 성호(2026-09-04) 생일을 위한 온라인 생일 페이지. 카운트다운 + 롤링페이퍼가 v1 범위이고, AI 리캡 카드는 2주차에 추가.

## 로컬에서 실행하기

```bash
npm install
cp .env.local.example .env.local   # 값은 아직 비워둬도 됨(미리보기 모드로 동작)
npm run dev
```

`http://localhost:3000` 접속. Supabase 키를 아직 안 넣었으면 메시지는 새로고침하면 사라지는 "미리보기 모드"로 동작한다 — 정상.

## 실제로 저장되게 하려면 (Supabase 연결)

1. [supabase.com](https://supabase.com) 에서 무료 프로젝트 생성
2. SQL Editor에서 `sql/schema.sql` 내용을 그대로 실행
3. Project Settings > API 에서 URL, anon key 확인
4. `.env.local` 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 채우기
5. 서버 재시작(`npm run dev`) — 이제 실제로 저장됨

## 배포 (Vercel)

1. 이 폴더를 GitHub 레포로 push
2. [vercel.com](https://vercel.com) 에서 GitHub 레포 Import
3. Vercel 프로젝트 설정 > Environment Variables 에 `.env.local`과 동일한 키들 등록
4. Deploy

## 아티스트/테마 바꾸기 (다음 생일 때 재사용)

`config/artist.ts` 하나만 새 아티스트 정보로 교체하면 됨.

## 할 일 (진행 상황)

- [x] 프로젝트 스캐폴딩, 카운트다운, 롤링페이퍼 UI
- [ ] Day 3: 실제 컬러 팔레트/폰트 적용 (`config/artist.ts`, `app/layout.tsx`의 TODO 참고)
- [ ] OG 이미지 (`public/og-image.png`, 1200x630) 추가
- [ ] 2주차: AI 리캡 카드 생성 로직
- [ ] 3주차: 메시지 필터 강화, 베타 테스트, 실제 배포
