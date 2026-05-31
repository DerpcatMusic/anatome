<script lang="ts">
  import { page } from "$app/state";
  import { SITE } from "$lib/seo/config";
  import type { JsonLd } from "$lib/seo/schema";

  function buildAllLd(
    breadcrumbs: { name: string; url: string }[] | undefined,
    jsonLd: JsonLd | JsonLd[] | undefined,
  ): JsonLd[] {
    const out: JsonLd[] = [];
    if (breadcrumbs) {
      out.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: c.url,
        })),
      });
    }
    if (jsonLd) {
      out.push(...(Array.isArray(jsonLd) ? jsonLd : [jsonLd]));
    }
    return out;
  }

  interface Props {
    title: string;
    description?: string;
    keywords?: string;
    ogType?: "website" | "article" | "video.movie" | "profile";
    ogImage?: string;
    canonical?: string;
    noindex?: boolean;
    nofollow?: boolean;
    robotsMaxSnippet?: number;
    robotsMaxImagePreview?: "none" | "standard" | "large";
    jsonLd?: JsonLd | JsonLd[];
    breadcrumbs?: { name: string; url: string }[];
    alternateLanguages?: { lang: string; url: string }[];
    /** LCP image — e.g. hero poster (Astro-style early hint) */
    preloadImage?: string;
    article?: {
      publishedTime?: string;
      modifiedTime?: string;
      author?: string;
      section?: string;
      tags?: string[];
    };
    video?: {
      duration?: string;
      releaseDate?: string;
    };
  }

  let {
    title,
    description = SITE.description,
    keywords = SITE.keywords,
    ogType = "website",
    ogImage = SITE.ogImage,
    canonical,
    noindex = false,
    nofollow = false,
    robotsMaxSnippet,
    robotsMaxImagePreview,
    jsonLd,
    breadcrumbs,
    alternateLanguages,
    preloadImage,
    article,
    video,
  }: Props = $props();

  const fullTitle = $derived(title.includes(SITE.name) ? title : `${title} | ${SITE.name}`);
  const canonicalUrl = $derived(canonical ?? `${SITE.domain}${page.url.pathname}`);
  const ogImageUrl = $derived(ogImage.startsWith("http") ? ogImage : `${SITE.domain}${ogImage}`);
  const ogImageType = $derived(
    ogImage.endsWith(".webp")
      ? "image/webp"
      : ogImage.endsWith(".png")
        ? "image/png"
        : "image/jpeg"
  );

  const preloadImageUrl = $derived(
    preloadImage
      ? preloadImage.startsWith("http")
        ? preloadImage
        : `${SITE.domain}${preloadImage}`
      : null
  );

  const robotsDirectives = $derived.by(() => {
    let result = "";
    if (noindex) result = "noindex";
    if (nofollow) result = result ? `${result}, nofollow` : "nofollow";
    if (!noindex && !nofollow) result = result ? `${result}, index, follow` : "index, follow";
    if (robotsMaxSnippet !== undefined) result = result ? `${result}, max-snippet:${robotsMaxSnippet}` : `max-snippet:${robotsMaxSnippet}`;
    if (robotsMaxImagePreview) result = result ? `${result}, max-image-preview:${robotsMaxImagePreview}` : `max-image-preview:${robotsMaxImagePreview}`;
    return result;
  });

  const allLd = $derived(buildAllLd(breadcrumbs, jsonLd));

  $effect(() => {
    const scripts: HTMLScriptElement[] = [];
    for (const item of allLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
      scripts.push(script);
    }
    return () => {
      scripts.forEach((s) => s.remove());
    };
  });
</script>

<svelte:head>
  <!-- Base -->
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <link rel="canonical" href={canonicalUrl} />
  {#if preloadImageUrl}
    <link rel="preload" as="image" href={preloadImageUrl} fetchpriority="high" />
  {/if}

  <!-- Robots -->
  <meta name="robots" content={robotsDirectives} />
  <meta name="googlebot" content={robotsDirectives} />

  <!-- Language / Region -->
  <meta name="language" content={SITE.lang} />

  <!-- Author / Publisher -->
  <meta name="author" content={SITE.name} />
  <meta name="publisher" content={SITE.name} />
  <meta name="copyright" content={`© ${new Date().getFullYear()} ${SITE.name}`} />

  <!-- Open Graph -->
  <meta property="og:site_name" content={SITE.name} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content={ogType} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:locale" content={SITE.locale} />
  <meta property="og:image" content={ogImageUrl} />
  <meta property="og:image:type" content={ogImageType} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={fullTitle} />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={SITE.twitterHandle} />
  <meta name="twitter:creator" content={SITE.twitterHandle} />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImageUrl} />
  <meta name="twitter:image:alt" content={fullTitle} />

  <!-- Article OG (if applicable) -->
  {#if article}
    {#if article.publishedTime}<meta property="article:published_time" content={article.publishedTime} />{/if}
    {#if article.modifiedTime}<meta property="article:modified_time" content={article.modifiedTime} />{/if}
    {#if article.author}<meta property="article:author" content={article.author} />{/if}
    {#if article.section}<meta property="article:section" content={article.section} />{/if}
    {#if article.tags}{#each article.tags as tag (tag)}<meta property="article:tag" content={tag} />{/each}{/if}
  {/if}

  <!-- Video OG (if applicable) -->
  {#if video}
    {#if video.duration}<meta property="video:duration" content={video.duration} />{/if}
    {#if video.releaseDate}<meta property="video:release_date" content={video.releaseDate} />{/if}
  {/if}

  <!-- Alternate languages -->
  {#if alternateLanguages}
    {#each alternateLanguages as alt (alt.lang)}
      <link rel="alternate" hreflang={alt.lang} href={alt.url} />
    {/each}
  {/if}
  <link rel="alternate" hreflang="x-default" href={SITE.domain} />
</svelte:head>


