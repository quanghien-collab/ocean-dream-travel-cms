"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type TourRow = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  duration: string | null;
  price_vnd: number | null;
  cover_url: string | null;
  visible: boolean;
  sort_order: number | null;
};

const EMPTY: Omit<TourRow, "id"> = {
  slug: "",
  title: "",
  location: "",
  duration: "",
  price_vnd: 0,
  cover_url: "",
  visible: true,
  sort_order: 1,
};

export default function AdminToursPage() {
  const sb = useMemo(() => getSupabase(), []);
  const [rows, setRows] = useState<TourRow[]>([]);
  const [editing, setEditing] = useState<TourRow | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function load() {
    const { data } = await sb.from("tours").select("*").order("sort_order");
    setRows((data ?? []) as TourRow[]);
  }

  useEffect(() => { load(); }, []);

  async function saveTour() {
    if (!editing?.slug || !editing?.title) {
      setMsg("Slug và Title là bắt buộc.");
      return;
    }

    const payload: any = { ...editing };
    if (payload.id === "new") delete payload.id;

    await sb.from("tours").upsert(payload);
    setEditing(null);
    load();
  }

  async function deleteTour(id: string) {
    if (!confirm("Xóa tour này?")) return;
    await sb.from("tours").delete().eq("id", id);
    load();
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    setPreview(data.url);
    setEditing((prev) => prev ? { ...prev, cover_url: data.url } : prev);
    setUploading(false);
  }

  return (
    <div className="card p-7">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quản lý Tours</h1>
        <button
          className="btn btn-primary"
          onClick={() => setEditing({ id: "new", ...EMPTY } as TourRow)}
        >
          + Thêm tour mới
        </button>
      </div>

      {msg && <p className="mb-4 text-red-600">{msg}</p>}

      <div className="grid md:grid-cols-2 gap-5">
        {rows.map((t) => (
          <div key={t.id} className="card p-4 flex gap-4">
            <div className="w-40 h-28 bg-slate-100 rounded overflow-hidden">
              {t.cover_url && (
                <img src={t.cover_url} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-sm text-slate-600">{t.location} • {t.duration}</p>
              <p className="mt-1 font-bold text-blue-600">
                {t.price_vnd?.toLocaleString("vi-VN")} đ
              </p>

              <div className="mt-3 flex gap-2">
                <button className="btn" onClick={() => { setEditing(t); setPreview(t.cover_url); }}>
                  Sửa
                </button>
                <button className="btn" onClick={() => deleteTour(t.id)}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM */}
      {editing && (
        <div className="mt-10 card p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4">
            {editing.id === "new" ? "Tạo tour mới" : "Sửa tour"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input className="input" placeholder="Slug" value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />

            <input className="input" placeholder="Title" value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })} />

            <input className="input" placeholder="Location" value={editing.location ?? ""}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })} />

            <input className="input" placeholder="Duration" value={editing.duration ?? ""}
              onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />

            <input className="input" type="number" placeholder="Price"
              value={editing.price_vnd ?? 0}
              onChange={(e) => setEditing({ ...editing, price_vnd: Number(e.target.value) })} />
          </div>

          <div className="mt-4">
            <input type="file" onChange={handleUpload} />
            {uploading && <p className="text-sm text-blue-600">Đang upload...</p>}
            {preview && <img src={preview} className="mt-3 w-64 rounded shadow" />}
          </div>

          <div className="mt-6 flex gap-3">
            <button className="btn btn-primary" onClick={saveTour}>Lưu</button>
            <button className="btn" onClick={() => setEditing(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
}
