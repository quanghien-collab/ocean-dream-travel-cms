"use client";

import { useEffect, useMemo, useState } from "react";
import TourCard from "@/app/components/TourCard";
import { getSupabase } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/lib/types";

type HeroSlide = {
  id: string;
  title_vi: string | null;
  title_en: string | null;
  subtitle_vi: string | null;
  subtitle_en: string | null;
  image_url: string;
  cta_text_vi: string | null;
  cta_text_en: string | null;
  cta_href: string | null;
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

export default function HomePage({ lang }: { lang: "vi" | "en" }) {
  const supabase = useMemo(() => getSupabase(), []);
  const [tours, setTours] = useState<Tour[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [{ data: site }, { data: tourList }, { data: slideList }] =
      await Promise.all([
        supabase.from("site_settings").select("*").eq("id", "singleton").maybeSingle(),

        supabase
          .from("tours")
          .select(`
            id,slug,duration,price_vnd,cover_url,
            title_vi,title_en,
            description_vi,description_en,
            location_vi,location_en
          `)
          .eq("visible", true)
          .order("sort_order"),

        supabase
          .from("hero_slides")
          .select(`
            id,image_url,cta_href,
            title_vi,title_en,
            subtitle_vi,subtitle_en,
            cta_text_vi,cta_text_en
          `)
          .eq("is_active", true)
          .order("sort_order")
      ]);

    setSettings(site as SiteSettings);
    setTours(tourList as Tour[]);
    setSlides(slideList as HeroSlide[]);
  }

  const hero = slides[0];

  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="container-od py-14 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl font-semibold">
            {lang === "vi" ? hero?.title_vi : hero?.title_en}
          </h1>

          <p className="mt-3 text-slate-600">
            {lang === "vi" ? hero?.subtitle_vi : hero?.subtitle_en}
          </p>

          <div className="mt-6 flex gap-3">
            <a href={`/${lang}/tours`} className="btn btn-primary">
              {lang === "vi" ? hero?.cta_text_vi : hero?.cta_text_en}
            </a>
            <a href={`/${lang}/contact`} className="btn">
              {lang === "vi" ? "Tư vấn nhanh" : "Quick consultation"}
            </a>
          </div>
        </div>

        <div className="card overflow-hidden">
          <img src={hero?.image_url || ""} className="w-full h-full object-cover" />
        </div>
      </section>

      {/* TOURS */}
      <section className="container-od py-12">
        <h2 className="text-2xl font-semibold mb-6">
          {lang === "vi" ? "Tour nổi bật" : "Featured Tours"}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map(tour => (
            <TourCard
              key={tour.id}
              lang={lang}
              tour={{
                ...tour,
                title: lang === "vi" ? tour.title_vi : tour.title_en,
                description: lang === "vi" ? tour.description_vi : tour.description_en,
                location: lang === "vi" ? tour.location_vi : tour.location_en,
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
