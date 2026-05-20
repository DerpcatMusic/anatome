<script lang="ts">
  import { page } from "$app/state";
  import { SITE } from "$lib/seo/config";
  import type { JsonLd } from "$lib/seo/schema";

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
    article,
    video,
  }: Props = $props();

  const fullTitle = $derived(title.includes(SITE.name) ? title : `${title} | ${SITE.name}`);
  const canonicalUrl = $derived(canonical ?? `${SITE.domain}${page.url.pathname}`);
  const ogImageUrl = $derived(ogImage.startsWith("http") ? ogImage : `${SITE.domain}${ogImage}`);

  const robotsDirectives = $derived.by(() => {
    const parts: string[] = [];
    if (noindex) parts.push("noindex");
    if (nofollow) parts.push("nofollow");
    if (!noindex && !nofollow) parts.push("index, follow");
    if (robotsMaxSnippet !== undefined) parts.push(`max-snippet:${robotsMaxSnippet}`);
    if (robotsMaxImagePreview) parts.push(`max-image-preview:${robotsMaxImagePreview}`);
    return parts.join(", ");
  });

  const allLd = $derived.by(() => {
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
  });
</script>

<svelte:head>
  <!-- Base -->
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <link rel="canonical" href={canonicalUrl} />

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
    {#if article.tags}{#each article.tags as tag}<meta property="article:tag" content={tag} />{/each}{/if}
  {/if}

  <!-- Video OG (if applicable) -->
  {#if video}
    {#if video.duration}<meta property="video:duration" content={video.duration} />{/if}
    {#if video.releaseDate}<meta property="video:release_date" content={video.releaseDate} />{/if}
  {/if}

  <!-- Alternate languages -->
  {#if alternateLanguages}
    {#each alternateLanguages as alt}
      <link rel="alternate" hreflang={alt.lang} href={alt.url} />
    {/each}
  {/if}
  <link rel="alternate" hreflang="x-default" href={SITE.domain} />
</svelte:head>

<!-- JSON-LD structured data (body placement is valid per Google) -->
{#each allLd as item}
  {@const json = JSON.stringify(item)}
  <!-- eslint-disable svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${json}<\/script>`}
{/each}
