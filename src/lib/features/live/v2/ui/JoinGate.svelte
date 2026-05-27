<script lang="ts">
  import PreConnectState from "$features/live/components/room/PreConnectState.svelte";
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { useJoinContext } from "../join/useJoinContext.svelte";

  const { t } = useI18n();

  let {
    join,
    onEnter,
    connecting = false,
  }: {
    join: ReturnType<typeof useJoinContext>;
    onEnter: () => void | Promise<void>;
    connecting?: boolean;
  } = $props();

  const minutesUntilOpen = $derived(join.joinAccess?.minutesUntilOpen ?? null);
  const minutesUntilClose = $derived(join.joinAccess?.minutesUntilClose ?? null);
</script>

{#if join.isLoading && join.credentials === null}
  <PreConnectState loading message={t.live.preConnect.checking()} />
{:else if join.status === "locked"}
  <PreConnectState title={t.live.preConnect.lockedTitle()} message={join.error} tone="caution" />
{:else if join.status === "missing" || join.status === "invalidClass"}
  <PreConnectState title={t.live.preConnect.missingTitle()} tone="caution" />
{:else if join.status === "equipment"}
  <PreConnectState
    title={t.live.preConnect.equipmentTitle()}
    message={t.live.preConnect.equipmentBody()}
    tone="caution"
  />
{:else if join.status === "waiting"}
  <PreConnectState
    title={minutesUntilOpen !== null
      ? t.live.room.joinTooEarlyTitle()
      : t.live.room.waitingForBroadcastTitle()}
    message={minutesUntilOpen !== null
      ? t.live.room.joinOpensIn({ minutes: minutesUntilOpen })
      : t.live.room.waitingForBroadcastStart()}
    tone="neutral"
  />
{:else if join.status === "error"}
  <PreConnectState title={t.live.preConnect.errorTitle()} message={join.error} tone="danger" />
{:else if join.status === "prep" || join.status === "ready"}
  <div class="v2-join-gate">
    <p class="v2-join-gate__eyebrow">LiveKit v2 · שלב 1–2</p>
    <h2 class="v2-join-gate__title">{join.classTitle ?? t.live.preConnect.title()}</h2>
    {#if minutesUntilClose !== null}
      <p class="v2-join-gate__meta">{t.live.room.joinClosesIn({ minutes: minutesUntilClose })}</p>
    {/if}
    {#if join.credentials === null}
      <Button.Root
        class="hb-button hb-button--primary"
        disabled={!join.canEnter || join.minting}
        onclick={() => void onEnter()}
      >
        {join.minting ? t.live.preConnect.joiningHint() : t.live.preConnect.enterRoom()}
      </Button.Root>
    {:else}
      <p class="v2-join-gate__meta v2-join-gate__meta--ok">
        JWT הונפק · {join.credentials.roomName}
      </p>
    {/if}
    {#if connecting}
      <p class="v2-join-gate__meta">{t.live.room.connecting()}</p>
    {/if}
  </div>
{/if}

<style>
  .v2-join-gate {
    align-self: center;
    justify-self: center;
    width: min(100%, 620px);
    display: grid;
    gap: var(--space-4);
    padding: clamp(28px, 6vw, 72px);
    border: var(--border);
    border-radius: var(--radius-xl);
    background: var(--card);
    box-shadow: var(--shadow-md);
    text-align: center;
    direction: rtl;
  }

  .v2-join-gate__eyebrow {
    margin: 0;
    font-size: var(--step--2);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .v2-join-gate__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--step-1);
    line-height: 1.15;
  }

  .v2-join-gate__meta {
    margin: 0;
    color: var(--foreground-muted);
    font-size: var(--step--1);
    font-weight: 600;
  }

  .v2-join-gate__meta--ok {
    color: var(--success, var(--accent));
  }
</style>
