/**
 * Site-wide SEO configuration.
 * Update `domain` when deploying to production.
 */
export const SITE = {
  domain: "https://www.anatome.co.il",
  name: "AnatoMe",
  nameHebrew: "אנטומי",
  tagline: "פילאטיס שיקומי לכל גוף — בבית שלך ובקצב שלך",
  description:
    "שיעורי פילאטיס שיקומי אונליין בעברית בהנחיית יובל דלל (בוגרת מרתה פילאטיס). טיפול בכאבים, פריצות דיסק, אוסטאופורוזיס ושיקום תנועתי ללא לחץ.",
  keywords: [
    "פילאטיס אונליין",
    "שיעורי פילאטיס אונליין",
    "פילאטיס שיקומי",
    "פילאטיס לכאבי גב",
    "פילאטיס בבית",
    "פילאטיס בעברית",
    "שיעורים חיים פילאטיס",
    "פילאטיס פרטי אונליין",
    "פילאטיס לדיסק",
    "פילאטיס לכתף קפואה",
    "פילאטיס לברכיים",
    "פילאטיס אחרי ניתוח",
    "פילאטיס רפואי",
    "פילאטיס קליני",
    "פילאטיס עם מגבלות",
    "פילאטיס לנשים",
    "שיעור פילאטיס בזום",
    "Pilates online Israel",
    "Online pilates Hebrew",
    "Rehabilitative pilates online",
    "מרתה פילאטיס",
    "פילאטיס קלאסי",
  ].join(", "),
  locale: "he_IL",
  lang: "he",
  dir: "rtl" as const,
  themeColor: "#faf8f3",
  ogImage: "/og-image.webp",
  /**
   * Full-bleed hero video — set when `static/media/hero-yuval.mp4` exists (see static/media/README.md).
   * Leave null in dev to avoid 404 until the asset is added.
   */
  heroVideo: null as string | null,
  heroPoster: "/og-image.webp",
  twitterHandle: "@anatomepilates",
  founded: "2024",
  phone: "+972-50-000-0000", // ← swap to real
  email: "hello@anatome.co.il",
  address: {
    street: "", // ← fill if physical
    city: "תל אביב",
    region: "IL",
    postalCode: "",
    country: "IL",
  },
  geo: {
    latitude: "32.0853",
    longitude: "34.7818",
  },
  social: {
    instagram: "https://instagram.com/anatomepilates",
    facebook: "https://facebook.com/anatomepilates",
    youtube: "https://youtube.com/@anatomepilates",
    whatsapp: "https://wa.me/972500000000",
  },
  priceRange: "₪₪",
  openingHours: [
    { dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], opens: "06:00", closes: "22:00" },
    { dayOfWeek: ["Friday"], opens: "06:00", closes: "14:00" },
  ],
} as const;

export type SiteConfig = typeof SITE;
