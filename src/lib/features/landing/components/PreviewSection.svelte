<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section class="content-section section--preview" aria-label="תצוגה מקדימה">
  <div class="section-header section-header--center">
    <span class="section-tag">{t.landing.preview.tag()}</span>
    <h2>{t.landing.preview.headline()}</h2>
  </div>
  <div class="preview-frame">
    <div class="preview-placeholder">
      <div class="preview-label">
        <strong>{t.landing.preview.videoPlaceholderTitle()}</strong>
        <span>{t.landing.preview.videoPlaceholderSubtitle()}</span>
      </div>
    </div>
    <div class="preview-caption">
      {t.landing.preview.caption()}
    </div>
  </div>
  <div class="preview-features">
    <div class="preview-feature">
      <span class="preview-feature-num">01</span>
      <h3>{t.landing.preview.feature1Title()}</h3>
      <p>{t.landing.preview.feature1Desc()}</p>
    </div>
    <div class="preview-feature">
      <span class="preview-feature-num">02</span>
      <h3>{t.landing.preview.feature2Title()}</h3>
      <p>{t.landing.preview.feature2Desc()}</p>
    </div>
    <div class="preview-feature">
      <span class="preview-feature-num">03</span>
      <h3>{t.landing.preview.feature3Title()}</h3>
      <p>{t.landing.preview.feature3Desc()}</p>
    </div>
  </div>
</section>
