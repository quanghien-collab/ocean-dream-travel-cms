"use client";

import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";

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
    booking: "Đăng ký tư vấn",
    booking_desc: "Để lại thông tin, bên mình gọi lại ngay.",
    fullname: "Họ tên",
    phone: "Số điện thoại",
    email: "Email (tuỳ chọn)",
    send: "Gửi thông tin",
    related: "Tour liên quan",
    price: "Giá tour",
    duration: "Thời gian",
    location: "Điểm đến"
  },
  en: {
    booking: "Booking Request",
    booking_desc: "Leave your info, we will contact you shortly.",
    fullname: "Full name",
    phone: "Phone number",
    email: "Email (optional)",
    send: "Submit",
    related: "Related Tours",
    price: "Price",
    duration: "Duration",
    location: "Destination"
  }
};

export default function TourDetailPage({
  params,
}: {
  params: { lang: "vi" | "en"; slug: string };
}) {
  const supabase = useMemo(() => getSupabase(), []);
  const [tour, setTour] = useState<Tour | null>(null);
  const [related, setRelated] = useState<Tour[]>([]);
  const lang = params.lang;
  const t = TEXT[lang];

  async function loadData() {
    const { data } = await supabase
      .from("tours")
      .select(`
        id,slug,duration,price_vnd,cover_url,
        title_vi,title_en,
        description_vi,description_en,
        location_vi,location_en
      `)
      .eq("slug", params.slug)
      .maybeSingle();

    if (!data) {
      notFound();
      return;
    }

    setTour(data as Tour);

    // Related tours
    const { data: rel } = await supabase
      .from("tours")
      .select(`
        id,slug,duration,price_vnd,cover_url,
        title_vi,title_en,
        description_vi,description_en,
        location_vi,location_en
      `)
      .neq("slug", params.slug)
      .limit(3);

    setRelated((rel ?? []) as Tour[]);
  }

  useEffect(() => {
    loadData();
  }, [params.slug, lang]);

  if (!tour) return null;

  const title = lang === "vi" ? tour.title_vi : tour.title_en;
  const description = lang === "vi" ? tour.description_vi : tour.description_en;
  const location = lang === "vi" ? tour.location_vi : tour.location_en;

  return (
    <main className="container-od py-12">
      <div className="grid lg:grid-cols-3 gap-10">

        {/* LEFT CONTENT */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <img
              src={tour.cover_url}
              alt={title}
              className="w-full h-[420px] object-cover"
            />

            <div className="p-6">
              <h1 className="text-3xl font-semibold">{title}</h1>
              <p className="mt-2 text-slate-600">{description}</p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="badge">📍 {t.location}: {location}</span>
                <span className="badge">⏱ {t.duration}: {tour.duration}</span>
                <span className="badge">💰 {t.price}: {tour.price_vnd.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
          </div>

          {/* RELATED */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-5">{t.related}</h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((r) => {
                  const rTitle = lang === "vi" ? r.title_vi : r.title_en;
                  const rDesc = lang === "vi" ? r.description_vi : r.description_en;

                  return (
                    <a
                      key={r.id}
                      href={`/${lang}/tours/${r.slug}`}
                      className="card overflow-hidden hover:shadow-lg transition"
                    >
                      <img
                        src={r.cover_url}
                        alt={rTitle}
                        className="h-[180px] w-full object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-2">{rTitle}</h3>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                          {rDesc}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT FORM */}
        <div>
          <div className="card p-6 sticky top-24">
            <h3 className="text-xl font-semibold">{t.booking}</h3>
            <p className="mt-1 text-sm text-slate-600">{t.booking_desc}</p>

            <div className="mt-4 space-y-3">
              <input className="input w-full" placeholder={t.fullname} />
              <input className="input w-full" placeholder={t.phone} />
              <input className="input w-full" placeholder={t.email} />

              <button className="btn btn-primary w-full">{t.send}</button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
