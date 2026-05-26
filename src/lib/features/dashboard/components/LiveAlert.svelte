<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { liveRoomHref } from "$lib/i18n/context";

  let {
    liveAlert,
  }: {
    liveAlert: { liveClassId: string; title: string } | null;
  } = $props();

  const { t } = useI18n();
</script>

{#if liveAlert}
  <a class="live-alert flex items-center gap-3" href={liveRoomHref(liveAlert.liveClassId)}>
    <span class="live-alert__pulse"></span>
    <span>
      <strong>{t.dashboard.liveAlert.title()}</strong>
      <small>{liveAlert.title}</small>
    </span>
  </a>
{/if}

<style>
  .live-alert {
    border: var(--border);
    background: var(--ink);
    color: var(--on-primary);
    padding: var(--space-3) var(--space-4);
    text-decoration: none;
    width: 100%;
    max-width: 36rem;
    min-width: 0;
  }

  .live-alert strong,
  .live-alert small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .live-alert small {
    color: var(--on-primary-muted);
    margin-top: 2px;
  }

  .live-alert__pulse {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--danger);
    box-shadow: 0 0 0 0 var(--danger);
    animation: live-breathe 1.7s ease-in-out infinite;
    flex: 0 0 auto;
  }

  @keyframes live-breathe {
    0%, 100% { transform: scale(0.82); box-shadow: 0 0 0 0 var(--danger); }
    50% { transform: scale(1); box-shadow: 0 0 0 9px transparent; }
  }
</style>
