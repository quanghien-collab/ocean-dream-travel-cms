"use client";

import Link from "next/link";

export type Tour = {
  id: string;
  slug: string;

  // dữ liệu hiển thị theo ngôn ngữ
  title: string;
  description?: string;
  location?: string;

  // dữ liệu gốc song ngữ (nếu cần dùng ở nơi khác)
  title_vi?: string;
  title_en?: string;
  description_vi?: string;
  description_en?: string;
  location_vi?: string;
  location_en?: string;

  duration?: string;
  price_vnd?: number;
  cover_url?: string;
};

export default function TourCard({
  tour,
  lang = "vi",
}: {
  tour: Tour;
  lang?: "vi" | "en";
}) {
  return (
    <Link
      href={`/${lang}/tours/${tour.slug}`}
      className="card overflow-hidden hover:shadow-lg transition"
    >
      {/* Cover */}
      <div className="h-[220px] bg-slate-100 overflow-hidden">
        {tour.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tour.cover_url}
            alt={tour.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-semibold text-lg leading-snug line-clamp-2">
          {tour.title}
        </h3>

        {tour.description ? (
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {tour.description}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {tour.location ? <span className="badge">📍 {tour.location}</span> : null}
          {tour.duration ? <span className="badge">⏱ {tour.duration}</span> : null}

          {typeof tour.price_vnd === "number" ? (
            <span className="badge">
              💰{" "}
              {lang === "vi"
                ? tour.price_vnd.toLocaleString("vi-VN") + " đ"
                : tour.price_vnd.toLocaleString("en-US") + " VND"}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
