"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/lib/types";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_href: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
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
  email: null,
};

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function SiteSettingsPage() {
  const sb = useMemo(() => getSupabase(), []);
  const [form, setForm] = useState<SiteSettings>(DEFAULT);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);

    const { data: s } = await sb
      .from("site_settings")
      .select("*")
      .eq("id", "singleton")
      .maybeSingle();

    setForm((s ?? DEFAULT) as SiteSettings);

    const { data: h } = await sb
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    setSlides((h ?? []) as HeroSlide[]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();

    const ch1 = sb
      .channel("realtime-admin-site")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => loadAll()
      )
      .subscribe();

    const ch2 = sb
      .channel("realtime-admin-hero")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hero_slides" },
        () => loadAll()
      )
      .subscribe();

    return () => {
      sb.removeChannel(ch1);
      sb.removeChannel(ch2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSiteSettings() {
    setMsg(null);
    const { error } = await sb
      .from("site_settings")
      .upsert(form, { onConflict: "id" });
    if (error) setMsg(error.message);
    else setMsg("Đã lưu. Trang chủ cập nhật ngay.");
  }

async function addSlide() {
  setMsg(null);

  const maxOrder = slides.length
    ? Math.max(...slides.map((x) => x.sort_order ?? 0))
    : 0;

  const { error } = await sb.from("hero_slides").insert({
    title: "Banner mới",
    subtitle: "",
    cta_text: "Xem tour hot",
    cta_href: "/tours",
    image_url: null,
    is_active: true,
    sort_order: maxOrder + 10,
  });

  if (error) {
    setMsg(error.message);
  } else {
    setMsg("Đã thêm banner mới.");
    await loadAll();   // 🔥 BẮT BUỘC reload để render form ngay
  }
}

  async function patchSlide(id: string, patch: Partial<HeroSlide>) {
    setMsg(null);
    setBusyId(id);
    const { error } = await sb.from("hero_slides").update(patch).eq("id", id);
    setBusyId(null);
    if (error) setMsg(error.message);
  }

  async function delSlide(id: string) {
    if (!confirm("Xóa banner này?")) return;
    setMsg(null);
    setBusyId(id);
    const { error } = await sb.from("hero_slides").delete().eq("id", id);
    setBusyId(null);
    if (error) setMsg(error.message);
  }

  async function moveSlide(id: string, dir: "up" | "down") {
    const idx = slides.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const j = dir === "up" ? idx - 1 : idx + 1;
    if (j < 0 || j >= slides.length) return;

    const a = slides[idx];
    const b = slides[j];

    // swap sort_order
    setBusyId(id);
    const { error: e1 } = await sb
      .from("hero_slides")
      .update({ sort_order: b.sort_order })
      .eq("id", a.id);

    const { error: e2 } = await sb
      .from("hero_slides")
      .update({ sort_order: a.sort_order })
      .eq("id", b.id);

    setBusyId(null);
    if (e1 || e2) setMsg((e1 ?? e2)?.message ?? "Lỗi sắp xếp");
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error ?? "Upload failed");
    }
    return json.url as string;
  }

  async function onPickSlideImage(slideId: string, file: File | null) {
    if (!file) return;
    setMsg(null);
    setBusyId(slideId);
    try {
      const url = await uploadImage(file);
      await patchSlide(slideId, { image_url: url });
      setMsg("Đã upload ảnh banner.");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="card p-7">Đang tải…</div>;

  return (
    <div className="grid gap-6">
      {/* SITE SETTINGS */}
      <div className="card p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Site Settings</h1>
            <p className="mt-2 text-slate-600">
              Sửa thương hiệu, màu, hotline… (trang chủ cập nhật realtime)
            </p>
          </div>
          <button onClick={saveSiteSettings} className="btn btn-primary">
            Lưu Site Settings
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3">
            <label className="label">Brand name</label>
            <input
              className="input"
              value={form.brand_name}
              onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
            />

            <label className="label">Theme RGB (vd: 15 76 129)</label>
            <input
              className="input"
              value={form.theme_rgb}
              onChange={(e) => setForm({ ...form, theme_rgb: e.target.value })}
            />

            <label className="label">Hotline</label>
            <input
              className="input"
              value={form.hotline ?? ""}
              onChange={(e) => setForm({ ...form, hotline: e.target.value || null })}
            />

            <label className="label">Zalo</label>
            <input
              className="input"
              value={form.zalo ?? ""}
              onChange={(e) => setForm({ ...form, zalo: e.target.value || null })}
            />

            <label className="label">Email</label>
            <input
              className="input"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value || null })}
            />

            <div className="mt-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
              <p className="text-sm font-medium">Tip ảnh:</p>
              <p className="mt-1 text-xs text-slate-600">
                Banner nên 16:9 hoặc 16:10, file &lt; 500KB để tải nhanh.
              </p>
            </div>

            {msg ? <p className="text-sm mt-2 text-emerald-700">{msg}</p> : null}
          </div>

          <div className="card p-5 bg-slate-50">
            <p className="text-sm text-slate-600">Preview nhanh</p>
            <div className="mt-3 rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="h-10 w-10 rounded-2xl" style={{ background: `rgb(${form.theme_rgb})` }} />
              <h3 className="mt-3 text-xl font-semibold">{form.brand_name}</h3>
              <div className="mt-4 flex gap-2 flex-wrap">
                <span className="badge">📞 {form.hotline ?? "Hotline"}</span>
                <span className="badge">💬 {form.zalo ?? "Zalo"}</span>
                <span className="badge">✉ {form.email ?? "Email"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HERO SLIDER */}
      <div className="card p-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Hero Slider (Banner trang chủ)</h2>
            <p className="mt-1 text-slate-600">
              Quản lý banner chạy slider ngoài trang chủ
            </p>
          </div>
          <button onClick={addSlide} className="btn btn-primary">
            + Thêm banner
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          {slides.map((s, idx) => (
            <div key={s.id} className="card p-5">
              <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
                {/* image */}
                <div>
                  <div className="h-[190px] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-black/5">
                    {s.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image_url} alt={s.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-slate-400 text-sm">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onPickSlideImage(s.id, e.target.files?.[0] ?? null)}
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Upload ảnh → hệ thống tự lấy public URL từ Supabase.
                    </p>
                  </div>

                  {s.image_url ? (
                    <div className="mt-2 text-xs text-slate-500 break-all">
                      URL: {s.image_url}
                    </div>
                  ) : null}
                </div>

                {/* fields */}
                <div className="grid gap-3">
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div>
                      <label className="label">Tiêu đề</label>
                      <input
                        className="input"
                        value={s.title}
                        onChange={(e) =>
                          setSlides((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x))
                          )
                        }
                        onBlur={(e) => patchSlide(s.id, { title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="label">Đường dẫn nút (vd: /tours, /contact)</label>
                      <input
                        className="input"
                        value={s.cta_href ?? ""}
                        onChange={(e) =>
                          setSlides((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, cta_href: e.target.value } : x))
                          )
                        }
                        onBlur={(e) => patchSlide(s.id, { cta_href: e.target.value || null })}
                      />
                    </div>

                    <div>
                      <label className="label">Mô tả</label>
                      <input
                        className="input"
                        value={s.subtitle ?? ""}
                        onChange={(e) =>
                          setSlides((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, subtitle: e.target.value } : x))
                          )
                        }
                        onBlur={(e) => patchSlide(s.id, { subtitle: e.target.value || null })}
                      />
                    </div>

                    <div>
                      <label className="label">Chữ trên nút</label>
                      <input
                        className="input"
                        value={s.cta_text ?? ""}
                        onChange={(e) =>
                          setSlides((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, cta_text: e.target.value } : x))
                          )
                        }
                        onBlur={(e) => patchSlide(s.id, { cta_text: e.target.value || null })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <button
                      className={cx("btn", s.is_active && "btn-primary")}
                      onClick={() => patchSlide(s.id, { is_active: !s.is_active })}
                      disabled={busyId === s.id}
                    >
                      {s.is_active ? "Đang bật" : "Đang tắt"}
                    </button>

                    <button className="btn" onClick={() => moveSlide(s.id, "up")} disabled={idx === 0 || busyId === s.id}>
                      ↑ Lên
                    </button>
                    <button
                      className="btn"
                      onClick={() => moveSlide(s.id, "down")}
                      disabled={idx === slides.length - 1 || busyId === s.id}
                    >
                      ↓ Xuống
                    </button>

                    <button className="btn" onClick={() => patchSlide(s.id, {})} disabled>
                      Tự lưu khi rời ô (onBlur)
                    </button>

                    <button className="btn" onClick={() => delSlide(s.id)} disabled={busyId === s.id}>
                      Xóa
                    </button>

                    {busyId === s.id ? (
                      <span className="text-xs text-slate-500">Đang xử lý…</span>
                    ) : null}
                  </div>

                  <div className="mt-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                    <p className="text-sm font-medium">Preview nhỏ</p>
                    <p className="mt-1 text-slate-700 font-semibold">{s.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{s.subtitle}</p>
                    <div className="mt-2 flex gap-2 flex-wrap text-xs">
                      <span className="badge">Nút: {s.cta_text ?? "—"}</span>
                      <span className="badge">Link: {s.cta_href ?? "—"}</span>
                      <span className="badge">Trạng thái: {s.is_active ? "Bật" : "Tắt"}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}

          {!slides.length ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600 ring-1 ring-black/5">
              Chưa có banner nào. Bấm <b>+ Thêm banner</b> để tạo.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
