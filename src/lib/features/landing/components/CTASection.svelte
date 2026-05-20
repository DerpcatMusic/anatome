<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import { useI18n } from "$lib/i18n/runes";

  interface Props {
    openAuthOverlay: () => void;
  }

  let { openAuthOverlay }: Props = $props();

  const { t } = useI18n();
</script>

<section class="content-section section--final-cta" aria-label="התחילי עכשיו">
  <div class="final-cta-inner">
    <h2>{t.landing.cta.headlineLine1()}<br />{t.landing.cta.headlineLine2()}</h2>
    <p>{t.landing.cta.subheadline()}</p>
    <Button tone="ink" onclick={openAuthOverlay}>
      {t.landing.cta.button()}
    </Button>
    <p class="final-cta-note">{t.landing.cta.note()}</p>
  </div>
</section>
