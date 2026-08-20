"use client";

// 관리자 로그인 — 푸터의 작은 버튼. 로그인하면 메시지 삭제 버튼이 나타난다.
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminApi = {
  isAdmin: boolean;
  email: string | null;
  error: string;
  busy: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export function AdminLogin({ admin }: { admin: AdminApi }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!supabase) return null;

  if (admin.email) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <span>
          {admin.isAdmin ? "🛡️ 관리자 모드" : "로그인됨 (관리자 아님)"} · {admin.email}
        </span>
        <button onClick={() => admin.logout()} className="underline">
          로그아웃
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-zinc-300 underline">
        관리자
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (await admin.login(email.trim(), password)) {
          setOpen(false);
          setPassword("");
        }
      }}
      className="flex flex-col items-center gap-2"
    >
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="관리자 이메일"
          autoComplete="username"
          className="w-44 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-[var(--artist-primary)]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          className="w-32 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-[var(--artist-primary)]"
        />
        <button
          type="submit"
          disabled={admin.busy}
          className="rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--artist-primary)" }}
        >
          {admin.busy ? "..." : "로그인"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-400">
          취소
        </button>
      </div>
      {admin.error && <p className="text-xs text-red-500">{admin.error}</p>}
    </form>
  );
}
