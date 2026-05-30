import { useLocalParticipant } from "./useLocalParticipant";

export function useLocalParticipantPermissions() {
	const localParticipant = useLocalParticipant();
	return localParticipant?.permissions;
}
