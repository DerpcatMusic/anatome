<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";
  import { LANDING_IMAGES } from "$lib/features/landing/images";
  import PillarIcon from "./icons/PillarIcon.svelte";

  const { t } = useI18n();

  const cells = $derived([
    {
      id: "preview",
      index: 0,
      variant: "preview" as const,
      orient: "landscape" as const,
      title: t.landing.preview.videoPlaceholderTitle(),
      lead: t.landing.preview.videoPlaceholderSubtitle(),
      body: "",
    },
    {
      id: "macro",
      index: 1,
      variant: "macro" as const,
      orient: "portrait" as const,
      title: t.landing.pillars.macroTitle(),
      lead: t.landing.pillars.macroLead(),
      body: t.landing.pillars.macroBody(),
    },
    {
      id: "micro",
      index: 2,
      variant: "micro" as const,
      orient: "portrait" as const,
      title: t.landing.pillars.microTitle(),
      lead: t.landing.pillars.microLead(),
      body: t.landing.pillars.microBody(),
    },
    {
      id: "live",
      index: 3,
      variant: "live" as const,
      orient: "landscape" as const,
      title: t.landing.pillars.liveTitle(),
      lead: t.landing.pillars.liveLead(),
      body: t.landing.pillars.liveBody(),
    },
  ]);

  const openLibraryLabel = $derived(
    `${t.landing.preview.videoPlaceholderTitle()} — ${t.landing.preview.videoPlaceholderSubtitle()}`,
  );

  function setActiveCell(index: number, root: HTMLElement) {
    root.querySelectorAll<HTMLElement>("[data-experience-bento-cell]").forEach((el, i) => {
      const active = i === index;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-selected", active ? "true" : "false");
      el.tabIndex = active ? 0 : -1;
    });
  }
</script>

<section
  id="experience"
  class="l-panel l-section section--experience experience-bento-section"
  data-landing-experience
  aria-label="איך מתרגלים"
>
  <div class="experience-bento__track">
    <div class="experience-bento__pin">
      <header class="experience-intro l-in">
        <h2 class="section-title section-title--center">{t.landing.pillars.headline()}</h2>
        <p class="section-lead section-lead--center">{t.landing.pillars.lead()}</p>
      </header>

      <div
        class="experience-bento"
        role="tablist"
        aria-label="סוגי תרגול"
      >
        {#each cells as cell (cell.id)}
          <article
            class="experience-bento__cell experience-bento__cell--{cell.id}"
            class:experience-bento__cell--portrait={cell.orient === "portrait"}
            class:experience-bento__cell--landscape={cell.orient === "landscape"}
            class:is-active={cell.index === 0}
            data-experience-cell={cell.index}
            data-experience-bento-cell
            role="tab"
            tabindex={cell.index === 0 ? 0 : -1}
            aria-selected={cell.index === 0}
            onclick={(e) => {
              const root = (e.currentTarget as HTMLElement).closest("[data-landing-experience]");
              if (root instanceof HTMLElement) setActiveCell(cell.index, root);
            }}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const root = (e.currentTarget as HTMLElement).closest("[data-landing-experience]");
                if (root instanceof HTMLElement) setActiveCell(cell.index, root);
              }
            }}
          >
            <div class="experience-bento__frame" data-experience-bento-frame>
              <span class="experience-bento__index" aria-hidden="true">{cell.index + 1}</span>

              {#if cell.variant === "preview"}
                <a
                  href="/library"
                  class="experience-bento__preview video-card"
                  aria-label={openLibraryLabel}
                  onclick={(e) => e.stopPropagation()}
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
                  <p class="pillar__body">{cell.body}</p>
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
                    <p class="pillar__body">{cell.body}</p>
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
