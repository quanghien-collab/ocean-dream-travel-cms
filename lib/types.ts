export type SiteSettings = {
  id: string; // always 'singleton'
  brand_name: string;
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  theme_rgb: string; // e.g. "15 76 129"
  hotline: string | null;
  zalo: string | null;
  email: string | null;
};
