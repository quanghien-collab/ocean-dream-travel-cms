"use client";

import { useEffect, useMemo, useState } from "react";
import TourCard, { Tour } from "@/components/TourCard";
import { getSupabase } from "@/lib/supabaseClient";

export default function ToursPage() {
  const sb = useMemo(() => getSupabase(), []);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await sb
      .from("tours")
      .select("id,slug,title,subtitle,location,duration,price_vnd,cover_url,visible")
      .eq("visible", true)
      .order("sort_order", { ascending: true });
    setTours((data ?? []) as Tour[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = sb
      .channel("realtime-tours-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "tours" }, () => load())
      .subscribe();
    return () => { sb.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container-od py-10">
      <h1 className="text-3xl font-semibold">Tours</h1>
      <p className="mt-2 text-slate-600">Danh sách tour cập nhật realtime.</p>

      {loading ? (
        <div className="mt-6 card p-6 text-slate-600">Đang tải…</div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((t) => <TourCard key={t.id} tour={t} />)}
        </div>
      )}
    </main>
  );
}
