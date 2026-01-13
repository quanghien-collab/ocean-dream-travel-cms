"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/lib/types";

type HeroSlide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  cta_text: string | null;
  cta_href: string | null;
  sort_order: number;
  enabled: boolean;
};

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
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);

    const [{ data: site }, { data: hero }] = await Promise.all([
      sb.from("site_settings").select("*").eq("id", "singleton").maybeSingle(),
      sb.from("hero_slides").select("*").order("sort_order", { ascending: true })
    ]);

    setForm((site ?? DEFAULT) as SiteSettings);
    setSlides((hero ?? []) as HeroSlide[]);
    setLoading(false);
  }

  useEffect(() => {
    load();

    const ch1 = sb.channel("realtime-site-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, load)
      .subscribe();

    const ch2 = sb.channel("realtime-hero-slides")
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_slides" }, load)
      .subscribe();

    return () => {
      sb.removeChannel(ch1);
      sb.removeChannel(ch2);
    };
  }, []);

  async function saveSite() {
    setMsg(null);
    const { error } = await sb.from("site_settings").upsert(form, { onConflict: "id" });
    if (error) setMsg(error.message);
    else setMsg("Đã lưu. Trang chủ sẽ cập nhật ngay.");
  }

  async function addSlide() {
    await sb.from("hero_slides").insert({
      title: "Banner mới",
      subtitle: "Mô tả ngắn",
      image_url: "",
      sort_order: slides.length + 1,
      enabled: true
    });
  }

  async function updateSlide(id: string, patch: Partial<HeroSlide>) {
    await sb.from("hero_slides").update(patch).eq("id", id);
  }

  async function deleteSlide(id: string) {
    if (!confirm("Xóa banner này?")) return;
    await sb.from("hero_slides").delete().eq("id", id);
  }

  async function uploadImage(file: File, slideId: string) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();

    if (json.url) {
      await updateSlide(slideId, { image_url: json.url });
    } else {
      alert("Upload lỗi: " + json.error);
    }
  }

  if (loading) return <div className="card p-7">Đang tải…</div>;

  return (
    <div className="space-y-10">

      {/* SITE SETTINGS */}
      <div className="card p-7">
        <h1 className="text-2xl font-semibold">Site Settings</h1>
        <p className="mt-2 text-slate-600">Sửa banner, slogan, màu thương hiệu, hotline…</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3">
            <label className="label">Brand name</label>
            <input className="input" value={form.brand_name}
              onChange={(e) => setForm({ ...form, brand_name: e.target.value })} />

            <label className="label">Hero title</label>
            <input className="input" value={form.hero_title}
              onChange={(e) => setForm({ ...form, hero_title: e.target.value })} />

            <label className="label">Hero subtitle</label>
            <textarea className="input min-h-[90px]" value={form.hero_subtitle ?? ""}
              onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} />

            <label className="label">Hero image URL (fallback)</label>
            <input className="input" value={form.hero_image_url ?? ""}
              onChange={(e) => setForm({ ...form, hero_image_url: e.target.value || null })} />

            <label className="label">Theme RGB</label>
            <input className="input" value={form.theme_rgb}
              onChange={(e) => setForm({ ...form, theme_rgb: e.target.value })} />

            <button onClick={saveSite} className="btn btn-primary mt-3">Lưu Site Settings</button>
            {msg && <p className="text-sm text-emerald-700">{msg}</p>}
          </div>
        </div>
      </div>

      {/* HERO SLIDER CMS */}
      <div className="card p-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Hero Slider (Banner trang chủ)</h2>
            <p className="text-slate-600 text-sm">Quản lý banner chạy slider ngoài trang chủ</p>
          </div>
          <button onClick={addSlide} className="btn btn-primary">+ Thêm banner</button>
        </div>

        <div className="mt-6 grid gap-6">
          {slides.map((s) => (
            <div key={s.id} className="card p-5 bg-slate-50">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  {s.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image_url} className="w-full h-[180px] object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-[180px] rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                      Chưa có ảnh
                    </div>
                  )}

                  <input type="file" className="mt-2"
                    onChange={(e) => e.target.files && uploadImage(e.target.files[0], s.id)} />
                </div>

                <div className="grid gap-2">
                  <input className="input" value={s.title ?? ""}
                    onChange={(e) => updateSlide(s.id, { title: e.target.value })} placeholder="Title" />

                  <input className="input" value={s.subtitle ?? ""}
                    onChange={(e) => updateSlide(s.id, { subtitle: e.target.value })} placeholder="Subtitle" />

                  <input className="input" value={s.cta_text ?? ""}
                    onChange={(e) => updateSlide(s.id, { cta_text: e.target.value })} placeholder="CTA Text" />

                  <input className="input" value={s.cta_href ?? ""}
                    onChange={(e) => updateSlide(s.id, { cta_href: e.target.value })} placeholder="CTA Link" />

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateSlide(s.id, { enabled: !s.enabled })}
                      className="btn">
                      {s.enabled ? "Đang bật" : "Đang tắt"}
                    </button>

                    <button onClick={() => deleteSlide(s.id)} className="btn text-red-600">
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
