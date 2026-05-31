<script lang="ts">
  import SEO from "$components/seo/SEO.svelte";
  import { SITE } from "$lib/seo/config";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const fm = data.frontmatter;
  const canonicalUrl = fm.canonical ?? `${SITE.domain}/${data.slug}`;

  // Build JSON-LD based on page type
  const jsonLd = $derived.by(() => {
    const base = {
      "@context": "https://schema.org",
      "@type": fm.schema === "HowTo" ? "HowTo" : "Article",
      headline: fm.title,
      description: fm.metaDescription,
      url: canonicalUrl,
      inLanguage: fm.language ?? "he",
      datePublished: fm.publishedAt,
      dateModified: fm.updatedAt ?? fm.publishedAt,
      author: {
        "@type": "Organization",
        name: SITE.name,
        url: SITE.domain,
      },
      publisher: {
        "@type": "Organization",
        name: SITE.name,
        logo: { "@type": "ImageObject", url: `${SITE.domain}/favicon.svg` },
      },
    };
    return base;
  });
</script>

<SEO
  title={fm.metaTitle}
  description={fm.metaDescription}
  canonical={canonicalUrl}
  ogType="article"
  jsonLd={jsonLd}
  article={{
    publishedTime: fm.publishedAt,
    modifiedTime: fm.updatedAt,
    author: SITE.name,
    section: fm.keywordCluster ?? "פילאטיס",
    tags: [fm.targetKeyword, fm.keywordCluster].filter((tag): tag is string => Boolean(tag)),
  }}
/>

<article class="seo-page" dir="rtl" lang="he">
  <header class="seo-page__header">
    <div class="l-shell">
      <h1 class="seo-page__title">{fm.title}</h1>
      {#if fm.targetKeyword}
        <p class="seo-page__keyword">מילת מפתח: {fm.targetKeyword}</p>
      {/if}
    </div>
  </header>

  <div class="seo-page__body l-shell">
    <div class="seo-content">
      <!-- svelte-ignore no-unsafe-html -->
      {@html data.contentHtml}
    </div>
  </div>
</article>

<style>
  .seo-page {
    padding-block: 4rem 6rem;
    background: #faf8f3;
    min-height: 100vh;
  }
  .seo-page__header {
    margin-bottom: 3rem;
  }
  .seo-page__title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
  }
  .seo-page__keyword {
    font-size: 0.875rem;
    color: #666;
  }
  .seo-page__body {
    max-width: 720px;
  }
  .seo-content :global(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #1a1a1a;
  }
  .seo-content :global(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #1a1a1a;
  }
  .seo-content :global(p) {
    font-size: 1.125rem;
    line-height: 1.7;
    color: #333;
    margin-bottom: 1rem;
  }
  .seo-content :global(ul),
  .seo-content :global(ol) {
    margin-bottom: 1rem;
    padding-right: 1.5rem;
  }
  .seo-content :global(li) {
    font-size: 1.125rem;
    line-height: 1.7;
    color: #333;
    margin-bottom: 0.5rem;
  }
  .seo-content :global(a) {
    color: #c45c26;
    text-decoration: underline;
  }
  .seo-content :global(strong) {
    font-weight: 600;
    color: #1a1a1a;
  }
  .seo-content :global(blockquote) {
    border-right: 4px solid #c45c26;
    padding-right: 1rem;
    margin: 1.5rem 0;
    color: #555;
    font-style: italic;
  }
</style>
