"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type TourRow = {
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
  sort_order: number | null;
};

const EMPTY: Omit<TourRow, "id"> = {
  slug: "",
  title: "",
  subtitle: "",
  location: "",
  duration: "",
  price_vnd: 0,
  cover_url: "",
  content_html: "<p>Mô tả chi tiết tour...</p>",
  visible: true,
  sort_order: 1
};

export default function AdminToursPage() {
  const sb = useMemo(() => getSupabase(), []);
  const [rows, setRows] = useState<TourRow[]>([]);
  const [editing, setEditing] = useState<TourRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function load() {
    const { data } = await sb.from("tours").select("*").order("sort_order", { ascending: true });
    setRows((data ?? []) as TourRow[]);
  }

  useEffect(() => {
    load();
    const ch = sb.channel("realtime-admin-tours")
      .on("postgres_changes", { event: "*", schema: "public", table: "tours" }, () => load())
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, []);

  async function saveTour(t: Partial<TourRow>) {
    setMsg(null);
    const { error } = await sb.from("tours").upsert(t);
    if (error) setMsg(error.message);
    else setMsg("Đã lưu. Website cập nhật realtime.");
    setEditing(null);
    setCreating(false);
  }

  async function deleteTour(id: string) {
    if (!confirm("Xóa tour này?")) return;
    const { error } = await sb.from("tours").delete().eq("id", id);
    if (error) setMsg(error.message);
    else setMsg("Đã xóa.");
  }

  // Upload ảnh
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (data.url && editing) {
      setEditing({ ...editing, cover_url: data.url });
    } else {
      alert("Upload lỗi");
    }
  }

  return (
    <div className="card p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tours</h1>
          <p className="mt-1 text-slate-600">Quản lý tour. Bấm lưu là khách thấy ngay.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setCreating(true);
            setEditing({ id: "new", ...EMPTY } as TourRow);
            setPreview(null);
          }}
        >
          + Add tour
        </button>
      </div>

      {msg && <p className="mt-4 text-sm text-emerald-700">{msg}</p>}

      <div className="mt-6 grid gap-4">
        {rows.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-slate-600">
                  /{r.slug} • {r.location ?? "—"} • {r.duration ?? "—"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="badge">Visible: {r.visible ? "Yes" : "No"}</span>
                  <span className="badge">Order: {r.sort_order ?? "—"}</span>
                  {typeof r.price_vnd === "number" && (
                    <span className="badge">
                      Price: {r.price_vnd.toLocaleString("vi-VN")} đ
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn" onClick={() => { setCreating(false); setEditing(r); setPreview(r.cover_url); }}>Sửa</button>
                <button className="btn" onClick={() => deleteTour(r.id)}>Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-8 card p-6 bg-slate-50">
          <h2 className="text-lg font-semibold">{creating ? "Tạo tour mới" : "Sửa tour"}</h2>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div>
              <label className="label">Slug</label>
              <input className="input" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>

            <div>
              <label className="label">Subtitle</label>
              <input className="input" value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
            </div>

            <div>
              <label className="label">Duration</label>
              <input className="input" value={editing.duration ?? ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
            </div>
            <div>
              <label className="label">Price VND</label>
              <input className="input" type="number" value={editing.price_vnd ?? 0} onChange={(e) => setEditing({ ...editing, price_vnd: Number(e.target.value) })} />
            </div>

            <div className="lg:col-span-2">
              <label className="label">Cover Image</label>
              <input type="file" accept="image/*" onChange={handleUpload} />

              {uploading && <p className="text-blue-600 mt-1">Đang upload ảnh...</p>}

              {preview && (
                <img src={preview} className="mt-2 w-64 rounded shadow border" />
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="label">Cover URL</label>
              <input className="input" value={editing.cover_url ?? ""} readOnly />
            </div>

            <div className="lg:col-span-2">
              <label className="label">Content HTML</label>
              <textarea
                className="input min-h-[180px]"
                value={editing.content_html ?? ""}
                onChange={(e) => setEditing({ ...editing, content_html: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Sort order</label>
              <input className="input" type="number" value={editing.sort_order ?? 1} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
            </div>

            <div className="flex items-end gap-3">
              <label className="label flex items-center gap-2">
                <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} />
                Visible
              </label>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!editing.slug || !editing.title) {
                  setMsg("Slug và Title là bắt buộc.");
                  return;
                }
                const payload = { ...editing };
                if (payload.id === "new") delete (payload as any).id;
                saveTour(payload);
              }}
            >
              Lưu
            </button>

            <button className="btn" onClick={() => { setEditing(null); setCreating(false); }}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
