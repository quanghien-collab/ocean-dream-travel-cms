import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const fileName = `covers/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("tour-covers")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage
    .from("tour-covers")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl.publicUrl });
}
