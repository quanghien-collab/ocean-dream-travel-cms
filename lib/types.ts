// =========================
// SITE SETTINGS (Singleton CMS)
// =========================

export type SiteSettings = {
  id: string; // always "singleton"
  brand_name: string;

  // Hero section (default fallback)
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;

  // Theme
  theme_rgb: string; // e.g. "15 76 129"

  // Contact
  hotline: string | null;
  zalo: string | null;
  email: string | null;
};


// =========================
// HERO SLIDES (Homepage slider)
// =========================

export type HeroSlide = {
  id: string;

  title_vi: string | null;
  title_en: string | null;

  subtitle_vi: string | null;
  subtitle_en: string | null;

  image_url: string;

  cta_text_vi: string | null;
  cta_text_en: string | null;
  cta_href: string | null;

  sort_order: number;
  is_active: boolean;
};


// =========================
// TOUR (Main product entity)
// =========================

export type Tour = {
  id: string;
  slug: string;

  // Song ngữ
  title_vi: string;
  title_en: string;

  description_vi: string;
  description_en: string;

  location_vi: string;
  location_en: string;

  // Info
  duration: string;        // "4 ngày 3 đêm"
  price_vnd: number;      // 6990000
  cover_url: string;

  visible: boolean;
  sort_order: number;
};


// =========================
// TOUR CARD VIEW MODEL
// (dùng cho frontend render)
// =========================

export type TourView = {
  id: string;
  slug: string;

  title: string;
  description: string;
  location: string;

  duration: string;
  price_vnd: number;
  cover_url: string;
};


// =========================
// CONTACT FORM
// =========================

export type ContactLead = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  created_at: string;
};


// =========================
// LANGUAGE
// =========================

export type Lang = "vi" | "en";
