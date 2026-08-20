"use client";

// 관리자 세션 훅 — Supabase Auth 로그인 + admins 테이블 대조
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const checkAdmin = useCallback(async (userEmail: string | undefined) => {
    if (!supabase || !userEmail) {
      setIsAdmin(false);
      setEmail(null);
      return;
    }
    // admins 테이블에서 내 이메일이 조회되면 관리자 (RLS가 본인 행만 허용)
    const { data } = await supabase.from("admins").select("email").eq("email", userEmail).maybeSingle();
    setIsAdmin(Boolean(data));
    setEmail(userEmail);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => checkAdmin(data.session?.user?.email));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      checkAdmin(session?.user?.email)
    );
    return () => sub.subscription.unsubscribe();
  }, [checkAdmin]);

  async function login(loginEmail: string, password: string): Promise<boolean> {
    if (!supabase) return false;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    setBusy(false);
    if (err) {
      setError("로그인에 실패했어요. 이메일/비밀번호를 확인해주세요.");
      return false;
    }
    return true;
  }

  async function logout() {
    await supabase?.auth.signOut();
    setIsAdmin(false);
    setEmail(null);
  }

  async function deleteMessage(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error: err, count } = await supabase
      .from("messages")
      .delete({ count: "exact" })
      .eq("id", id);
    // RLS에 막히면 error 없이 count 0으로 조용히 실패할 수 있음 — 둘 다 확인
    return !err && (count ?? 0) > 0;
  }

  return { isAdmin, email, error, busy, login, logout, deleteMessage };
}
