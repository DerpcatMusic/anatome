<script lang="ts">
  import { ScrollArea } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { useQuery } from "convex-svelte";
  import { useParticipants } from "$lib/livekit";
  import { canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { QUERY_NOW_LIVE_ROOM_MS, useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import {
    isClassHostParticipant,
    isInstructorIdentity,
    userIdFromLiveKitIdentity,
  } from "$lib/features/live/live-room-shared";
  import ParticipantSidebarItem from "./ParticipantSidebarItem.svelte";
  import ParticipantRosterRow from "./ParticipantRosterRow.svelte";
  import HostRosterRow from "./HostRosterRow.svelte";

  let {
    liveClassId = null,
    showClassRoster = false,
    hostUserId = null,
    broadcastHostUserId = null,
  }: {
    liveClassId?: Id<"liveClasses"> | null;
    showClassRoster?: boolean;
    hostUserId?: string | null;
    broadcastHostUserId?: string | null;
  } = $props();

  const queryNow = useQueryNowMs(QUERY_NOW_LIVE_ROOM_MS);

  const participants = useParticipants();

  const instructorPanelQuery = useQuery(api.live.roster.getInstructorPanel, () =>
    showClassRoster && liveClassId !== null && canRunAuthenticatedQuery()
      ? { liveClassId, now: queryNow.nowMs }
      : "skip",
  );

  const memberPanelQuery = useQuery(api.live.roster.getMemberPanel, () =>
    !showClassRoster && liveClassId !== null && canRunAuthenticatedQuery()
      ? { liveClassId, now: queryNow.nowMs }
      : "skip",
  );

  const instructorPanel = $derived(instructorPanelQuery.data ?? null);
  const memberPanel = $derived(memberPanelQuery.data ?? null);

  type RosterAttendee = {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    reservationStatus: "reserved" | "joined";
  };

  const rosterAttendees = $derived.by((): RosterAttendee[] => {
    if (instructorPanel === null) return [];
    const byUser = new Map<string, RosterAttendee>();
    for (const member of instructorPanel.reserved) {
      byUser.set(member.userId as string, {
        userId: member.userId as string,
        displayName: member.displayName,
        avatarUrl: member.avatarUrl,
        reservationStatus: "reserved",
      });
    }
    for (const member of instructorPanel.joined) {
      byUser.set(member.userId as string, {
        userId: member.userId as string,
        displayName: member.displayName,
        avatarUrl: member.avatarUrl,
        reservationStatus: "joined",
      });
    }
    return [...byUser.values()].sort((a, b) => {
      const joinedDelta =
        Number(b.reservationStatus === "joined") - Number(a.reservationStatus === "joined");
      if (joinedDelta !== 0) return joinedDelta;
      return a.displayName.localeCompare(b.displayName, "he");
    });
  });

  const liveKitByUserId = $derived.by(() => {
    const map = new Map<string, (typeof participants)[number]>();
    for (const participant of participants) {
      const userId = userIdFromLiveKitIdentity(participant.identity);
      if (userId !== null) map.set(userId, participant);
    }
    return map;
  });

  const hostParticipant = $derived.by(() => {
    if (hostUserId === null) {
      return (
        participants.find((participant) =>
          isClassHostParticipant(participant.identity, null, broadcastHostUserId),
        ) ?? null
      );
    }
    return liveKitByUserId.get(hostUserId) ?? null;
  });

  const sortedParticipants = $derived(
    [...participants].sort(
      (a, b) =>
        Number(isClassHostParticipant(b.identity, hostUserId, broadcastHostUserId)) -
          Number(isClassHostParticipant(a.identity, hostUserId, broadcastHostUserId)) ||
        (a.name || a.identity).localeCompare(b.name || b.identity),
    ),
  );

  const useInstructorRosterList = $derived(showClassRoster && instructorPanel !== null);
  const useMemberRosterList = $derived(!showClassRoster && memberPanel !== null);

  const memberAttendees = $derived(memberPanel?.attendees ?? []);

  const extraLiveKitParticipants = $derived(
    sortedParticipants.filter((participant) => {
      if (participant.isLocal) return true;
      if (
        isClassHostParticipant(participant.identity, hostUserId, broadcastHostUserId)
      ) {
        return false;
      }
      const userId = userIdFromLiveKitIdentity(participant.identity);
      if (userId === null) return true;
      return !memberAttendees.some((attendee) => attendee.userId === userId);
    }),
  );
</script>

<ScrollArea.Root class="hb-scroll-area lr-panel__scroll">
  <ScrollArea.Viewport class="hb-scroll-area__viewport">
    <div class="lr-participant-list">
      {#if useInstructorRosterList}
        {#each rosterAttendees as attendee (attendee.userId)}
          <ParticipantRosterRow
            displayName={attendee.displayName}
            avatarUrl={attendee.avatarUrl}
            reservationStatus={attendee.reservationStatus}
            participant={liveKitByUserId.get(attendee.userId) ?? null}
          />
        {/each}
        {#each sortedParticipants.filter((p) => {
          const userId = userIdFromLiveKitIdentity(p.identity);
          return (
            isInstructorIdentity(p.identity) ||
            userId === null ||
            !rosterAttendees.some((a) => a.userId === userId)
          );
        }) as participant (participant.identity)}
          <ParticipantSidebarItem {participant} {hostUserId} {broadcastHostUserId} />
        {/each}
      {:else if useMemberRosterList && memberPanel}
        <HostRosterRow
          displayName={memberPanel.host.displayName}
          avatarUrl={memberPanel.host.avatarUrl}
          participant={hostParticipant}
        />
        {#each memberAttendees as attendee (attendee.userId)}
          <ParticipantRosterRow
            displayName={attendee.displayName}
            avatarUrl={attendee.avatarUrl}
            reservationStatus={attendee.reservationStatus}
            participant={liveKitByUserId.get(attendee.userId) ?? null}
          />
        {/each}
        {#each extraLiveKitParticipants as participant (participant.identity)}
          <ParticipantSidebarItem {participant} {hostUserId} {broadcastHostUserId} />
        {/each}
      {:else if useInstructorRosterList && rosterAttendees.length === 0}
        <p class="lr-participant-list__empty">עדיין אין הרשמות לשיעור הזה.</p>
      {:else}
        {#each sortedParticipants as participant (participant.identity)}
          <ParticipantSidebarItem {participant} {hostUserId} {broadcastHostUserId} />
        {/each}
      {/if}
    </div>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical" class="hb-scroll-area__scrollbar" />
</ScrollArea.Root>
