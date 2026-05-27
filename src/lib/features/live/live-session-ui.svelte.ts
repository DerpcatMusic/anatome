import type { ChatMessage } from "./types";
import { LiveSessionCore } from "./live-session-core.svelte";

export type LiveSidebarTab = "chat" | "participants" | "info";

/** Panels, chat, modals, and session-ended UX state. */
export class LiveSessionUi extends LiveSessionCore {
  unreadChatCount = $state(0);
  sidebarTab = $state<LiveSidebarTab>("chat");
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

  setSidebarTab(tab: LiveSidebarTab) {
    this.sidebarTab = tab;
    this.showChat = tab === "chat";
    this.showParticipants = tab === "participants";
    this.showQualityPanel = tab === "info";
    if (tab === "chat") {
      this.unreadChatCount = 0;
    }
  }

  openChat() {
    this.setSidebarTab("chat");
  }

  toggleChat() {
    if (this.sidebarTab === "chat") {
      this.setSidebarTab("participants");
    } else {
      this.openChat();
    }
  }

  dismissJoinExpiryModal() {
    this.showJoinExpiryModal = false;
  }

  resetUiSession() {
    this.sessionEndedByHost = false;
    this.showJoinExpiryModal = false;
    this.joinExpiryWarned = false;
    this.unreadChatCount = 0;
  }
}
