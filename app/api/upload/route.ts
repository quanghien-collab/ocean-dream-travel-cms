import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const fileName = `cover_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicData.publicUrl,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
