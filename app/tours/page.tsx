"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
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
};

const EMPTY: Omit<TourRow, "id"> = {
  slug: "",
  title: "",
  location: "",
  duration: "",
  price_vnd: 0,
  cover_url: "",
  visible: true,
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
    const { data, error } = await sb.from("tours").select("*").order("id");
    if (error) setMsg(error.message);
    setRows((data ?? []) as TourRow[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveTour(t: Partial<TourRow>) {
    setMsg(null);
    const { error } = await sb.from("tours").upsert(t);
    if (error) setMsg(error.message);
    else {
      setMsg("Đã lưu thành công.");
      setEditing(null);
      setCreating(false);
      load();
    }
  }

  async function deleteTour(id: string) {
    if (!confirm("Xóa tour này?")) return;
    const { error } = await sb.from("tours").delete().eq("id", id);
    if (error) setMsg(error.message);
    else load();
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.url) throw new Error("Upload lỗi");

      setEditing((prev) => prev ? { ...prev, cover_url: data.url } : prev);
      setMsg("Upload ảnh thành công.");
    } catch (err: any) {
      setMsg(err.message || "Upload lỗi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Quản lý Tours</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setCreating(true);
            setEditing({ id: "new", ...EMPTY } as TourRow);
            setPreview(null);
          }}
        >
          + Thêm tour mới
        </button>
      </div>

      {msg && <p className="mt-3 text-green-600">{msg}</p>}

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {rows.map((r) => (
          <div key={r.id} className="card p-4 flex gap-4">
            <img
              src={r.cover_url || "/no-image.png"}
              className="w-40 h-28 object-cover rounded"
            />

            <div className="flex-1">
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm text-slate-600">
                {r.location} • {r.duration}
              </p>
              <p className="text-blue-600 font-medium mt-1">
                {r.price_vnd?.toLocaleString("vi-VN")} đ
              </p>

              <div className="mt-2 flex gap-2">
                <button className="btn" onClick={() => {
                  setEditing(r);
                  setCreating(false);
                  setPreview(r.cover_url);
                }}>
                  Sửa
                </button>
                <button className="btn" onClick={() => deleteTour(r.id)}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM */}
      {editing && (
        <div className="card p-6 mt-8 bg-slate-50">
          <h2 className="text-lg font-semibold mb-4">
            {creating ? "Tạo tour mới" : "Sửa tour"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Slug"
              value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
            />
            <input className="input" placeholder="Title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <input className="input" placeholder="Location"
              value={editing.location ?? ""}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
            />
            <input className="input" placeholder="Duration"
              value={editing.duration ?? ""}
              onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
            />
            <input className="input" type="number" placeholder="Price"
              value={editing.price_vnd ?? 0}
              onChange={(e) => setEditing({ ...editing, price_vnd: Number(e.target.value) })}
            />
          </div>

          <div className="mt-4">
            <label className="font-medium">Ảnh tour</label>
            <input type="file" onChange={handleUpload} className="mt-2" />
            {uploading && <p className="text-blue-600 mt-1">Đang upload...</p>}
            {preview && <img src={preview} className="w-64 mt-3 rounded shadow" />}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              className="btn btn-primary"
              onClick={() => {
                const payload: any = { ...editing };
                if (payload.id === "new") delete payload.id;
                saveTour(payload);
              }}
            >
              Lưu
            </button>

            <button className="btn" onClick={() => setEditing(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
}
