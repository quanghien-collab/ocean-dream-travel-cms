"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const sb = useMemo(() => getSupabase(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setMsg(error?.message ?? "Đăng nhập thất bại.");
      setLoading(false);
      return;
    }

    // role check
    const user = data.session.user;
    const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "admin") {
      await sb.auth.signOut();
      setMsg("Tài khoản không có quyền admin.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="container-od py-12">
      <div className="mx-auto max-w-md card p-7">
        <h1 className="text-2xl font-semibold">Đăng nhập Admin</h1>
        <p className="mt-1 text-slate-600 text-sm">
          Tài khoản admin tạo trong Supabase Auth, sau đó set role = admin trong bảng profiles.
        </p>

        <form onSubmit={onLogin} className="mt-6 grid gap-3">
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@..." />
          <label className="label">Mật khẩu</label>
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          <button disabled={loading} className="btn btn-primary mt-2" type="submit">
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
          {msg ? <p className="text-sm text-rose-600">{msg}</p> : null}
        </form>

        <p className="mt-4 text-xs text-slate-500">
          Nếu Tiến sĩ muốn “quên mật khẩu”, Lucky sẽ thêm reset password trong 2 phút.
        </p>
      </div>
    </main>
  );
}
