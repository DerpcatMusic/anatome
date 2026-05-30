import { Context } from "runed";

export const widgetCtx = new Context<WidgetContext>("livekit-widget");

/**
 * Manages widget UI state (chat visibility, settings visibility, unread message count).
 * @public
 */
export class WidgetContext {
	/** Whether the chat panel is visible. */
	showChat: boolean = $state(false);
	/** Whether the settings panel is visible. */
	showSettings: boolean = $state(false);
	/** Number of unread chat messages. */
	unreadMessages: number = $state(0);

	/**
	 * Toggle the chat panel visibility.
	 * Resets unread count when opening.
	 */
	toggleChat(): void {
		this.showChat = !this.showChat;
		if (this.showChat) {
			this.unreadMessages = 0;
		}
	}

	/**
	 * Show the chat panel and reset unread count.
	 */
	showChatPanel(): void {
		this.showChat = true;
		this.unreadMessages = 0;
	}

	/**
	 * Hide the chat panel.
	 */
	hideChatPanel(): void {
		this.showChat = false;
	}

	/**
	 * Toggle the settings panel visibility.
	 */
	toggleSettings(): void {
		this.showSettings = !this.showSettings;
	}

	/**
	 * Set the unread message count.
	 */
	setUnread(count: number): void {
		this.unreadMessages = count;
	}
}
