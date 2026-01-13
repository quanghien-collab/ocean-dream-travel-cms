"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/lib/types";

export default function ContactPage() {
  const sb = useMemo(() => getSupabase(), []);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    sb.from("site_settings").select("*").eq("id", "singleton").maybeSingle()
      .then(({ data }) => setSettings((data ?? null) as SiteSettings | null));
  }, [sb]);

  return (
    <main className="container-od py-10">
      <h1 className="text-3xl font-semibold">Liên hệ</h1>
      <p className="mt-2 text-slate-600">Hotline/Zalo/Email chỉnh trong Admin → Site Settings.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Thông tin</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p>📞 <span className="font-medium">Hotline:</span> {settings?.hotline ?? "—"}</p>
            <p>💬 <span className="font-medium">Zalo:</span> {settings?.zalo ?? "—"}</p>
            <p>✉ <span className="font-medium">Email:</span> {settings?.email ?? "—"}</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold">Gửi yêu cầu</h2>
          <p className="mt-1 text-sm text-slate-600">(Demo) Form này chưa lưu DB.</p>

          <form className="mt-4 grid gap-3">
            <label className="label">Họ tên</label>
            <input className="input" placeholder="VD: Nguyễn Văn A" />
            <label className="label">Số điện thoại</label>
            <input className="input" placeholder="VD: 09xx..." />
            <label className="label">Nội dung</label>
            <textarea className="input min-h-[110px]" placeholder="Muốn tư vấn tour nào?" />
            <button className="btn btn-primary" type="button">Gửi</button>
          </form>
        </div>
      </div>
    </main>
  );
}
