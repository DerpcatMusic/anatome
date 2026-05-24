import type { ChatMessage } from "./types";
import { LiveRoomCore } from "./live-room-core.svelte";

/** Panels, chat, modals, and session-ended UX state. */
export class LiveRoomUi extends LiveRoomCore {
  unreadChatCount = $state(0);
  showParticipants = $state(false);
  showChat = $state(false);
  showQualityPanel = $state(false);
  showJoinExpiryModal = $state(false);
  sessionEndedByHost = $state(false);
  chatMessages = $state<ChatMessage[]>([]);
  chatDraft = $state("");

  joinExpiryWarned = false;

  openChat() {
    this.showChat = true;
    this.unreadChatCount = 0;
  }

  toggleChat() {
    if (this.showChat) {
      this.showChat = false;
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
