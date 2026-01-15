"use client";

import { useEffect, useMemo, useState } from "react";
import TourCard from "@/app/components/TourCard";
import { getSupabase } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/lib/types";

type HeroSlide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  cta_href: string | null;
  sort_order: number;
};

type Tour = {
  id: string;
  slug: string;
  title_vi: string;
  title_en: string;
  description_vi: string;
  description_en: string;
  location_vi: string;
  location_en: string;
  duration: string;
  price_vnd: number;
  cover_url: string;
};

const TEXT = {
  vi: {
    btn_view: "Xem tour hot",
    btn_contact: "Đăng ký tư vấn",
    section_title: "Tour nổi bật",
    view_all: "Xem tất cả",
    loading: "Đang tải dữ liệu…",
  },
  en: {
    btn_view: "View hot tours",
    btn_contact: "Request consultation",
    section_title: "Featured Tours",
    view_all: "View all",
    loading: "Loading data…",
  },
};

export default function HomePage({ lang }: { lang: "vi" | "en" }) {
  const supabase = useMemo(() => getSupabase(), []);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const t = TEXT[lang];

  async function loadAll() {
    setLoading(true);

    const [{ data: site }, { data: tourList }, { data: slideList }] =
      await Promise.all([
        supabase
          .from("site_settings")
          .select("*")
          .eq("id", "singleton")
          .maybeSingle(),

        supabase
          .from("tours")
          .select(`
            id,slug,duration,price_vnd,cover_url,
            title_vi,title_en,
            description_vi,description_en,
            location_vi,location_en
          `)
          .eq("visible", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("hero_slides")
          .select("id,title,subtitle,image_url,cta_href,sort_order")
          .order("sort_order", { ascending: true }),
      ]);

    if (site) setSettings(site as SiteSettings);
    setTours((tourList ?? []) as Tour[]);
    setSlides((slideList ?? []) as HeroSlide[]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const active = slides.length > 0 ? slides[0] : null;

  const heroTitle =
    active?.title ||
    settings?.hero_title ||
    "Chạm vào giấc mơ biển xanh";

  const heroSubtitle =
    active?.subtitle ||
    settings?.hero_subtitle ||
    "Tour chất lượng – resort xịn – trải nghiệm đáng tiền.";

  const heroImage =
    active?.image_url ||
    settings?.hero_image_url ||
    "";

  const heroCta = t.btn_view;

  return (
    <main>
      {/* HERO */}
      <section className="bg-white">
        <div className="container-od py-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-semibold">{heroTitle}</h1>
            <p className="mt-3 text-slate-600">{heroSubtitle}</p>

            <div className="mt-6 flex gap-3">
              <a href={`/${lang}/tours`} className="btn btn-primary">
                {heroCta}
              </a>
              <a href={`/${lang}/contact`} className="btn">
                {t.btn_contact}
              </a>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="aspect-[16/10] bg-slate-100">
              {heroImage && (
                <img
                  src={heroImage}
                  alt="Hero banner"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TOURS */}
      <section className="container-od py-12">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{t.section_title}</h2>
          <a className="btn" href={`/${lang}/tours`}>
            {t.view_all}
          </a>
        </div>

        {loading ? (
          <div className="mt-6 card p-6">{t.loading}</div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
