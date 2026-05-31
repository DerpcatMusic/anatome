<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveSession } from "$lib/features/live/live-session.svelte";
  import type { LiveSidebarTab } from "$lib/features/live/live-session-ui.svelte";
  import RoomChatContent from "./RoomChatContent.svelte";
  import ParticipantSidebarList from "./ParticipantSidebarList.svelte";
  import RoomInfoContent from "./RoomInfoContent.svelte";

  let {
    session,
    participantCount = 0,
  }: {
    session: LiveSession;
    participantCount?: number;
  } = $props();

  const { t } = useI18n();

  function buildTabs(
    chatTitle: string,
    participantsTitle: string,
    sidebarInfo: string,
  ): { value: LiveSidebarTab; icon: string; label: string }[] {
    return [
      { value: "chat", icon: "chat", label: chatTitle },
      { value: "participants", icon: "groups", label: participantsTitle },
      { value: "info", icon: "info", label: sidebarInfo },
    ];
  }

  const tabs = $derived(buildTabs(
    t.live.room.chatTitle(),
    t.live.room.participantsTitle(),
    t.live.room.sidebarInfo(),
  ));

  const activeTab = $derived(session.sidebarTab);
  const activeLabel = $derived(tabs.find((tab) => tab.value === activeTab)?.label ?? "");

  function closePanel() {
    session.setSidebarTab(null);
  }

  const makeToggleHandler = (value: LiveSidebarTab) => () => session.toggleSidebarTab(value);

  function handleSendChat() {
    void session.sendChatMessage();
  }
</script>

<div class="lr-mobile-dock" class:lr-mobile-dock--open={activeTab !== null}>
  {#if activeTab !== null}
    <section class="lr-mobile-dock__panel" aria-label={activeLabel}>
      <header class="lr-mobile-dock__panel-head">
        <h2 class="lr-mobile-dock__panel-title">{activeLabel}</h2>
        <button
          type="button"
          class="lr-mobile-dock__close"
          aria-label="סגירת לוח"
          onclick={closePanel}
        >
          <span class="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
      </header>

      <div class="lr-mobile-dock__panel-body">
        {#if activeTab === "chat"}
          <RoomChatContent
            messages={session.chatMessages}
            bind:draft={session.chatDraft}
            onSend={handleSendChat}
          />
        {:else if activeTab === "participants"}
          <ParticipantSidebarList
            liveClassId={session.getClassId()}
            showClassRoster={session.isInstructorRoom}
            hostUserId={session.classHostUserId}
            broadcastHostUserId={session.joinAccess?.broadcastStartedByUserId ?? null}
          />
        {:else}
          <RoomInfoContent {session} {participantCount} active={true} />
        {/if}
      </div>
    </section>
  {/if}

  <nav class="lr-mobile-dock__tabs" aria-label={t.live.room.sidebarTitle()}>
    {#each tabs as tab (tab.value)}
      <button
        type="button"
        class="lr-mobile-dock__tab"
        class:lr-mobile-dock__tab--active={activeTab === tab.value}
        aria-pressed={activeTab === tab.value}
        onclick={makeToggleHandler(tab.value)}
      >
        <span class="material-symbols-rounded lr-mobile-dock__tab-icon" aria-hidden="true"
          >{tab.icon}</span
        >
        <span class="lr-mobile-dock__tab-label">{tab.label}</span>
        {#if tab.value === "chat" && session.unreadChatCount > 0 && activeTab !== "chat"}
          <span class="lr-mobile-dock__badge" aria-label={t.live.room.newMessages()}>
            {session.unreadChatCount}
          </span>
        {/if}
      </button>
    {/each}
  </nav>
</div>
