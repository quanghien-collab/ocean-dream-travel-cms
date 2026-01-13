"use client";

import { useEffect, useMemo, useState } from "react";
import TourCard, { Tour } from "@/components/TourCard";
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

export default function HomePage() {
  const supabase = useMemo(() => getSupabase(), []);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const [idx, setIdx] = useState(0);

  async function loadAll() {
    setLoading(true);

    const [{ data: site }, { data: tourList }, { data: slideList }] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", "singleton").maybeSingle(),
      supabase
        .from("tours")
        .select("id,slug,title,subtitle,location,duration,price_vnd,cover_url,visible,sort_order")
        .eq("visible", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("hero_slides")
        .select("id,title,subtitle,image_url,cta_text,cta_href,sort_order,enabled")
        .eq("enabled", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (site) {
      setSettings(site as SiteSettings);
      if ((site as any).theme_rgb) document.documentElement.style.setProperty("--brand", (site as any).theme_rgb);
    }

    setTours((tourList ?? []) as Tour[]);
    setSlides((slideList ?? []) as HeroSlide[]);
    setLoading(false);
  }

  // auto slide
  useEffect(() => {
    if (!slides.length) return;
    setIdx(0);
    const t = setInterval(() => setIdx((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    loadAll();

    const chSettings = supabase
      .channel("realtime-site-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => loadAll())
      .subscribe();

    const chTours = supabase
      .channel("realtime-tours")
      .on("postgres_changes", { event: "*", schema: "public", table: "tours" }, () => loadAll())
      .subscribe();

    const chSlides = supabase
      .channel("realtime-hero-slides")
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_slides" }, () => loadAll())
      .subscribe();

    return () => {
      supabase.removeChannel(chSettings);
      supabase.removeChannel(chTours);
      supabase.removeChannel(chSlides);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brandName = settings?.brand_name ?? "Ocean Dream Travel";
  const heroTitle = settings?.hero_title ?? "Chạm vào giấc mơ biển xanh";
  const heroSubtitle = settings?.hero_subtitle ?? "Tour chất lượng – resort xịn – trải nghiệm đáng tiền.";

  const active = slides[idx];
  const heroImage = active?.image_url || settings?.hero_image_url || "";

  return (
    <main>
      {/* HERO PRO */}
      <section className="relative overflow-hidden bg-white">
        <div className="container-od py-10 md:py-14">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight">{active?.title ?? heroTitle}</h1>
              <p className="mt-3 text-base text-slate-600">{active?.subtitle ?? heroSubtitle}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="badge">✅ Tour chọn lọc</span>
                <span className="badge">✅ Giá rõ ràng</span>
                <span className="badge">✅ Hỗ trợ 24/7</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={active?.cta_href ?? "/tours"} className="btn btn-primary">
                  {active?.cta_text ?? "Xem tour hot"}
                </a>
                <a href="/contact" className="btn">
                  Tư vấn nhanh
                </a>
              </div>

              {/* Search box đơn giản */}
              <div className="mt-6 card p-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input className="input flex-1" placeholder="Bạn muốn đi đâu? (VD: Phú Quốc, Đà Lạt...)" />
                <a href="/tours" className="btn btn-primary sm:w-auto w-full">Tìm tour</a>
              </div>
            </div>

            {/* Right: Slider Image */}
            <div className="card w-full overflow-hidden">
              <div className="relative aspect-[16/10] bg-slate-100">
                {heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={heroImage}
                    src={heroImage}
                    alt={brandName}
                    className="h-full w-full object-cover transition-opacity duration-500"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                    Admin upload ảnh banner để thay thế
                  </div>
                )}

                {/* Dots */}
                {slides.length > 1 ? (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => setIdx(i)}
                        className={`h-2.5 w-2.5 rounded-full ${i === idx ? "bg-slate-900" : "bg-slate-300"}`}
                        aria-label={`slide-${i}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {settings?.hotline && <span className="badge">📞 {settings.hotline}</span>}
                  {settings?.zalo && <span className="badge">💬 Zalo: {settings.zalo}</span>}
                  {settings?.email && <span className="badge">✉ {settings.email}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED TOURS */}
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
            <p className="muted mt-1">Vào Admin → Tours → Thêm tour.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.slice(0, 6).map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
