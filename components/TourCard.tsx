import Link from "next/link";

export type Tour = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  location: string | null;
  duration: string | null;
  price_vnd: number | null;
  cover_url: string | null;
  visible: boolean;
};

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link href={`/tours/${tour.slug}`} className="card overflow-hidden hover:shadow-md transition">
      <div className="aspect-[16/9] w-full bg-slate-100">
        {tour.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tour.cover_url} alt={tour.title} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{tour.title}</h3>
            {tour.subtitle ? <p className="mt-1 text-sm text-slate-600 line-clamp-2">{tour.subtitle}</p> : null}
          </div>
          <span className="badge">{tour.location ?? "Việt Nam"}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {tour.duration ? <span className="badge">⏱ {tour.duration}</span> : null}
          {typeof tour.price_vnd === "number" ? (
            <span className="badge">💰 {tour.price_vnd.toLocaleString("vi-VN")} đ</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
