# bday-recap — 성호 생일 축하 페이지 (v1)

BOYNEXTDOOR 성호(2026-09-04) 생일을 위한 온라인 생일 페이지. 카운트다운 + 롤링페이퍼 + AI 리캡 카드.

## 로컬에서 실행하기

```bash
npm install
cp .env.local.example .env.local   # 값은 아직 비워둬도 됨(미리보기 모드로 동작)
npm run dev
```

`http://localhost:3000` 접속. Supabase 키를 아직 안 넣었으면 메시지는 새로고침하면 사라지는 "미리보기 모드"로 동작한다 — 정상.

## 실제로 저장되게 하려면 (Supabase 연결)

**처음이라면 → [`docs/supabase-setup.md`](docs/supabase-setup.md) 를 따라가세요.** (화면 단위 안내 + 자주 하는 실수)

요약:

1. [supabase.com](https://supabase.com) 에서 무료 프로젝트 생성 (Region은 **Seoul**)
2. SQL Editor에서 `sql/schema.sql` 내용을 그대로 실행
3. Project Settings > API Keys 에서 Project URL, publishable key 확인
4. `.env.local` 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 채우기
5. `npm run check:supabase` 로 연결 확인 → `npm run dev`

## AI 리캡 카드

메시지가 쌓인 뒤 페이지의 "AI 리캡 카드 만들기" 버튼으로 생성.
`.env.local`에 `ANTHROPIC_API_KEY` 또는 `OPENAI_API_KEY` 중 하나를 넣으면 AI 요약,
없으면 통계 기반 기본 리캡으로 동작(키 없이도 항상 동작함).

## 배포 (Vercel)

1. 이 폴더를 GitHub 레포로 push
2. [vercel.com](https://vercel.com) 에서 GitHub 레포 Import
3. Vercel 프로젝트 설정 > Environment Variables 에 `.env.local`과 동일한 키들 등록
4. Deploy

## 아티스트/테마 바꾸기 (다음 생일 때 재사용)

`config/artist.ts` 하나만 새 아티스트 정보로 교체하면 됨.
폰트를 바꾸려면 `app/fonts/`에 woff2를 넣고 `app/layout.tsx`의 localFont 경로 교체.

- 본문 폰트: Pretendard (SIL OFL)
- 제목 폰트: 배민 주아체 BMJUA (우아한형제들 무료 배포, 웹 임베딩 허용)

## v1.5 기능 (2026-08-20 추가)

- **오프 성격 테스트** — 문항/유형/파트/직캠은 전부 `config/quiz.ts`에서 수정 (✏️ 표시 참고)
- **완성 카드** — 메시지를 남기면 닉네임+순번(#0001번째 원도어) 카드 이미지 발급
- **904 카운터** — 목표치는 `config/quiz.ts`의 `goalCount`
- **메시지 하트** — 하트순 정렬 탭 포함 (`sql/upgrade-v15.sql` 실행 필요 — 이미 실행됨)
- **D-day 자정 모드** — 생일 당일 24시간 폭죽 + 축하 배너 자동 전환
- **AI 한 줄 코멘트** (`/api/comment`) — 키 없으면 유형별 템플릿 폴백
- **리캡 비용 방어** — 1시간 캐시 + IP 레이트리밋

## 할 일 (진행 상황)

- [x] 프로젝트 스캐폴딩, 카운트다운, 롤링페이퍼 UI
- [x] Day 3: 실제 컬러 팔레트/폰트 적용 — 성호 최애 색 '라이트 퍼플' 기반 (2026-08-20)
- [x] OG 이미지 (`public/og-image.png`, 1200x630) (2026-08-20)
- [x] 2주차: AI 리캡 카드 생성 로직 — `/api/recap` + `RecapCard` (2026-08-20)
- [x] 3주차: 메시지 필터 강화 — `lib/filter.ts` (2026-08-20)
- [x] Supabase 연결 — 스키마 실행·읽기/쓰기 검증 완료 (2026-08-20)
- [x] v1.5: 테스트·카드·카운터·하트·D-day·AI 코멘트 (2026-08-20)
- [ ] ✏️ `config/quiz.ts` 콘텐츠 채우기 — 유형 이름(밈), 곡+가사 한 줄, 직캠 링크
- [ ] 베타 테스트, 실제 배포 (Vercel)

작업 판단 기록은 [`docs/implementation-notes.md`](docs/implementation-notes.md) 참고.
