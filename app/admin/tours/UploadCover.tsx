"use client";

import { useState } from "react";

export default function UploadCover({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

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

    if (data.url) {
      onUploaded(data.url);
    } else {
      alert("Upload lỗi!");
    }
  }

  return (
    <div className="space-y-2">
      <label className="font-medium">Cover Image</label>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {uploading && <p className="text-blue-600">Đang upload ảnh...</p>}

      {preview && (
        <img src={preview} className="w-64 rounded shadow border" />
      )}
    </div>
  );
}
