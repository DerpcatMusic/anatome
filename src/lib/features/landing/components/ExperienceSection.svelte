<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";
  import { LANDING_IMAGES } from "$lib/features/landing/images";
  import PillarIcon from "./icons/PillarIcon.svelte";

  const { t } = useI18n();
</script>

<section id="experience" class="l-panel l-section section--experience" aria-label="איך מתרגלים">
  <div class="l-shell">
    <header class="experience-intro l-in">
      <h2 class="section-title section-title--center">{t.landing.pillars.headline()}</h2>
      <p class="section-lead section-lead--center">{t.landing.pillars.lead()}</p>
    </header>

    <a
      href="/library"
      class="video-card l-in l-in--1"
      aria-label={t.landing.preview.videoPlaceholderTitle()}
    >
      <img
        class="video-card__media"
        src={LANDING_IMAGES.previewLibrary.src}
        alt=""
        width={LANDING_IMAGES.previewLibrary.width}
        height={LANDING_IMAGES.previewLibrary.height}
        loading="lazy"
        decoding="async"
      />
      <span class="video-card__scrim" aria-hidden="true"></span>
      <span class="video-card__play" aria-hidden="true"></span>
      <span class="video-card__title">{t.landing.preview.videoPlaceholderTitle()}</span>
      <span class="video-card__sub">{t.landing.preview.videoPlaceholderSubtitle()}</span>
    </a>

    <div class="pillars bento">
      <article class="pillar pillar--macro l-in l-in--1">
        <span class="pillar__icon-wrap" aria-hidden="true">
          <PillarIcon variant="macro" />
        </span>
        <h3>{t.landing.pillars.macroTitle()}</h3>
        <p class="pillar__lead">{t.landing.pillars.macroLead()}</p>
        <p class="pillar__body">{t.landing.pillars.macroBody()}</p>
      </article>

      <article class="pillar pillar--micro pillar--split l-in l-in--2">
        <div class="pillar__content">
          <span class="pillar__icon-wrap" aria-hidden="true">
            <PillarIcon variant="micro" />
          </span>
          <h3>{t.landing.pillars.microTitle()}</h3>
          <p class="pillar__lead">{t.landing.pillars.microLead()}</p>
          <p class="pillar__body">{t.landing.pillars.microBody()}</p>
        </div>
        <div class="pillar__media">
          <img
            class="pillar__media-img"
            src={LANDING_IMAGES.pillars.micro.src}
            alt={t.landing.images.pillarMicroAlt()}
            width={LANDING_IMAGES.pillars.micro.width}
            height={LANDING_IMAGES.pillars.micro.height}
            loading="lazy"
            decoding="async"
          />
        </div>
      </article>

      <article class="pillar pillar--live pillar--split pillar--split-reverse pillar--featured l-in l-in--3">
        <div class="pillar__media">
          <img
            class="pillar__media-img"
            src={LANDING_IMAGES.pillars.live.src}
            alt={t.landing.images.pillarLiveAlt()}
            width={LANDING_IMAGES.pillars.live.width}
            height={LANDING_IMAGES.pillars.live.height}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="pillar__content">
          <span class="pillar__icon-wrap pillar__icon-wrap--on-dark" aria-hidden="true">
            <PillarIcon variant="live" />
          </span>
          <h3>{t.landing.pillars.liveTitle()}</h3>
          <p class="pillar__lead">{t.landing.pillars.liveLead()}</p>
          <p class="pillar__body">{t.landing.pillars.liveBody()}</p>
        </div>
      </article>
    </div>
  </div>
</section>
