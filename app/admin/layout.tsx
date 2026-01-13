"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = useMemo(() => getSupabase(), []);
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await sb.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        if (!pathname.startsWith("/admin/login")) router.replace("/admin/login");
        setReady(true);
        return;
      }
      const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "admin") {
        await sb.auth.signOut();
        router.replace("/admin/login");
        setReady(true);
        return;
      }
      setEmail(user.email ?? null);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function logout() {
    await sb.auth.signOut();
    router.push("/");
  }

  if (!ready) return <main className="container-od py-10"><div className="card p-6">Đang kiểm tra quyền…</div></main>;

  // allow login page render without frame
  if (pathname.startsWith("/admin/login")) return <>{children}</>;

  return (
    <main className="container-od py-10">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="card p-5 lg:w-72 h-fit">
          <p className="text-sm text-slate-600">Admin</p>
          <p className="mt-1 font-semibold">{email ?? "—"}</p>

          <nav className="mt-5 grid gap-2">
            <Link className="btn justify-start" href="/admin">Dashboard</Link>
            <Link className="btn justify-start" href="/admin/site">Site Settings</Link>
            <Link className="btn justify-start" href="/admin/tours">Tours</Link>
          </nav>

          <button onClick={logout} className="btn mt-5 w-full">Đăng xuất</button>
          <p className="mt-3 text-xs text-slate-500">
            Tip: sửa xong bấm Lưu → trang chủ cập nhật realtime.
          </p>
        </aside>

        <section className="flex-1">{children}</section>
      </div>
    </main>
  );
}
