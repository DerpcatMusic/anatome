/**
 * Site-wide SEO configuration.
 * Update `domain` when deploying to production.
 */
export const SITE = {
  domain: "https://homebody.fitness", // ← swap to real domain
  name: "HomeBody",
  nameHebrew: "הומבודי",
  tagline: "פילאטיס שיקומי בבית",
  description:
    "פילאטיס אונליין בעברית — שיעורים חיים, מוקלטים ופרטיים. התמחות בפטולוגיות ופילאטיס שיקומי. למדתי אצל מרתה פילאטיס.",
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
  ogImage: "/og-image.jpg", // ← add this image to static/
  twitterHandle: "@homebodypilates", // ← swap if different
  founded: "2024",
  phone: "+972-50-000-0000", // ← swap to real
  email: "hello@homebody.fitness", // ← swap to real
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
    instagram: "https://instagram.com/homebodypilates",
    facebook: "https://facebook.com/homebodypilates",
    youtube: "https://youtube.com/@homebodypilates",
    whatsapp: "https://wa.me/972500000000",
  },
  priceRange: "₪₪",
  openingHours: [
    { dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], opens: "06:00", closes: "22:00" },
    { dayOfWeek: ["Friday"], opens: "06:00", closes: "14:00" },
  ],
} as const;

export type SiteConfig = typeof SITE;
