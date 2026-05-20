<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section class="content-section section--philosophy" aria-label="הגישה שלנו">
  <div class="philosophy-inner">
    <span class="section-tag">{t.landing.philosophy.tag()}</span>
    <h2>{t.landing.philosophy.headline()}</h2>
    <p class="philosophy-body">{t.landing.philosophy.body()}</p>
  </div>
</section>
