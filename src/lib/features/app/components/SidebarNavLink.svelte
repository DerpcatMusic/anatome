<script lang="ts">
  import { Tooltip } from "bits-ui";
  import { sidebar } from "$features/app/sidebar.svelte";

  export type SidebarNavTone = "dashboard" | "calendar" | "video" | "profile" | "live";

  let {
    href,
    label,
    icon,
    tone = "dashboard",
    current = false,
    live = false,
  }: {
    href: string;
    label: string;
    icon: string;
    tone?: SidebarNavTone;
    current?: boolean;
    live?: boolean;
  } = $props();
</script>

{#if sidebar.isCollapsed}
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <a
          {...props}
          {href}
          class="sidebar__link"
          class:sidebar__link--live={live}
          data-tone={tone}
          aria-current={current ? "page" : undefined}
          aria-label={label}
        >
          <span
            class="material-symbols-rounded sidebar__link-icon"
            class:icon--selected={current}
            aria-hidden="true"
          >{icon}</span>
          <span class="sidebar__link-label">{label}</span>
          {#if live}
            <span class="live-pulse" aria-hidden="true"></span>
          {/if}
        </a>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content class="hb-tooltip-content sidebar__nav-tooltip" side="left" sideOffset={8}>
        {label}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
{:else}
  <a
    {href}
    class="sidebar__link"
    class:sidebar__link--live={live}
    data-tone={tone}
    aria-current={current ? "page" : undefined}
  >
    <span
      class="material-symbols-rounded sidebar__link-icon"
      class:icon--selected={current}
      aria-hidden="true"
    >{icon}</span>
    <span class="sidebar__link-label">{label}</span>
    {#if live}
      <span class="live-pulse" aria-hidden="true"></span>
    {/if}
  </a>
{/if}
