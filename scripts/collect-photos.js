/* ============================================================
 * 사진 수집기 (X + 위버스 겸용) — bday-recap용
 * ============================================================
 *
 * ■ 사용법 (1분 컷)
 *   1. 크롬에서 수집할 페이지를 연다 (로그인된 상태로)
 *      - X:      검색 결과 페이지 (최신 탭 추천)
 *                예) x.com/search?q=from%3ABOYNEXTDOOR_twt+%23성호&f=live
 *      - 위버스:  아티스트 프로필/피드 페이지
 *                예) weverse.io/boynextdoor/profile/...
 *   2. F12 → Console 탭
 *      (처음이면 "allow pasting" 이라고 타이핑하라고 나옴 — 시키는 대로 입력)
 *   3. 이 파일 전체를 복사해서 콘솔에 붙여넣고 Enter
 *   4. 자동으로 끝까지 스크롤하며 수집 → 끝나면 클립보드에
 *      config/photos.ts 에 바로 붙여넣을 수 있는 코드가 복사됨
 *   5. config/photos.ts 를 열고 photos: [...] 부분을 통째로 교체 → 저장
 *   6. (선택) /photo-picker 페이지에서 클릭으로 최종 큐레이션
 *
 * ■ 다른 아이돌에 쓰려면: 1번의 검색어/프로필만 바꾸면 끝. 코드는 그대로.
 * ■ 주의: 위버스는 무료 공개 글만! 멤버십(유료) 콘텐츠는 수집 금지.
 * ============================================================ */
(async () => {
  const found = new Set();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const collect = () => {
    document.querySelectorAll("img").forEach((img) => {
      const s = img.src || "";
      // X (트위터): 미디어 이미지 → 큰 사이즈로 정규화
      const x = s.match(/pbs\.twimg\.com\/media\/([\w-]+)/);
      if (x) {
        found.add(`https://pbs.twimg.com/media/${x[1]}?format=jpg&name=large`);
        return;
      }
      // 위버스: 리사이즈 쿼리를 떼면 원본이 외부 표시 가능
      if (s.includes("phinf.wevpstatic.net")) {
        try {
          const u = new URL(s);
          found.add(u.origin + u.pathname);
        } catch {}
      }
    });
  };

  console.log("📸 수집 시작 — 자동 스크롤 중... (탭을 화면에 띄워두세요)");
  collect();
  let stale = 0;
  let last = found.size;
  for (let round = 0; round < 60 && stale < 4; round++) {
    window.scrollBy(0, 2800);
    await sleep(1400);
    collect();
    if (found.size === last) stale++;
    else { stale = 0; last = found.size; }
    if (round % 5 === 4) console.log(`  …${found.size}장 수집됨`);
  }

  const list = [...found];
  const code = `  photos: [\n${list.map((u) => `    "${u}",`).join("\n")}\n  ] as string[],`;

  console.log(`✅ 수집 완료: 총 ${list.length}장`);
  try {
    await navigator.clipboard.writeText(code);
    console.log("📋 클립보드에 복사됨! config/photos.ts의 photos: [...] 부분을 교체하세요.");
  } catch {
    console.log("⚠️ 클립보드 권한이 없어 아래에 출력합니다. 전체를 복사하세요:\n");
    console.log(code);
  }
})();
