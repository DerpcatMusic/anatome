<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section id="experience" class="l-panel l-section section--experience" aria-label="מה מחכה בפנים">
  <div class="l-shell">
    <h2 class="section-title l-in">{t.landing.preview.headline()}</h2>
    <p class="section-lead l-in">{t.landing.preview.lead()}</p>

    <a
      href="/library"
      class="video-card l-in l-in--1"
      aria-label={t.landing.preview.videoPlaceholderTitle()}
    >
      <span class="video-card__play" aria-hidden="true"></span>
      <span class="video-card__title">{t.landing.preview.videoPlaceholderTitle()}</span>
      <span class="video-card__sub">{t.landing.preview.videoPlaceholderSubtitle()}</span>
    </a>

    <div class="pillars">
      <article class="pillar l-in l-in--1">
        <h4>{t.landing.pillars.macroTitle()}</h4>
        <p class="pillar__lead">{t.landing.pillars.macroLead()}</p>
        <p class="pillar__body">{t.landing.pillars.macroBody()}</p>
      </article>
      <article class="pillar l-in l-in--2">
        <h4>{t.landing.pillars.microTitle()}</h4>
        <p class="pillar__lead">{t.landing.pillars.microLead()}</p>
        <p class="pillar__body">{t.landing.pillars.microBody()}</p>
      </article>
      <article class="pillar l-in l-in--3">
        <h4>{t.landing.pillars.liveTitle()}</h4>
        <p class="pillar__lead">{t.landing.pillars.liveLead()}</p>
        <p class="pillar__body">{t.landing.pillars.liveBody()}</p>
      </article>
    </div>
  </div>
</section>
