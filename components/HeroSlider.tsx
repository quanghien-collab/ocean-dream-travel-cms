"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_href: string | null;
  image_url: string;
};

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    const sb = getSupabase();

    async function load() {
      const { data } = await sb
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      setSlides(data ?? []);
    }

    load();

    // realtime
    const ch = sb
      .channel("hero-slider")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hero_slides" },
        () => load()
      )
      .subscribe();

    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  if (!slides.length) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div>
        <h1 className="text-4xl font-bold">{slides[0].title}</h1>
        <p className="mt-3 text-slate-600">{slides[0].subtitle}</p>

        <div className="mt-6 flex gap-3">
          <a href={slides[0].cta_href ?? "/tours"} className="btn btn-primary">
            {slides[0].cta_text ?? "Xem tour"}
          </a>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-lg">
        <img
          src={slides[0].image_url}
          className="w-full h-[420px] object-cover"
          alt={slides[0].title}
        />
      </div>
    </div>
  );
}
