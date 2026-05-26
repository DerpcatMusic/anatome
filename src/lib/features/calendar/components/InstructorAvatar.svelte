<script lang="ts">
  let {
    name,
    avatarUrl = null,
    size = 44,
  }: {
    name: string;
    avatarUrl?: string | null;
    size?: number;
  } = $props();

  const initial = $derived(name.trim().slice(0, 1) || "?");
</script>

<span
  class="instructor-avatar"
  style:--avatar-size="{size}px"
  aria-hidden={avatarUrl ? undefined : true}
>
  {#if avatarUrl}
    <img class="instructor-avatar__img" src={avatarUrl} alt="" width={size} height={size} />
  {:else}
    <span class="instructor-avatar__placeholder">{initial}</span>
  {/if}
</span>

<style>
  .instructor-avatar {
    --avatar-size: 44px;
    display: inline-flex;
    flex-shrink: 0;
    width: var(--avatar-size);
    height: var(--avatar-size);
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--line-light);
    background: var(--accent-soft);
  }

  .instructor-avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .instructor-avatar__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: calc(var(--avatar-size) * 0.42);
    font-weight: 800;
    color: var(--primary);
    text-transform: uppercase;
  }
</style>
