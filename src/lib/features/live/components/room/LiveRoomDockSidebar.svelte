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

  const tabs: { value: LiveSidebarTab; icon: string; label: string }[] = $derived([
    { value: "chat", icon: "chat", label: t.live.room.chatTitle() },
    { value: "participants", icon: "groups", label: t.live.room.participantsTitle() },
    { value: "info", icon: "info", label: t.live.room.sidebarInfo() },
  ]);

  const activeTab = $derived(session.sidebarTab);
  const railOnly = $derived(activeTab === null);
</script>

<aside
  class="lr-dock-sidebar"
  class:lr-dock-sidebar--rail-only={railOnly}
  aria-label={t.live.room.sidebarTitle()}
>
  <div class="lr-dock-sidebar__shell">
    <nav class="lr-dock-sidebar__nav" aria-label={t.live.room.sidebarTitle()}>
      {#each tabs as tab (tab.value)}
        <button
          type="button"
          class="lr-dock-sidebar__nav-btn"
          class:lr-dock-sidebar__nav-btn--active={activeTab === tab.value}
          aria-pressed={activeTab === tab.value}
          aria-current={activeTab === tab.value ? "true" : undefined}
          onclick={() => session.toggleSidebarTab(tab.value)}
        >
          <span class="material-symbols-rounded lr-dock-sidebar__nav-icon" aria-hidden="true"
            >{tab.icon}</span
          >
          <span class="lr-dock-sidebar__nav-label">{tab.label}</span>
          {#if tab.value === "chat" && session.unreadChatCount > 0 && activeTab !== "chat"}
            <span class="lr-dock-sidebar__badge" aria-label={t.live.room.newMessages()}>
              {session.unreadChatCount}
            </span>
          {/if}
        </button>
      {/each}
    </nav>

    {#if activeTab !== null}
      <div class="lr-dock-sidebar__body">
        {#if activeTab === "chat"}
          <div class="lr-dock-sidebar__pane">
            <RoomChatContent
              messages={session.chatMessages}
              bind:draft={session.chatDraft}
              onSend={() => void session.sendChatMessage()}
            />
          </div>
        {:else if activeTab === "participants"}
          <div class="lr-dock-sidebar__pane">
            <ParticipantSidebarList
              liveClassId={session.getClassId()}
              showClassRoster={session.isInstructorRoom}
              hostUserId={session.classHostUserId}
              broadcastHostUserId={session.joinAccess?.broadcastStartedByUserId ?? null}
            />
          </div>
        {:else}
          <div class="lr-dock-sidebar__pane">
            <RoomInfoContent {session} {participantCount} active={true} />
          </div>
        {/if}
      </div>
    {/if}
  </div>
</aside>
