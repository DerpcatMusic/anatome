<script lang="ts">
  import type { LiveSessionV2 } from "../session/LiveSession.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";

  const { t } = useI18n();

  let { session }: { session: LiveSessionV2 } = $props();

  const room = $derived(session.room);
  const local = $derived(room?.localParticipant);

  async function toggleCamera() {
    if (!local) return;
    const next = !local.isCameraEnabled;
    await local.setCameraEnabled(next);
    session.cameraEnabled = next;
  }

  async function toggleMic() {
    if (!local) return;
    const next = !local.isMicrophoneEnabled;
    await local.setMicrophoneEnabled(next);
    session.micEnabled = next;
  }
</script>

{#if local}
  <footer class="v2-bar">
    <button
      type="button"
      class="hb-button hb-button--secondary"
      aria-pressed={local.isMicrophoneEnabled}
      onclick={() => void toggleMic()}
    >
      {local.isMicrophoneEnabled ? t.live.room.micOn() : t.live.room.micOff()}
    </button>
    <button
      type="button"
      class="hb-button hb-button--secondary"
      aria-pressed={local.isCameraEnabled}
      onclick={() => void toggleCamera()}
    >
      {local.isCameraEnabled ? "מצלמה פעילה" : "מצלמה כבויה"}
    </button>
  </footer>
{/if}

<style>
  .v2-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-top: var(--border);
    background: var(--card);
  }
</style>
