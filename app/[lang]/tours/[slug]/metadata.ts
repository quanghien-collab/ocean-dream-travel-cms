import { getSupabase } from "@/lib/supabaseClient";

export async function generateMetadata({ params }: { params: { lang: "vi" | "en"; slug: string } }) {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("tours")
    .select("title_vi,title_en,description_vi,description_en")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!data) return {};

  return {
    title: params.lang === "vi" ? data.title_vi : data.title_en,
    description: params.lang === "vi" ? data.description_vi : data.description_en,
  };
}
