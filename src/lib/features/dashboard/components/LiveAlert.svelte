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
  <a class="live-alert" href={liveRoomHref(liveAlert.liveClassId)}>
    <span class="live-alert__pulse"></span>
    <span>
      <strong>{t.dashboard.liveAlert.title()}</strong>
      <small>{liveAlert.title}</small>
    </span>
  </a>
{/if}

<style>
  .live-alert {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border: var(--border);
    background: var(--ink);
    color: var(--white);
    padding: var(--space-4);
    text-decoration: none;
    width: fit-content;
  }

  .live-alert strong, .live-alert small { display: block; }
  .live-alert small {
    color: rgba(255, 255, 255, 0.72);
    margin-top: 2px;
  }

  .live-alert__pulse {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #d11f1f;
    box-shadow: 0 0 0 0 rgba(209, 31, 31, 0.45);
    animation: live-breathe 1.7s ease-in-out infinite;
    flex: 0 0 auto;
  }

  @keyframes live-breathe {
    0%, 100% { transform: scale(0.82); box-shadow: 0 0 0 0 rgba(209, 31, 31, 0.45); }
    50% { transform: scale(1); box-shadow: 0 0 0 9px rgba(209, 31, 31, 0); }
  }
</style>
