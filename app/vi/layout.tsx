import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ocean Dream Travel – Du lịch cao cấp, tour nghỉ dưỡng, resort xịn",
  description:
    "Ocean Dream Travel chuyên tour nghỉ dưỡng, resort cao cấp, tour biển đảo, tour miền Tây, tour trong và ngoài nước. Giá tốt – dịch vụ chuẩn.",
  keywords: [
    "tour du lịch",
    "tour nghỉ dưỡng",
    "tour biển",
    "resort cao cấp",
    "du lịch cao cấp",
    "Ocean Dream Travel",
  ],
  openGraph: {
    title: "Ocean Dream Travel – Du lịch cao cấp",
    description: "Tour nghỉ dưỡng, resort xịn, trải nghiệm đẳng cấp.",
    url: "https://ocean-dream-travel-cms.vercel.app/vi",
    siteName: "Ocean Dream Travel",
    images: [
      {
        url: "/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Ocean Dream Travel",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
