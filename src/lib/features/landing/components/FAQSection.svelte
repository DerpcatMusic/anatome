<script lang="ts">
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { useI18n } from "$lib/i18n/runes";

  interface Props {
    items: { question: string; answer: string }[];
  }

  let { items }: Props = $props();

  const { t } = useI18n();

  let openIndex = $state<number | null>(null);

  function toggle(index: number) {
    openIndex = openIndex === index ? null : index;
  }
</script>

<section class="l-panel l-section section--faq" aria-label="שאלות נפוצות">
  <div class="l-shell">
    <h2 class="section-title l-in">{t.landing.faq.headline()}</h2>

    <div class="faq">
      {#each items as item, index (item.question)}
        <div class="faq__item l-in">
          <button
            type="button"
            class="faq__trigger"
            aria-expanded={openIndex === index}
            onclick={() => toggle(index)}
          >
            <span>{item.question}</span>
            <span class="faq__icon" class:faq__icon--open={openIndex === index} aria-hidden="true"></span>
          </button>
          {#if openIndex === index}
            <div
              class="faq__body"
              in:slide={{ duration: 280, easing: cubicOut }}
              out:slide={{ duration: 240, easing: cubicOut }}
            >
              <p>{item.answer}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
