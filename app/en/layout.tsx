import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ocean Dream Travel – Luxury Tours & Premium Resorts",
  description:
    "Ocean Dream Travel offers premium tours, luxury resorts, beach holidays and unforgettable experiences in Vietnam and Asia.",
  keywords: [
    "luxury tours",
    "resort holidays",
    "beach tours",
    "premium travel",
    "Ocean Dream Travel",
  ],
  openGraph: {
    title: "Ocean Dream Travel – Luxury Travel",
    description: "Premium tours, luxury resorts, unforgettable experiences.",
    url: "https://ocean-dream-travel-cms.vercel.app/en",
    siteName: "Ocean Dream Travel",
    images: [
      {
        url: "/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Ocean Dream Travel",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
