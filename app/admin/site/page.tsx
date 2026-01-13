"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/lib/types";

const DEFAULT: SiteSettings = {
  id: "singleton",
  brand_name: "Ocean Dream Travel",
  hero_title: "Chạm vào giấc mơ biển xanh",
  hero_subtitle: "Tour chất lượng – resort xịn – trải nghiệm đáng tiền.",
  hero_image_url: null,
  theme_rgb: "15 76 129",
  hotline: null,
  zalo: null,
  email: null
};

export default function SiteSettingsPage() {
  const sb = useMemo(() => getSupabase(), []);
  const [form, setForm] = useState<SiteSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await sb.from("site_settings").select("*").eq("id", "singleton").maybeSingle();
    setForm((data ?? DEFAULT) as SiteSettings);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = sb.channel("realtime-admin-site")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => load())
      .subscribe();
    return () => { sb.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setMsg(null);
    const { error } = await sb.from("site_settings").upsert(form, { onConflict: "id" });
    if (error) setMsg(error.message);
    else setMsg("Đã lưu. Trang chủ sẽ cập nhật ngay.");
  }

  if (loading) return <div className="card p-7">Đang tải…</div>;

  return (
    <div className="card p-7">
      <h1 className="text-2xl font-semibold">Site Settings</h1>
      <p className="mt-2 text-slate-600">Sửa banner, slogan, màu thương hiệu, hotline…</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3">
          <label className="label">Brand name</label>
          <input className="input" value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} />

          <label className="label">Hero title</label>
          <input className="input" value={form.hero_title} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} />

          <label className="label">Hero subtitle</label>
          <textarea className="input min-h-[90px]" value={form.hero_subtitle ?? ""} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} />

          <label className="label">Hero image URL (Supabase Storage public URL)</label>
          <input className="input" value={form.hero_image_url ?? ""} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value || null })} placeholder="https://.../storage/v1/object/public/..." />

          <label className="label">Theme RGB (vd: 15 76 129)</label>
          <input className="input" value={form.theme_rgb} onChange={(e) => setForm({ ...form, theme_rgb: e.target.value })} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Hotline</label>
              <input className="input" value={form.hotline ?? ""} onChange={(e) => setForm({ ...form, hotline: e.target.value || null })} />
            </div>
            <div>
              <label className="label">Zalo</label>
              <input className="input" value={form.zalo ?? ""} onChange={(e) => setForm({ ...form, zalo: e.target.value || null })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value || null })} />
            </div>
          </div>

          <button onClick={save} className="btn btn-primary mt-2">Lưu</button>
          {msg ? <p className="text-sm mt-2 text-emerald-700">{msg}</p> : null}
        </div>

        <div className="card p-5 bg-slate-50">
          <p className="text-sm text-slate-600">Preview nhanh</p>
          <div className="mt-3 rounded-2xl bg-white p-5 ring-1 ring-black/5">
            <div className="h-10 w-10 rounded-2xl" style={{ background: `rgb(${form.theme_rgb})` }} />
            <h3 className="mt-3 text-xl font-semibold">{form.hero_title}</h3>
            <p className="mt-1 text-sm text-slate-600">{form.hero_subtitle}</p>
            <div className="mt-4 flex gap-2">
              <span className="badge">📞 {form.hotline ?? "Hotline"}</span>
              <span className="badge">💬 {form.zalo ?? "Zalo"}</span>
              <span className="badge">✉ {form.email ?? "Email"}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Tip: ảnh nên là tỉ lệ 16:10 hoặc 16:9, dung lượng &lt; 500KB cho tải nhanh.
          </p>
        </div>
      </div>
    </div>
  );
}
