<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  interface Props {
    items: { question: string; answer: string }[];
  }

  let { items }: Props = $props();

  const { t } = useI18n();
</script>

<section class="content-section section--faq" aria-label="שאלות נפוצות">
  <div class="section-header">
    <span class="section-tag">{t.landing.faq.tag()}</span>
    <h2>{t.landing.faq.headline()}</h2>
  </div>
  <div class="faq-list">
    {#each items as item}
      <details class="faq-item">
        <summary>{item.question}</summary>
        <div class="faq-answer">
          <p>{item.answer}</p>
        </div>
      </details>
    {/each}
  </div>
</section>
