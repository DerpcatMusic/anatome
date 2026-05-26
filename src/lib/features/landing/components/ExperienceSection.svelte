<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";
  import { LANDING_IMAGES } from "$lib/features/landing/images";
  import PillarIcon from "./icons/PillarIcon.svelte";

  const { t } = useI18n();

  const sessions = $derived([
    {
      title: t.landing.preview.feature1Title(),
      desc: t.landing.preview.feature1Desc(),
      image: LANDING_IMAGES.sessions.anatomy,
      alt: t.landing.images.sessionAnatomyAlt(),
    },
    {
      title: t.landing.preview.feature2Title(),
      desc: t.landing.preview.feature2Desc(),
      image: LANDING_IMAGES.sessions.adaptive,
      alt: t.landing.images.sessionAdaptiveAlt(),
    },
    {
      title: t.landing.preview.feature3Title(),
      desc: t.landing.preview.feature3Desc(),
      image: LANDING_IMAGES.sessions.pace,
      alt: t.landing.images.sessionPaceAlt(),
    },
  ]);
</script>

<section id="experience" class="l-panel l-section section--experience" aria-label="מה מחכה בפנים">
  <div class="l-shell">
    <header class="pillars-intro l-in">
      <p class="l-eyebrow">{t.landing.pillars.tag()}</p>
      <h2 class="section-title section-title--center">{t.landing.pillars.headline()}</h2>
    </header>

    <p class="l-eyebrow l-in">{t.landing.preview.tag()}</p>
    <h3 class="experience-preview-title l-in">{t.landing.preview.headline()}</h3>
    <p class="section-lead l-in">{t.landing.preview.lead()}</p>

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

    <div class="sessions-scroll l-in l-in--1" aria-label={t.landing.preview.headline()}>
      <div class="sessions-scroll__track">
        {#each sessions as session (session.title)}
          <article class="session-card">
            <div class="session-card__visual">
              <img
                class="session-card__img"
                src={session.image.src}
                alt={session.alt}
                width={session.image.width}
                height={session.image.height}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="session-card__copy">
              <h3>{session.title}</h3>
              <p>{session.desc}</p>
            </div>
          </article>
        {/each}
      </div>
    </div>

    <div class="pillars bento">
      <article class="pillar pillar--macro l-in l-in--1">
        <span class="pillar__icon-wrap" aria-hidden="true">
          <PillarIcon variant="macro" />
        </span>
        <h4>{t.landing.pillars.macroTitle()}</h4>
        <p class="pillar__lead">{t.landing.pillars.macroLead()}</p>
        <p class="pillar__body">{t.landing.pillars.macroBody()}</p>
      </article>

      <article class="pillar pillar--micro pillar--split l-in l-in--2">
        <div class="pillar__content">
          <span class="pillar__icon-wrap" aria-hidden="true">
            <PillarIcon variant="micro" />
          </span>
          <h4>{t.landing.pillars.microTitle()}</h4>
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
          <h4>{t.landing.pillars.liveTitle()}</h4>
          <p class="pillar__lead">{t.landing.pillars.liveLead()}</p>
          <p class="pillar__body">{t.landing.pillars.liveBody()}</p>
        </div>
      </article>
    </div>
  </div>
</section>
