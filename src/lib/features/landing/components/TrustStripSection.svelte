<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();

  const quotes = $derived([
    { quote: t.landing.trust.quote1(), name: t.landing.trust.name1() },
    { quote: t.landing.trust.quote2(), name: t.landing.trust.name2() },
    { quote: t.landing.trust.quote3(), name: t.landing.trust.name3() },
  ]);
</script>

<section class="l-panel l-section l-section--compact section--trust" aria-label="קהילה">
  <div class="l-shell">
    <p class="l-eyebrow l-in">{t.landing.trust.tag()}</p>
    <h2 class="section-title l-in">{t.landing.trust.headline()}</h2>

    <div class="trust-strip" role="list">
      {#each quotes as item, index (item.name)}
        <figure class="trust-card l-in" class:l-in--1={index === 1} class:l-in--2={index === 2} role="listitem">
          <blockquote class="trust-card__quote">
            <p>{item.quote}</p>
          </blockquote>
          <figcaption class="trust-card__name">{item.name}</figcaption>
        </figure>
      {/each}
    </div>
  </div>
</section>
