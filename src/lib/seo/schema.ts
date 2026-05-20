import { SITE } from "./config";


// ─── Base types ───────────────────────────────────────────
export type JsonLd = Record<string, unknown>;

function ld(type: string, rest: JsonLd): JsonLd {
  return { "@context": "https://schema.org", "@type": type, ...rest };
}

// ─── WebSite ──────────────────────────────────────────────
export function websiteSchema(searchUrl?: string): JsonLd {
  const base = ld("WebSite", {
    name: `${SITE.name} | ${SITE.tagline}`,
    url: SITE.domain,
    inLanguage: SITE.locale,
    description: SITE.description,
    publisher: { "@id": `${SITE.domain}/#organization` },
  });
  if (searchUrl) {
    (base as JsonLd).potentialAction = {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.domain}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    };
  }
  return base;
}

// ─── Organization ─────────────────────────────────────────
export function organizationSchema(): JsonLd {
  return ld("Organization", {
    "@id": `${SITE.domain}/#organization`,
    name: SITE.name,
    alternateName: SITE.nameHebrew,
    url: SITE.domain,
    logo: `${SITE.domain}/favicon.svg`,
    description: SITE.description,
    foundingDate: SITE.founded,
    sameAs: Object.values(SITE.social).filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "customer service",
      availableLanguage: ["Hebrew", "English"],
    },
  });
}

// ─── LocalBusiness / ExerciseGym ──────────────────────────
export function localBusinessSchema(): JsonLd {
  return ld("ExerciseGym", {
    "@id": `${SITE.domain}/#business`,
    name: `${SITE.name} — ${SITE.tagline}`,
    alternateName: SITE.nameHebrew,
    url: SITE.domain,
    logo: `${SITE.domain}/favicon.svg`,
    description: SITE.description,
    image: `${SITE.domain}${SITE.ogImage}`,
    priceRange: SITE.priceRange,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    openingHoursSpecification: SITE.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: Object.values(SITE.social).filter(Boolean),
    areaServed: {
      "@type": "Country",
      name: "Israel",
    },
    hasOfferCatalog: {
      "@id": `${SITE.domain}/#offers`,
    },
  });
}

// ─── OfferCatalog (services) ──────────────────────────────
export function offerCatalogSchema(): JsonLd {
  return ld("OfferCatalog", {
    "@id": `${SITE.domain}/#offers`,
    name: "שירותי פילאטיס אונליין",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "שיעורי פילאטיס מוקלטים",
          description: "מאות שיעורים מוקלטים בכל רמה — 15, 30, 45 דקות. עם גרפיקת פטולוגיה אנטומית.",
          provider: { "@id": `${SITE.domain}/#organization` },
          areaServed: { "@type": "Country", name: "Israel" },
          audience: {
            "@type": "PeopleAudience",
            audienceType: "מבוגרים עם כאבים או מגבלות תנועה",
          },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "שיעורי פילאטיס חיים בקבוצה",
          description: "שיעורים חיים בקבוצות קטנות עד 12 משתתפים, עם תיקון בזמן אמת.",
          provider: { "@id": `${SITE.domain}/#organization` },
          areaServed: { "@type": "Country", name: "Israel" },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "שיעור פילאטיס פרטי אונליין",
          description: "שיעור אחד על אחד עם התאמה מלאה לגוף, לכאבים ולמטרות האישיות.",
          provider: { "@id": `${SITE.domain}/#organization` },
          areaServed: { "@type": "Country", name: "Israel" },
        },
      },
    ],
  });
}

// ─── Course ───────────────────────────────────────────────
export function courseSchema(): JsonLd {
  return ld("Course", {
    "@id": `${SITE.domain}/#course`,
    name: "קורס פילאטיס שיקומי אונליין",
    description:
      "קורס פילאטיס מקיף באנגלית/עברית עם התמחות בפתולוגיות, כאבי גב, דיסק, כתף קפואה ושיקום אחרי ניתוח.",
    provider: { "@id": `${SITE.domain}/#organization` },
    inLanguage: "he",
    educationalLevel: "מתחילים עד מתקדמים",
    teaches: [
      "פילאטיס קלאסי",
      "פילאטיס שיקומי",
      "הבנת אנטומיה בתנועה",
      "תרגילים לכאבי גב",
      "תרגילים לדיסק",
      "תרגילים לכתף קפואה",
    ],
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT15M",
        inLanguage: "he",
      },
      {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT30M",
        inLanguage: "he",
      },
      {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT45M",
        inLanguage: "he",
      },
      {
        "@type": "CourseInstance",
        courseMode: ["online", "synchronous"],
        courseWorkload: "PT60M",
        inLanguage: "he",
      },
    ],
  });
}

// ─── FAQPage ──────────────────────────────────────────────
export interface FAQItem {
  question: string;
  answer: string;
}

export function faqPageSchema(items: FAQItem[]): JsonLd {
  return ld("FAQPage", {
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  });
}

// ─── HowTo ────────────────────────────────────────────────
export interface HowToStep {
  name: string;
  text: string;
  position: number;
}

export function howToSchema(name: string, description: string, steps: HowToStep[]): JsonLd {
  return ld("HowTo", {
    name,
    description,
    inLanguage: "he",
    step: steps.map((s) => ({
      "@type": "HowToStep",
      position: s.position,
      name: s.name,
      text: s.text,
    })),
  });
}

// ─── AggregateRating / Reviews ────────────────────────────
export interface ReviewData {
  author: string;
  text: string;
  rating?: number;
  date?: string;
}

export function aggregateRatingSchema(
  ratingValue: number,
  reviewCount: number,
  reviews: ReviewData[]
): JsonLd {
  return ld("Product", {
    "@id": `${SITE.domain}/#service`,
    name: `${SITE.name} — שירותי פילאטיס אונליין`,
    description: SITE.description,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(ratingValue),
      bestRating: "5",
      worstRating: "1",
      reviewCount: String(reviewCount),
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewBody: r.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating ?? 5),
        bestRating: "5",
      },
      datePublished: r.date ?? new Date().toISOString().split("T")[0],
    })),
  });
}

// ─── BreadcrumbList ───────────────────────────────────────
export interface Crumb {
  name: string;
  url: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): JsonLd {
  return ld("BreadcrumbList", {
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  });
}

// ─── VideoObject ──────────────────────────────────────────
export interface VideoData {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}

export function videoSchema(v: VideoData): JsonLd {
  return ld("VideoObject", {
    name: v.name,
    description: v.description,
    thumbnailUrl: v.thumbnailUrl,
    uploadDate: v.uploadDate,
    duration: v.duration,
    contentUrl: v.contentUrl,
    embedUrl: v.embedUrl,
    inLanguage: "he",
    publisher: { "@id": `${SITE.domain}/#organization` },
  });
}

// ─── Event (live class) ───────────────────────────────────
export interface LiveClassEvent {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  url?: string;
  image?: string;
  performer?: string;
  maximumAttendeeCapacity?: number;
}

export function eventSchema(e: LiveClassEvent): JsonLd {
  return ld("Event", {
    name: e.name,
    description: e.description,
    startDate: e.startDate,
    endDate: e.endDate,
    url: e.url,
    image: e.image,
    eventMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "VirtualLocation",
      url: e.url ?? SITE.domain,
    },
    performer: e.performer ? { "@type": "Person", name: e.performer } : undefined,
    maximumAttendeeCapacity: e.maximumAttendeeCapacity,
    inLanguage: "he",
    organizer: { "@id": `${SITE.domain}/#organization` },
    offers: {
      "@type": "Offer",
      url: e.url ?? `${SITE.domain}/u/calendar`,
      price: "0",
      priceCurrency: "ILS",
      availability: "https://schema.org/InStock",
      validFrom: e.startDate,
    },
  });
}

// ─── MedicalWebPage ───────────────────────────────────────
export function medicalWebPageSchema(
  title: string,
  description: string,
  url: string,
  lastReviewed?: string
): JsonLd {
  return ld("MedicalWebPage", {
    "@id": `${url}#webpage`,
    name: title,
    description,
    url,
    inLanguage: SITE.locale,
    lastReviewed: lastReviewed ?? new Date().toISOString().split("T")[0],
    reviewedBy: {
      "@type": "Person",
      name: "מדריכת פילאטיס מוסמכת",
      description: "מדריכת פילאטיס עם הסמכה מבית מרתה פילאטיס והתמחות בפתולוגיות ושיקום.",
    },
    about: {
      "@type": "MedicalCondition",
      name: "כאבי גב כרוניים, מגבלות תנועה, שיקום אורתופדי",
      description: "פילאטיס שיקומי כטיפול תומך בכאבי גב, דיסק, כתף קפואה ומגבלות תנועה נוספות.",
    },
    isPartOf: { "@id": `${SITE.domain}/#website` },
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE.domain}${SITE.ogImage}` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".hero h1", ".lead", "#content"],
    },
  });
}

// ─── Person (instructor) ──────────────────────────────────
export function personSchema(
  name: string,
  description: string,
  jobTitle: string,
  alumniOf?: string
): JsonLd {
  return ld("Person", {
    name,
    description,
    jobTitle,
    alumniOf: alumniOf ? { "@type": "Organization", name: alumniOf } : undefined,
    worksFor: { "@id": `${SITE.domain}/#organization` },
    knowsAbout: [
      "פילאטיס קלאסי",
      "פילאטיס שיקומי",
      "פתולוגיות של מערכת תנועה",
      "אנטומיה פונקציונלית",
      "שיקום אורתופדי",
    ],
  });
}

// ─── Merge multiple schemas into a single graph ───────────
export function schemaGraph(...schemas: JsonLd[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": schemas.map((s) => {
      // strip duplicate @context from each child
      const { "@context": _, ...rest } = s;
      return rest;
    }),
  };
}

// ─── Render helper ────────────────────────────────────────
export function renderJsonLd(data: JsonLd): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
