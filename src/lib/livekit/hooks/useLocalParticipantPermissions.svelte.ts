import { useLocalParticipant } from "./useLocalParticipant.svelte";

export function useLocalParticipantPermissions() {
	const localParticipant = useLocalParticipant();
	return localParticipant?.permissions;
}
