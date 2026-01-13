"use client";

import { useState } from "react";
import UploadCover from "./UploadCover";

export default function CreateTourForm() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      title,
      subtitle,
      cover: coverUrl,
    };

    console.log("Submit tour:", payload);
    alert("Demo lưu tour thành công!");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold">Tạo tour mới</h2>

      <input
        placeholder="Tên tour"
        className="w-full border p-2 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Subtitle"
        className="w-full border p-2 rounded"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
      />

      <UploadCover onUploaded={(url) => setCoverUrl(url)} />

      <input
        placeholder="Cover URL tự sinh"
        className="w-full border p-2 rounded"
        value={coverUrl}
        readOnly
      />

      <button className="bg-blue-600 text-white px-6 py-2 rounded">
        Lưu tour
      </button>
    </form>
  );
}
