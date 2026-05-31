<script lang="ts">
  import { Button } from "bits-ui";
  import { useConvexClient } from "convex-svelte";
  import { api } from "$convex/_generated/api";
  import { processAvatarFile } from "$lib/media/processAvatar";
  import { uploadAvatar } from "$lib/media/uploadAvatar";

  let {
    avatarUrl = null,
    displayName = "",
    onUpdated,
  }: {
    avatarUrl?: string | null;
    displayName?: string;
    onUpdated?: () => void;
  } = $props();

  const client = useConvexClient();
  let uploading = $state(false);
  let error = $state("");
  let inputEl: HTMLInputElement | null = null;

  function deriveInitials(displayName: string) {
    return displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";
  }

  const initials = $derived(deriveInitials(displayName));

  function triggerFileSelect() {
    inputEl?.click();
  }

  async function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    error = "";
    uploading = true;
    try {
      const { blob } = await processAvatarFile(file);
      const uploadUrl = await client.mutation(api.profiles.avatar.generateUploadUrl, {});
      const contentType = blob.type || "image/webp";
      const { storageId } = await uploadAvatar(uploadUrl, blob, contentType);
      await client.mutation(api.profiles.avatar.setFromStorage, {
        storageId: storageId as import("$convex/_generated/dataModel").Id<"_storage">,
      });
      onUpdated?.();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן תמונת פרופיל";
    } finally {
      uploading = false;
    }
  }

  async function removeAvatar() {
    error = "";
    uploading = true;
    try {
      await client.mutation(api.profiles.avatar.remove, {});
      onUpdated?.();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו להסיר תמונה";
    } finally {
      uploading = false;
    }
  }
</script>

<div class="avatar-upload">
  <div class="avatar-upload__preview" aria-hidden="true">
    {#if avatarUrl}
      <img class="avatar-upload__img" src={avatarUrl} alt="" width="96" height="96" />
    {:else}
      <span class="avatar-upload__initials">{initials}</span>
    {/if}
  </div>

  <div class="avatar-upload__actions">
    <input
      bind:this={inputEl}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="avatar-upload__input"
      onchange={onFileChange}
      disabled={uploading}
    />
    <Button.Root
      class="hb-button hb-button--paper hb-button--sm"
      type="button"
      disabled={uploading}
      onclick={triggerFileSelect}
    >
      {uploading ? "מעלה..." : avatarUrl ? "החלפת תמונה" : "העלאת תמונה"}
    </Button.Root>
    {#if avatarUrl}
      <Button.Root
        class="hb-button hb-button--ghost hb-button--sm"
        type="button"
        disabled={uploading}
        onclick={removeAvatar}
      >
        הסרה
      </Button.Root>
    {/if}
    <p class="avatar-upload__hint">WebP עד 256px · עד 512KB</p>
    {#if error}
      <p class="avatar-upload__error" role="alert">{error}</p>
    {/if}
  </div>
</div>

<style>
  .avatar-upload {
    display: flex;
    align-items: center;
    gap: var(--space-5);
    flex-wrap: wrap;
  }

  .avatar-upload__preview {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    border: var(--border);
    overflow: hidden;
    background: var(--accent-soft);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .avatar-upload__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-upload__initials {
    font-size: var(--step-2);
    font-weight: 800;
    color: var(--primary);
  }

  .avatar-upload__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    min-width: 0;
  }

  .avatar-upload__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .avatar-upload__hint {
    margin: 0;
    font-size: var(--step--2);
    color: var(--foreground-muted);
  }

  .avatar-upload__error {
    margin: 0;
    font-size: var(--step--1);
    color: var(--danger);
    font-weight: 700;
  }
</style>
