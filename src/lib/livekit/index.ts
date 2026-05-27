/**
 * App-facing LiveKit Svelte API. Import prefabs/hooks from here; use `$lib/livekit/contexts`
 * or `$lib/livekit/hooks` for deeper integration.
 *
 * Styles load with `LiveKitRoom` (`livekit-components.css`).
 */

export type {
	TrackReferenceOrPlaceholder,
	TrackReference,
	ParticipantClickEvent,
	LocalUserChoices,
} from '@livekit/components-core';
export { isTrackReference } from '@livekit/components-core';

export { default as LiveKitRoom } from './components/LiveKitRoom.svelte';

export { VideoConference, ControlBar, PreJoin } from './prefabs/index.js';

export { useParticipants } from './hooks/useParticipants.svelte';
export type { UseParticipantsOptions } from './hooks/useParticipants.svelte';
export { useIsSpeaking } from './hooks/useIsSpeaking.svelte';
export { useParticipantMedia } from './hooks/useParticipantMedia.svelte';
