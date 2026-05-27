import type { ChatMessage } from "./types";
import { LiveSessionCore } from "./live-session-core.svelte";

export type LiveSidebarTab = "chat" | "participants" | "info";

/** Panels, chat, modals, and session-ended UX state. */
export class LiveSessionUi extends LiveSessionCore {
  unreadChatCount = $state(0);
  /** `null` = icon rail only (no expanded panel). */
  sidebarTab = $state<LiveSidebarTab | null>(null);
  /** @deprecated Use `sidebarTab === 'participants'`. */
  showParticipants = $state(false);
  /** @deprecated Use `sidebarTab === 'chat'`. */
  showChat = $state(false);
  /** @deprecated Use `sidebarTab === 'info'`. */
  showQualityPanel = $state(false);
  showJoinExpiryModal = $state(false);
  sessionEndedByHost = $state(false);
  chatMessages = $state<ChatMessage[]>([]);
  chatDraft = $state("");

  joinExpiryWarned = false;

  readonly sidebarExpanded = $derived(this.sidebarTab !== null);

  private syncLegacySidebarFlags(tab: LiveSidebarTab | null) {
    this.showChat = tab === "chat";
    this.showParticipants = tab === "participants";
    this.showQualityPanel = tab === "info";
  }

  setSidebarTab(tab: LiveSidebarTab | null) {
    this.sidebarTab = tab;
    this.syncLegacySidebarFlags(tab);
    if (tab === "chat") {
      this.unreadChatCount = 0;
    }
  }

  toggleSidebarTab(tab: LiveSidebarTab) {
    this.setSidebarTab(this.sidebarTab === tab ? null : tab);
  }

  openChat() {
    this.setSidebarTab("chat");
  }

  toggleChat() {
    this.toggleSidebarTab("chat");
  }

  dismissJoinExpiryModal() {
    this.showJoinExpiryModal = false;
  }

  resetUiSession() {
    this.sessionEndedByHost = false;
    this.showJoinExpiryModal = false;
    this.joinExpiryWarned = false;
    this.unreadChatCount = 0;
    this.setSidebarTab(null);
  }
}
