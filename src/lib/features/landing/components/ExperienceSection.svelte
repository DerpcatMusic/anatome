<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section class="content-section" aria-label="מה תקבלי">
  <div class="section-header section-header--center">
    <h2>{t.landing.preview.headline()}</h2>
  </div>

  <div class="experience-frame">
    <div class="experience-placeholder">
      <div class="experience-label">
        <strong>{t.landing.preview.videoPlaceholderTitle()}</strong>
        <span>{t.landing.preview.videoPlaceholderSubtitle()}</span>
      </div>
    </div>
    <div class="experience-caption">
      {t.landing.preview.caption()}
    </div>
  </div>

  <div class="offerings-grid">
    <article class="offering">
      <span class="offering-icon offering-icon--macro" aria-hidden="true"></span>
      <h3>{t.landing.pillars.macroTitle()}</h3>
      <p class="offering-lead">{t.landing.pillars.macroLead()}</p>
      <p class="offering-body">{t.landing.pillars.macroBody()}</p>
    </article>
    <article class="offering">
      <span class="offering-icon offering-icon--micro" aria-hidden="true"></span>
      <h3>{t.landing.pillars.microTitle()}</h3>
      <p class="offering-lead">{t.landing.pillars.microLead()}</p>
      <p class="offering-body">{t.landing.pillars.microBody()}</p>
    </article>
    <article class="offering">
      <span class="offering-icon offering-icon--live" aria-hidden="true"></span>
      <h3>{t.landing.pillars.liveTitle()}</h3>
      <p class="offering-lead">{t.landing.pillars.liveLead()}</p>
      <p class="offering-body">{t.landing.pillars.liveBody()}</p>
    </article>
  </div>
</section>
