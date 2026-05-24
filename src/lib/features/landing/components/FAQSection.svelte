<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  interface Props {
    items: { question: string; answer: string }[];
  }

  let { items }: Props = $props();

  const { t } = useI18n();
</script>

<section class="content-section" aria-label="שאלות נפוצות">
  <div class="section-header section-header--center">
    <h2>{t.landing.faq.headline()}</h2>
  </div>
  <div class="faq-list">
    {#each items as item (item.question)}
      <details class="faq-item">
        <summary class="faq-trigger">
          {item.question}
          <span class="faq-chevron" aria-hidden="true"></span>
        </summary>
        <div class="faq-answer">
          <p>{item.answer}</p>
        </div>
      </details>
    {/each}
  </div>
</section>
