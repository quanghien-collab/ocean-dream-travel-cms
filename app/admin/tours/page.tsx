"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
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
  sort_order: 1,
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
    const { data, error } = await sb
      .from("tours")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) setMsg(error.message);
    setRows((data ?? []) as TourRow[]);
  }

  useEffect(() => {
    load();
    const ch = sb
      .channel("realtime-admin-tours")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tours" },
        () => load()
      )
      .subscribe();

    return () => {
      sb.removeChannel(ch);
    };
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

  // ✅ Upload ảnh trực tiếp lên Supabase Storage
  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploading(true);
    setMsg(null);

    try {
      const ext = file.name.split(".").pop();
      const fileName = `tour-${Date.now()}.${ext}`;

      // Upload lên bucket images
      const { error } = await sb.storage
        .from("images")
        .upload(fileName, file, { upsert: false });

      if (error) throw error;

      // Lấy public URL
      const { data } = sb.storage.from("images").getPublicUrl(fileName);

      // Preview ngay
      setPreview(data.publicUrl);

      // Gán URL vào form
      setEditing({ ...editing, cover_url: data.publicUrl });

      setMsg("Upload ảnh thành công.");
    } catch (err: any) {
      setMsg("Upload lỗi: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
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
            setMsg(null);
          }}
        >
          + Add tour
        </button>
      </div>

      {msg && <p className="mt-4 text-sm text-emerald-700">{msg}</p>}

      <div className="mt-6 grid gap-4">
        {rows.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-slate-600">
                  /{r.slug} • {r.location ?? "—"} • {r.duration ?? "—"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn"
                  onClick={() => {
                    setCreating(false);
                    setEditing(r);
                    setPreview(r.cover_url);
                  }}
                >
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

      {editing && (
        <div className="mt-8 card p-6 bg-slate-50">
          <h2 className="text-lg font-semibold">
            {creating ? "Tạo tour mới" : "Sửa tour"}
          </h2>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
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

            <div className="lg:col-span-2">
              <label className="label">Cover Image (upload từ máy)</label>
              <input type="file" accept="image/*" onChange={handleUpload} />

              {uploading && <p className="text-blue-600">Đang upload ảnh...</p>}

              {preview && (
                <img src={preview} className="mt-2 w-72 rounded border shadow" />
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="label">Cover URL (tự động)</label>
              <input className="input" value={editing.cover_url ?? ""} readOnly />
            </div>
          </div>

          <div className="mt-5 flex gap-2">
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

            <button className="btn" onClick={() => setEditing(null)}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
