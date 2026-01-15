"use client";

export type Tour = {
  id: string;
  slug: string;

  title_vi: string;
  title_en: string;
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
  const title = lang === "vi" ? tour.title_vi : tour.title_en;
  const description =
    lang === "vi" ? tour.description_vi : tour.description_en;
  const location =
    lang === "vi" ? tour.location_vi : tour.location_en;

  return (
    <a
      href={`/${lang}/tours/${tour.slug}`}
      className="card overflow-hidden hover:shadow-lg transition"
    >
      {/* Cover */}
      <div className="h-[220px] bg-slate-100 overflow-hidden">
        {tour.cover_url ? (
          <img
            src={tour.cover_url}
            alt={title}
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
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {location && <span className="badge">📍 {location}</span>}
          {tour.duration && <span className="badge">⏱ {tour.duration}</span>}
          {typeof tour.price_vnd === "number" && (
            <span className="badge">
              💰 {tour.price_vnd.toLocaleString("vi-VN")} đ
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
