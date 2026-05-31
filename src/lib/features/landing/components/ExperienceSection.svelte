<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";
  import { LANDING_IMAGES } from "$lib/features/landing/images";
  import PillarIcon from "./icons/PillarIcon.svelte";

  const { t } = useI18n();

  function buildCells(
    previewTitle: string,
    previewLead: string,
    macroTitle: string,
    macroLead: string,
    macroBody: string,
    microTitle: string,
    microLead: string,
    microBody: string,
    liveTitle: string,
    liveLead: string,
    liveBody: string,
  ) {
    return [
      {
        id: "preview" as const,
        variant: "preview" as const,
        orient: "landscape" as const,
        title: previewTitle,
        lead: previewLead,
        body: "",
      },
      {
        id: "macro" as const,
        variant: "macro" as const,
        orient: "portrait" as const,
        title: macroTitle,
        lead: macroLead,
        body: macroBody,
      },
      {
        id: "micro" as const,
        variant: "micro" as const,
        orient: "portrait" as const,
        title: microTitle,
        lead: microLead,
        body: microBody,
      },
      {
        id: "live" as const,
        variant: "live" as const,
        orient: "landscape" as const,
        title: liveTitle,
        lead: liveLead,
        body: liveBody,
      },
    ];
  }

  const cells = $derived(buildCells(
    t.landing.preview.videoPlaceholderTitle(),
    t.landing.preview.videoPlaceholderSubtitle(),
    t.landing.pillars.macroTitle(),
    t.landing.pillars.macroLead(),
    t.landing.pillars.macroBody(),
    t.landing.pillars.microTitle(),
    t.landing.pillars.microLead(),
    t.landing.pillars.microBody(),
    t.landing.pillars.liveTitle(),
    t.landing.pillars.liveLead(),
    t.landing.pillars.liveBody(),
  ));

  const openLibraryLabel = $derived(
    `${t.landing.preview.videoPlaceholderTitle()} — ${t.landing.preview.videoPlaceholderSubtitle()}`,
  );
</script>

<section
  id="experience"
  class="l-panel l-section section--experience experience-bento-section"
  data-landing-experience
  aria-label="איך מתרגלים"
>
  <div class="experience-bento__track">
    <div class="experience-bento__pin l-shell experience-bento-section__inner">
      <header class="experience-intro section-head section-head--center l-in">
        <h2 class="section-title">{t.landing.pillars.headline()}</h2>
        <p class="section-lead">{t.landing.pillars.lead()}</p>
        {#if t.landing.experience.scrollHint()}
          <p class="experience-intro__hint">{t.landing.experience.scrollHint()}</p>
        {/if}
      </header>

      <div class="experience-bento">
      {#each cells as cell (cell.id)}
        <article
          class="experience-bento__cell experience-bento__cell--{cell.id}"
          class:experience-bento__cell--portrait={cell.orient === "portrait"}
          class:experience-bento__cell--landscape={cell.orient === "landscape"}
          data-experience-bento-cell
        >
          <div class="experience-bento__frame" data-experience-bento-frame>
            {#if cell.variant === "preview"}
              <a
                href="/library"
                class="experience-bento__preview video-card"
                aria-label={openLibraryLabel}
              >
                <img
                  class="video-card__media experience-bento__media"
                  src={LANDING_IMAGES.previewLibrary.src}
                  alt=""
                  width={LANDING_IMAGES.previewLibrary.width}
                  height={LANDING_IMAGES.previewLibrary.height}
                  loading="lazy"
                  decoding="async"
                />
                <span class="video-card__scrim" aria-hidden="true"></span>
                <span class="video-card__play" aria-hidden="true"></span>
                <span class="experience-bento__copy">
                  <span class="video-card__title">{cell.title}</span>
                  <span class="video-card__sub">{cell.lead}</span>
                </span>
              </a>
            {:else if cell.variant === "macro"}
              <div class="experience-bento__content experience-bento__content--macro">
                <span class="pillar__icon-wrap" aria-hidden="true">
                  <PillarIcon variant="macro" />
                </span>
                <h3>{cell.title}</h3>
                <p class="pillar__lead">{cell.lead}</p>
                {#if cell.body}
                  <p class="pillar__body">{cell.body}</p>
                {/if}
              </div>
            {:else if cell.variant === "micro"}
              <div class="experience-bento__split">
                <div class="experience-bento__content">
                  <span class="pillar__icon-wrap" aria-hidden="true">
                    <PillarIcon variant="micro" />
                  </span>
                  <h3>{cell.title}</h3>
                  <p class="pillar__lead">{cell.lead}</p>
                </div>
                <img
                  class="experience-bento__media experience-bento__media--corner"
                  src={LANDING_IMAGES.pillars.micro.src}
                  alt={t.landing.images.pillarMicroAlt()}
                  width={LANDING_IMAGES.pillars.micro.width}
                  height={LANDING_IMAGES.pillars.micro.height}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            {:else}
              <div class="experience-bento__split experience-bento__split--live">
                <img
                  class="experience-bento__media experience-bento__media--live"
                  src={LANDING_IMAGES.pillars.live.src}
                  alt={t.landing.images.pillarLiveAlt()}
                  width={LANDING_IMAGES.pillars.live.width}
                  height={LANDING_IMAGES.pillars.live.height}
                  loading="lazy"
                  decoding="async"
                />
                <div class="experience-bento__content experience-bento__content--on-dark">
                  <span class="pillar__icon-wrap pillar__icon-wrap--on-dark" aria-hidden="true">
                    <PillarIcon variant="live" />
                  </span>
                  <h3>{cell.title}</h3>
                  <p class="pillar__lead">{cell.lead}</p>
                  {#if cell.body}
                    <p class="pillar__body">{cell.body}</p>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </article>
      {/each}
      </div>
    </div>
  </div>
</section>
