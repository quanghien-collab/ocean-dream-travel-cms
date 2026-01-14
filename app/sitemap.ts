import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ocean-dream-travel-cms.vercel.app";

  return [
    { url: `${base}/vi`, lastModified: new Date() },
    { url: `${base}/vi/tours`, lastModified: new Date() },
    { url: `${base}/vi/contact`, lastModified: new Date() },

    { url: `${base}/en`, lastModified: new Date() },
    { url: `${base}/en/tours`, lastModified: new Date() },
    { url: `${base}/en/contact`, lastModified: new Date() },
  ];
}
