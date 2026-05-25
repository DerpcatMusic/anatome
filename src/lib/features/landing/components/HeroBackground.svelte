<script lang="ts">
  import { browser } from "$app/environment";
  import { SITE } from "$lib/seo/config";

  const hasVideo = Boolean(SITE.heroVideo);

  let videoEl = $state<HTMLVideoElement | undefined>();

  $effect(() => {
    if (!browser || !videoEl) return;

    const el = videoEl;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
      return;
    }

    const play = () => {
      el.muted = true;
      void el.play().catch(() => {
        /* autoplay policy — poster stays visible */
      });
    };

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      play();
      return;
    }

    el.addEventListener("canplay", play, { once: true });
    return () => el.removeEventListener("canplay", play);
  });
</script>

<!-- Decorative background only — autoplay like a GIF; no controls, not interactive -->
<div class="hero-bg" aria-hidden="true">
  {#if hasVideo}
    <video
      bind:this={videoEl}
      class="hero-bg__media"
      src={SITE.heroVideo}
      poster={SITE.heroPoster}
      autoplay
      muted
      loop
      playsinline
      disablepictureinpicture
      disableremoteplayback
      preload="metadata"
    ></video>
  {:else}
    <img
      class="hero-bg__media"
      src={SITE.heroPoster}
      alt=""
      width="1200"
      height="630"
      fetchpriority="high"
      decoding="async"
    />
  {/if}
  <div class="hero-bg__scrim"></div>
</div>
