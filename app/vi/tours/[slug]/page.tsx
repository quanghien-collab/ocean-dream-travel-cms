"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function TourDetailPage({ params }: { params: { slug: string } }) {
  const [tour, setTour] = useState<any>(null);
  const lang = typeof window !== "undefined" && window.location.pathname.startsWith("/en") ? "en" : "vi";

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase();

      const { data } = await supabase
        .from("tours")
        .select("*")
        .eq("slug", params.slug)
        .single();

      setTour(data);
    };

    load();
  }, []);

  if (!tour) return <div className="container-od py-12">Loading...</div>;

  const title = lang === "vi" ? tour.title_vi : tour.title_en;
  const description = lang === "vi" ? tour.description_vi : tour.description_en;
  const location = lang === "vi" ? tour.location_vi : tour.location_en;

  return (
    <main className="container-od py-12">
      <div className="grid lg:grid-cols-2 gap-10">
        <img src={tour.cover_url} className="rounded-xl w-full" />

        <div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-3 text-slate-600">{description}</p>

          <div className="mt-4 flex gap-3 text-sm">
            <span className="badge">📍 {location}</span>
            <span className="badge">⏱ {tour.duration}</span>
            <span className="badge">💰 {tour.price_vnd.toLocaleString("vi-VN")} đ</span>
          </div>

          <div className="mt-6">
            <a href={`/${lang}/contact`} className="btn btn-primary">
              {lang === "vi" ? "Đăng ký tư vấn" : "Request consultation"}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
