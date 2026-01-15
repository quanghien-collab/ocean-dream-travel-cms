"use client";

import { useEffect, useMemo, useState } from "react";
import TourCard from "@/app/components/TourCard";
import { getSupabase } from "@/lib/supabaseClient";

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

export default function ToursPage({ params }: { params: { lang: "vi" | "en" } }) {
  const lang = params.lang;
  const supabase = useMemo(() => getSupabase(), []);

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTours() {
    setLoading(true);

    const { data } = await supabase
      .from("tours")
      .select(`
        id,slug,duration,price_vnd,cover_url,
        title_vi,title_en,
        description_vi,description_en,
        location_vi,location_en
      `)
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    setTours((data ?? []) as Tour[]);
    setLoading(false);
  }

  useEffect(() => {
    loadTours();
  }, []);

  return (
    <main className="container-od py-10">
      <h1 className="text-3xl font-semibold mb-6">
        {lang === "vi" ? "Danh sách tour" : "Tour list"}
      </h1>

      {loading ? (
        <div className="card p-6">Loading…</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} lang={lang} />
          ))}
        </div>
      )}
    </main>
  );
}
