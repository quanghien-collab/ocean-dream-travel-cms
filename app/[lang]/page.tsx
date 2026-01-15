import HomePage from "@/app/components/HomePage";

export default function Page({ params }: { params: { lang: "vi" | "en" } }) {
  return <HomePage lang={params.lang} />;
}
