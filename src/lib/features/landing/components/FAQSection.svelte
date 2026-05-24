<script lang="ts">
  import { Accordion } from "bits-ui";
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
  <Accordion.Root type="single" class="faq-list">
    {#each items as item}
      <Accordion.Item value={item.question} class="faq-item">
        <Accordion.Trigger class="faq-trigger">
          {item.question}
          <span class="faq-chevron">
            <span class="material-symbols-rounded">expand_more</span>
          </span>
        </Accordion.Trigger>
        <Accordion.Content class="faq-answer">
          <p>{item.answer}</p>
        </Accordion.Content>
      </Accordion.Item>
    {/each}
  </Accordion.Root>
</section>
