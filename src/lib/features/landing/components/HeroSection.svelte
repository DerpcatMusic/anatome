<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import { useI18n } from "$lib/i18n/runes";

  interface Props {
    openAuthOverlay: () => void;
  }

  let { openAuthOverlay }: Props = $props();

  const { t } = useI18n();
</script>

<section class="hero" aria-label="ראשי">
  <div class="hero__inner">
    <p class="eyebrow">{t.landing.hero.eyebrow()}</p>
    <h1>{t.landing.hero.headline()}</h1>
    <p class="lead">{t.landing.hero.lead()}</p>
    <div class="actions">
      <Button tone="ink" onclick={openAuthOverlay}>
        {t.landing.hero.ctaPrimary()}
      </Button>
      <Button tone="paper" href="#instructor">
        {t.landing.hero.ctaSecondary()}
      </Button>
    </div>
  </div>
</section>
