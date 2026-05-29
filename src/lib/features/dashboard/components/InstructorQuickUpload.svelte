<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { Button } from "bits-ui";
  import { resource } from "runed";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { routePath } from "$lib/i18n/context";
  import VideoUploadForm from "$features/studio/components/VideoUploadForm.svelte";
  import "../dashboard.css";

  const auth = initAuth();
  const { t } = useI18n();

  let expanded = $state(false);

  const categoriesResource = resource(
    () => auth.isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return [];
      return await authQuery(api.video.categories.listCategories, {});
    },
    { initialValue: [] },
  );

  const categories = $derived(categoriesResource.current ?? []);

  function handleComplete() {
    expanded = false;
    window.location.assign(routePath("iVideos"));
  }
</script>

<section class="dashboard-panel instructor-upload" aria-labelledby="instructor-upload-title">
  <header class="dashboard-panel__head">
    <h3 id="instructor-upload-title" class="dashboard-panel__title">
      {t.dashboard.instructor.uploadTitle()}
    </h3>
    <div class="dashboard-panel__actions">
      <a class="dashboard-link" href={routePath("iVideos")}>{t.dashboard.instructor.manageVideos()}</a>
      <Button.Root
        class="hb-button hb-button--ink hb-button--sm"
        type="button"
        aria-expanded={expanded}
        onclick={() => {
          expanded = !expanded;
        }}
      >
        {expanded ? t.dashboard.instructor.uploadClose() : t.dashboard.instructor.uploadOpen()}
      </Button.Root>
    </div>
  </header>

  {#if expanded}
    {#if categoriesResource.error}
      <p class="instructor-upload__error">{categoriesResource.error.message}</p>
    {:else if categoriesResource.loading}
      <div class="dashboard-skeleton" aria-busy="true">
        <div class="dashboard-skeleton__bar dashboard-skeleton__bar--lg"></div>
      </div>
    {:else}
      <div class="instructor-upload__form">
        <VideoUploadForm
          {categories}
          onComplete={handleComplete}
          onCancel={() => {
            expanded = false;
          }}
        />
      </div>
    {/if}
  {/if}
</section>

<style>
  .instructor-upload {
    min-width: 0;
  }

  .instructor-upload .dashboard-panel__head {
    margin-block-end: 0;
  }

  .instructor-upload__error {
    margin: var(--space-3) 0 0;
    color: var(--danger);
  }

  .instructor-upload__form {
    min-width: 0;
    margin-block-start: var(--space-3);
    padding-block-start: var(--space-3);
    border-block-start: 1px solid color-mix(in oklch, var(--border-color) 55%, transparent);
  }

  .instructor-upload__form :global(.video-upload-form) {
    padding: 0;
    border: none;
    background: transparent;
  }
</style>
