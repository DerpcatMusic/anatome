<script lang="ts">
  import { Tabs } from "bits-ui";
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

  function onTabChange(value: string) {
    session.setSidebarTab(value as LiveSidebarTab);
  }
</script>

<aside class="lr-dock-sidebar" aria-label={t.live.room.sidebarTitle()}>
  <Tabs.Root
    class="lr-dock-sidebar__tabs"
    orientation="vertical"
    value={session.sidebarTab}
    onValueChange={onTabChange}
  >
    <Tabs.List class="lr-dock-sidebar__nav" aria-label={t.live.room.sidebarTitle()}>
      {#each tabs as tab (tab.value)}
        <Tabs.Trigger class="lr-dock-sidebar__nav-btn" value={tab.value}>
          <span class="material-symbols-rounded lr-dock-sidebar__nav-icon" aria-hidden="true"
            >{tab.icon}</span
          >
          <span class="lr-dock-sidebar__nav-label">{tab.label}</span>
          {#if tab.value === "chat" && session.unreadChatCount > 0 && session.sidebarTab !== "chat"}
            <span class="lr-dock-sidebar__badge" aria-label={t.live.room.newMessages()}>
              {session.unreadChatCount}
            </span>
          {/if}
        </Tabs.Trigger>
      {/each}
    </Tabs.List>

    <div class="lr-dock-sidebar__body">
      <Tabs.Content class="lr-dock-sidebar__pane" value="chat">
        <RoomChatContent
          messages={session.chatMessages}
          bind:draft={session.chatDraft}
          onSend={() => void session.sendChatMessage()}
        />
      </Tabs.Content>

      <Tabs.Content class="lr-dock-sidebar__pane" value="participants">
        <ParticipantSidebarList />
      </Tabs.Content>

      <Tabs.Content class="lr-dock-sidebar__pane" value="info">
        <RoomInfoContent {session} {participantCount} active={session.sidebarTab === "info"} />
      </Tabs.Content>
    </div>
  </Tabs.Root>
</aside>
