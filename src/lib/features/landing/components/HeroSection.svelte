<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes";

  interface Props {
    openAuthOverlay: () => void;
  }

  let { openAuthOverlay }: Props = $props();

  const { t } = useI18n();
</script>

<section class="hero" aria-label="ראשי">
  <div class="l-shell hero__inner">
    <h1 class="hero__title l-in">
      {t.landing.hero.headlineBefore()}<span class="hero__accent">{t.landing.hero.headlineAccent()}</span>{t.landing.hero.headlineAfter()}
    </h1>
    <p class="hero__lead l-in l-in--1">{t.landing.hero.lead()}</p>
    <p class="hero__equipment l-in l-in--1">{t.landing.hero.equipment()}</p>

    <div class="l-actions l-in l-in--2">
      <Button.Root
        class="hb-button hb-button--brand"
        type="button"
        onclick={openAuthOverlay}
      >
        {t.landing.hero.ctaPrimary()}
      </Button.Root>
      <Button.Root
        class="hb-button hb-button--paper"
        href="#about"
      >
        {t.landing.hero.ctaSecondary()}
      </Button.Root>
    </div>

    <p class="hero__note l-in l-in--3">{t.landing.hero.note()}</p>
  </div>
</section>
