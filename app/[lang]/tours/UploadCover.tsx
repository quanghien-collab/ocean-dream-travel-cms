import { getSupabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function UploadCover({ onUploaded }: { onUploaded: (url: string) => void }) {
  const supabase = getSupabase();
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    try {
      setUploading(true);

      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      onUploaded(data.publicUrl); // trả URL về form cha
    } catch (err: any) {
      alert("Upload lỗi: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUpload(e.target.files[0]);
          }
        }}
      />

      {uploading && <p>Đang upload ảnh...</p>}
    </div>
  );
}
