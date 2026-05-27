import type { Room, SendTextOptions, ConnectionState, TrackPublishOptions, RoomConnectOptions } from 'livekit-client';
import type {
	TrackReference,
	TrackReferenceOrPlaceholder,
	TrackReferencePlaceholder,
	WidgetState,
	PinState,
	ParticipantClickEvent,
	ChatMessage,
	ReceivedChatMessage,
	ReceivedMessage,
	ReceivedUserTranscriptionMessage,
	ReceivedAgentTranscriptionMessage,
} from '@livekit/components-core';
import { isTrackReferencePlaceholder, isTrackReference } from '@livekit/components-core';

// Re-export core types needed across the library
export type {
	TrackReference,
	TrackReferenceOrPlaceholder,
	TrackReferencePlaceholder,
	WidgetState,
	PinState,
	ParticipantClickEvent,
	ChatMessage,
	ReceivedChatMessage,
	ReceivedMessage,
	ReceivedUserTranscriptionMessage,
	ReceivedAgentTranscriptionMessage,
};

export { isTrackReferencePlaceholder, isTrackReference };

/**
 * Options for connecting a session.
 * @beta
 */
export type SessionConnectOptions = {
	/** Optional abort signal which if triggered will terminate connecting even if it isn't complete */
	signal?: AbortSignal;
	tracks?: {
		microphone?: {
			enabled?: boolean;
			publishOptions?: TrackPublishOptions;
		};
		camera?: {
			enabled?: boolean;
			publishOptions?: TrackPublishOptions;
		};
		screenShare?: {
			enabled?: boolean;
			publishOptions?: TrackPublishOptions;
		};
	};
	/** Options for Room.connect(.., .., opts) */
	roomConnectOptions?: RoomConnectOptions;
};

/**
 * Common session state properties.
 * @beta
 */
export type SessionStateCommon = {
	room: Room;
};

/**
 * Session state when connecting.
 * @beta
 */
export type SessionStateConnecting = SessionStateCommon & {
	connectionState: ConnectionState.Connecting;
	isConnected: false;
	local: {
		cameraTrack: undefined;
		microphoneTrack: undefined;
		screenShareTrack: undefined;
	};
};

/**
 * Session state when connected (or reconnecting).
 * @beta
 */
export type SessionStateConnected = SessionStateCommon & {
	connectionState: ConnectionState.Connected | ConnectionState.Reconnecting | ConnectionState.SignalReconnecting;
	isConnected: true;
	local: {
		cameraTrack?: TrackReference;
		microphoneTrack?: TrackReference;
		screenShareTrack?: TrackReference;
	};
};

/**
 * Session state when disconnected.
 * @beta
 */
export type SessionStateDisconnected = SessionStateCommon & {
	connectionState: ConnectionState.Disconnected;
	isConnected: false;
	local: {
		cameraTrack: undefined;
		microphoneTrack: undefined;
		screenShareTrack: undefined;
	};
};

/**
 * Discriminated union of all session states.
 * @beta
 */
export type SessionState = SessionStateConnecting | SessionStateConnected | SessionStateDisconnected;

/**
 * Actions available on a session.
 * @beta
 */
export type SessionActions = {
	/** Returns a promise that resolves once the room connects. */
	waitUntilConnected: (signal?: AbortSignal) => Promise<void>;
	/** Returns a promise that resolves once the room disconnects */
	waitUntilDisconnected: (signal?: AbortSignal) => Promise<void>;
	prepareConnection: () => Promise<void>;
	/** Connect to the underlying room and dispatch any agents */
	start: (options?: SessionConnectOptions) => Promise<void>;
	/** Disconnect from the underlying room */
	end: () => Promise<void>;
	/** Enable or disable E2EE. */
	setEncryptionEnabled: (enabled: boolean) => Promise<void>;
};

/**
 * The full return type of a session, combining state and actions.
 * @beta
 */
export type UseSessionReturn = SessionState & SessionActions;

/**
 * The full return type of session messages.
 * @beta
 */
export type UseSessionMessagesReturn = {
	messages: Array<ReceivedMessage>;
	/** Is a send operation currently in progress? */
	isSending: boolean;
	send: (message: string, options?: SendTextOptions) => Promise<ReceivedChatMessage>;
};
