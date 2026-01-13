"use client";

export type Tour = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  location: string | null;
  duration: string | null;
  price_vnd: number | null;
  cover_url: string | null;
  visible?: boolean;
};

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <a
      href={`/tours/${tour.slug}`}
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

        {tour.subtitle ? (
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {tour.subtitle}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {tour.location ? <span className="badge">📍 {tour.location}</span> : null}
          {tour.duration ? <span className="badge">⏱ {tour.duration}</span> : null}
          {typeof tour.price_vnd === "number" ? (
            <span className="badge">💰 {tour.price_vnd.toLocaleString("vi-VN")} đ</span>
          ) : null}
        </div>
      </div>
    </a>
  );
}
