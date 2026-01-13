"use client";

import { useEffect, useMemo, useState } from "react";
import LiveBadge from "@/components/LiveBadge";
import TourCard, { Tour } from "@/components/TourCard";
import { getSupabase } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/lib/types";

export default function HomePage() {
  const sb = useMemo(() => getSupabase(), []);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [{ data: s }, { data: t }] = await Promise.all([
      sb.from("site_settings").select("*").eq("id", "singleton").maybeSingle(),
      sb.from("tours").select("id,slug,title,subtitle,location,duration,price_vnd,cover_url,visible").eq("visible", true).order("sort_order", { ascending: true })
    ]);
    if (s) {
      setSettings(s as SiteSettings);
      if (s.theme_rgb) {
        document.documentElement.style.setProperty("--brand", s.theme_rgb);
      }
    }
    setTours((t ?? []) as Tour[]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();

    // Realtime: nếu admin sửa settings hoặc tours, trang chủ tự refresh dữ liệu.
    const ch1 = sb
      .channel("realtime-site-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => loadAll())
      .subscribe();

    const ch2 = sb
      .channel("realtime-tours")
      .on("postgres_changes", { event: "*", schema: "public", table: "tours" }, () => loadAll())
      .subscribe();

    return () => {
      sb.removeChannel(ch1);
      sb.removeChannel(ch2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brandName = settings?.brand_name ?? "Ocean Dream Travel";

  return (
    <main>
      <section className="relative overflow-hidden bg-white">
        <div className="container-od py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <LiveBadge />
                <span className="text-sm text-slate-500">Cập nhật tức thì từ Admin</span>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                {settings?.hero_title ?? "Chạm vào giấc mơ biển xanh"}
              </h1>
              <p className="mt-3 text-base text-slate-600">
                {settings?.hero_subtitle ?? "Tour chất lượng – resort xịn – trải nghiệm đáng tiền."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/tours" className="btn btn-primary">Xem tour</a>
                <a href="/contact" className="btn">Tư vấn nhanh</a>
              </div>
            </div>

            <div className="card w-full max-w-xl overflow-hidden">
              <div className="aspect-[16/10] bg-slate-100">
                {settings?.hero_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.hero_image_url} alt={brandName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                    Admin upload ảnh banner để thay thế
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {settings?.hotline ? <span className="badge">📞 {settings.hotline}</span> : null}
                  {settings?.zalo ? <span className="badge">💬 Zalo: {settings.zalo}</span> : null}
                  {settings?.email ? <span className="badge">✉ {settings.email}</span> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-od py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Tour nổi bật</h2>
            <p className="mt-1 text-slate-600">Admin thêm/sửa tour là khách thấy ngay.</p>
          </div>
          <a className="btn" href="/tours">Xem tất cả</a>
        </div>

        {loading ? (
          <div className="mt-6 card p-6 text-slate-600">Đang tải dữ liệu…</div>
        ) : tours.length === 0 ? (
          <div className="mt-6 card p-6">
            <p className="text-slate-700 font-medium">Chưa có tour.</p>
            <p className="muted mt-1">Vào Admin → Tours → Add tour.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.slice(0, 6).map((t) => <TourCard key={t.id} tour={t} />)}
          </div>
        )}
      </section>
    </main>
  );
}
