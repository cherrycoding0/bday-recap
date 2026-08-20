// Supabase 연결이 실제로 되는지 확인하는 스크립트.
// 실행:  npm run check:supabase
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const fail = (msg, hint) => {
  console.error(`\n❌ ${msg}`);
  if (hint) console.error(`   👉 ${hint}`);
  process.exit(1);
};

if (!url || !key) {
  fail(
    ".env.local 에 값이 아직 비어 있어요.",
    "NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 를 채운 뒤 다시 실행하세요."
  );
}
if (!/^https:\/\/.+\.supabase\.co\/?$/.test(url)) {
  fail(
    `URL 형식이 이상해요: ${url}`,
    "https://<프로젝트id>.supabase.co 형태여야 합니다. 끝에 /rest/v1 같은 게 붙어있으면 지우세요."
  );
}

const supabase = createClient(url, key);

console.log("🔌 Supabase에 연결해보는 중...");

const { error, count } = await supabase
  .from("messages")
  .select("*", { count: "exact", head: true });

if (error) {
  if (/relation .*messages.* does not exist|schema cache/i.test(error.message)) {
    fail(
      "연결은 됐는데 messages 테이블이 없어요.",
      "Supabase 대시보드 > SQL Editor 에서 sql/schema.sql 내용을 붙여넣고 Run 하세요."
    );
  }
  if (/Invalid API key|JWT/i.test(error.message)) {
    fail("API 키가 올바르지 않아요.", "대시보드 > Settings > API Keys 에서 키를 다시 복사하세요.");
  }
  fail(`연결 실패: ${error.message}`);
}

console.log(`\n✅ 연결 성공! messages 테이블에 현재 ${count}개의 메시지가 있어요.`);
console.log("   이제 npm run dev 로 띄우면 메시지가 실제로 저장됩니다.\n");
