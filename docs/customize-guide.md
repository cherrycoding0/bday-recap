# 다른 멤버/아티스트 버전 만들기 — 커스터마이징 가이드

> 예시: 태산판 (생일 2004-08-10 → 다음 도래일 **2027-08-10**. 올해 생일은 지났음!)
> 소요 예상: **콘텐츠 반나절 + 인프라 1시간.** 코드 로직은 한 줄도 안 고쳐도 됩니다.

---

## 0. 큰 그림

이 프로젝트는 "콘텐츠는 config 3개 파일, 로직은 나머지"로 분리돼 있어요.
새 버전 = **① 레포 복제 → ② config 3개 교체 → ③ 새 Supabase/Vercel 연결**이 전부입니다.

```
D:\bday-recap  ──복제──▶  D:\bday-recap-taesan
                              │
              config/artist.ts   ← 이름·생일·팔레트
              config/quiz.ts     ← 테스트·유형·파트·목표
              config/photos.ts   ← 사진 (수집기로 자동)
                              │
              새 Supabase 프로젝트 + 새 Vercel 프로젝트
```

---

## 1. config/artist.ts — 아티스트 정보 (10분)

| 항목 | 성호판 | 태산판 예시 |
|---|---|---|
| name | "성호" | "태산" |
| groupName | "BOYNEXTDOOR" | 그대로 |
| fandomName | "ONEDOOR" | 그대로 |
| birthdayThisYear | 2026-09-04 | **"2027-08-10T00:00:00+09:00"** |
| birthYear | 2003 | **2004** |
| candleCount | 24 | 24 (2027년 세는 나이) / 만 나이는 23 |
| themeColor | 핑크 팔레트 | 태산 컬러로 (최애색 참고: 레드 계열) — primary/primaryDeep/secondary/accent/text 5개 |
| disclaimer | 문의 문구 | 필요시 수정 |

## 2. config/quiz.ts — 테스트 콘텐츠 (제일 오래 걸림, 2~3시간)

- `title` / `storyLine` / `subtitle` — 날짜·이름 반영 ("8월 10일, 태산의 생일...")
- `goalCount` / `goalSteps` — **810** (8월 10일) → 1004 → ... 로 사다리 재설계
- `questions` 5개 — "성호가 라방을 한다" 같은 문구를 태산 캐릭터에 맞게. **점수(tension/social)는 그대로 둬도 됨** (분포 균등화 완료된 값)
- `types` 6개 — 구조·궁합·traits는 재사용 가능. 반드시 바꿀 것:
  - `parts` 전체: 태산 곡·가사 한 줄·직캠 링크 (가사는 유형당 한 줄 규칙 유지!)
  - 유형 이름에 멤버 밈이 들어갔다면 교체
- ⚠️ 유형 이름을 바꾸면 `app/api/comment/route.ts`의 FALLBACK 키(유형 이름)도 맞춰줄 것

## 3. config/photos.ts — 사진 (30분)

1. X 검색: `from:BOYNEXTDOOR_twt #태산` (최신 탭) → `scripts/collect-photos.js` 콘솔 실행
2. 위버스 태산 프로필에서 한 번 더 실행 (같은 수집기가 자동 인식)
3. 배포 후 `/photo-picker`에서 클릭 큐레이션 → 코드 복사 → 붙여넣기

## 4. 에셋 (10분)

- `public/og-image.png` — 이름·날짜·컬러 바꿔 재생성 필요. **Claude한테 "태산판 OG 이미지 만들어줘"라고 하면 됨** (팔레트 확정 후)
- 폰트(`public/fonts/`, `app/fonts/`) — 그대로 재사용

## 5. 새 Supabase 프로젝트 (30분, 문서 순서대로)

무료 플랜은 프로젝트 2개까지라 태산판용 새 프로젝트 생성 가능.

1. supabase.com → New project (Region: Seoul)
2. SQL Editor에서 **순서대로** 실행: `sql/schema.sql` → `upgrade-v15.sql` → `upgrade-v16.sql` → `upgrade-v17.sql` → `upgrade-v18.sql`
3. Authentication → Add user (관리자 계정, Auto Confirm 체크)
4. SQL: `insert into admins (email) values ('관리자이메일');`
5. Authentication 설정에서 **Enable sign-ups 끄기**
6. Project Settings → API Keys에서 URL·publishable key 복사

## 6. 새 GitHub + Vercel (20분)

1. 폴더 복제 후 git 초기화(또는 GitHub에서 레포 복제) → 새 레포 `bday-recap-taesan` push
2. vercel.com/new → 레포 Import → 환경변수 3개:
   - `NEXT_PUBLIC_SUPABASE_URL` (5번에서 복사)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (5번에서 복사)
   - `NEXT_PUBLIC_SITE_URL` (배포 후 도메인, 예: https://bday-recap-taesan.vercel.app)
3. Deploy → 도메인 확인 → SITE_URL 넣고 재배포
4. `.env.local`도 로컬에 새 값으로 생성 (`.env.local.example` 참고)

## 7. 자동으로 따라오는 것 (수정 불필요 ✅)

페이지 제목·카운트다운·초 개수·띠배너·폴라로이드·사진드컵(32강/명예의전당)·유형 테스트 엔진·
완성 카드·904→커스텀 목표 사다리·달성 폭죽·TOP10 언락·하트·실시간·관리자 삭제·필터·
AI 리캡/코멘트/모더레이션·퍼널 측정 — **전부 config를 읽어서 동작**합니다.
(2026-08-21 기준 컴포넌트 내 멤버 이름 하드코딩 0건 확인)

## 체크리스트 요약

- [ ] 레포 복제 → 새 GitHub 레포
- [ ] config/artist.ts (이름·생일·팔레트)
- [ ] config/quiz.ts (문항·유형 파트·목표 사다리)
- [ ] 사진 수집 + 큐레이션 (config/photos.ts)
- [ ] OG 이미지 재생성
- [ ] 새 Supabase (SQL 5개 순서 실행 + 관리자 + sign-ups off)
- [ ] 새 Vercel (env 3개)
- [ ] 폰에서 전체 플로우 1회 테스트 (`?dday=1` 포함)

## 참고: 더 멀리 가면 (v2 플랫폼화)

이 체크리스트가 귀찮아지는 시점이 오면 그게 플랫폼화 타이밍입니다 —
messages/events에 `artist_id` 컬럼을 추가하고 config를 DB로 옮기면,
"새 멤버 페이지 = 관리자 화면에서 폼 입력"이 됩니다. (포폴 v2 어젠다)
