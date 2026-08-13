import { createClient } from "@supabase/supabase-js";

// Supabase 프로젝트를 만든 뒤, 아래 두 값을 .env.local 에 넣어주세요.
// NEXT_PUBLIC_SUPABASE_URL=...
// NEXT_PUBLIC_SUPABASE_ANON_KEY=...
// (값은 Supabase 대시보드 > Project Settings > API 에서 확인 가능)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 키가 아직 없어도(로컬 개발 초반) 앱이 죽지 않도록 안전하게 처리.
// 실제 저장/조회 기능은 키가 설정된 뒤부터 동작합니다.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export type Message = {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
};
