"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

type TourDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  location: string | null;
  duration: string | null;
  price_vnd: number | null;
  cover_url: string | null;
  content_html: string | null;
  visible: boolean;
};

export default function TourDetailPage() {
  const params = useParams<{ slug: string }>();
  const sb = useMemo(() => getSupabase(), []);
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await sb.from("tours")
      .select("*")
      .eq("slug", params.slug)
      .eq("visible", true)
      .maybeSingle();
    setTour((data ?? null) as TourDetail | null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = sb.channel("realtime-tour-detail")
      .on("postgres_changes", { event: "*", schema: "public", table: "tours" }, () => load())
      .subscribe();
    return () => { sb.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  if (loading) return <main className="container-od py-10"><div className="card p-6">Đang tải…</div></main>;
  if (!tour) return <main className="container-od py-10"><div className="card p-6">Không tìm thấy tour.</div></main>;

  return (
    <main className="container-od py-10">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <article className="card overflow-hidden">
          <div className="aspect-[16/9] bg-slate-100">
            {tour.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tour.cover_url} alt={tour.title} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="p-7">
            <h1 className="text-3xl font-semibold">{tour.title}</h1>
            {tour.subtitle ? <p className="mt-2 text-slate-600">{tour.subtitle}</p> : null}

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {tour.location ? <span className="badge">📍 {tour.location}</span> : null}
              {tour.duration ? <span className="badge">⏱ {tour.duration}</span> : null}
              {typeof tour.price_vnd === "number" ? <span className="badge">💰 {tour.price_vnd.toLocaleString("vi-VN")} đ</span> : null}
            </div>

            <div className="prose prose-slate mt-6 max-w-none">
              {tour.content_html ? (
                <div dangerouslySetInnerHTML={{ __html: tour.content_html }} />
              ) : (
                <p className="text-slate-600">Admin chưa nhập nội dung chi tiết cho tour này.</p>
              )}
            </div>
          </div>
        </article>

        <aside className="card p-6 h-fit">
          <h2 className="text-lg font-semibold">Đăng ký tư vấn</h2>
          <p className="mt-1 text-sm text-slate-600">Để lại thông tin, bên mình gọi lại ngay.</p>

          <form className="mt-4 grid gap-3" action="/contact">
            <input className="input" placeholder="Họ tên" name="name" />
            <input className="input" placeholder="Số điện thoại" name="phone" />
            <input className="input" placeholder="Email (tuỳ chọn)" name="email" />
            <button className="btn btn-primary" type="submit">Gửi</button>
          </form>

          <p className="mt-3 text-xs text-slate-500">
            (Bản demo) Form này hiện chuyển qua trang Liên hệ. Tiến sĩ muốn lưu lead vào DB thì Lucky nâng cấp ngay.
          </p>
        </aside>
      </div>
    </main>
  );
}
