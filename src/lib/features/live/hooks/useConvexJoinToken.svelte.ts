import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { api } from "$convex/_generated/api";
import { useQuery } from "convex-svelte";
import {
  authQuery,
  canRunAuthenticatedQuery,
  initAuth,
} from "$lib/auth/session.svelte";
import { hasLiveClassIdParam } from "$lib/convex/ids";
import {
  joinInfoEqual,
  joinSnapshotFromContext,
  type JoinContextSnapshot,
  type JoinTokenPhase,
  type JoinInfo,
  type JoinAccessSnapshot,
} from "../join-token";
import type { RoomStatus } from "../types";

export type UseConvexJoinTokenOptions = {
  client: ConvexClient;
  /** Reactive class id (use a getter so URL changes re-fetch). */
  get liveClassId(): Id<"liveClasses"> | null;
  /** Shared query clock from the live room route shell. */
  get nowMs(): number;
};

/**
 * Reactive pre-join context via `getJoinContext`; JWT minting deferred until connect.
 */
export function useConvexJoinToken(options: UseConvexJoinTokenOptions) {
  const auth = initAuth();

  const classIdFromUrl = $derived.by(() => {
    const id = options.liveClassId;
    return id !== null ? String(id) : null;
  });

  const contextQuery = useQuery(api.live.session.getJoinContext, () => {
    const id = options.liveClassId;
    if (id === null || auth.isLoading || !canRunAuthenticatedQuery()) return "skip";
    return { liveClassId: id, now: options.nowMs };
  });

  let contextOverride = $state<JoinContextSnapshot | null | undefined>(undefined);

  /** HTTP preflight while Convex WS auth is still settling (see app `+layout` cap). */
  $effect(() => {
    const id = options.liveClassId;
    const now = options.nowMs;
    if (id === null || auth.isLoading) {
      contextOverride = undefined;
      return;
    }
    if (!auth.isAuthenticated) {
      contextOverride = undefined;
      return;
    }
    if (canRunAuthenticatedQuery()) {
      if (contextQuery.data !== undefined) {
        contextOverride = undefined;
      }
      return;
    }
    if (contextOverride !== undefined) return;

    let cancelled = false;
    void authQuery(api.live.session.getJoinContext, { liveClassId: id, now }).then(
      (data) => {
        if (!cancelled) contextOverride = data ?? null;
      },
    );
    return () => {
      cancelled = true;
    };
  });

  const awaitingJoinContext = $derived(
    options.liveClassId !== null &&
      (auth.isLoading ||
        (!canRunAuthenticatedQuery() &&
          auth.isAuthenticated &&
          contextOverride === undefined) ||
        (canRunAuthenticatedQuery() &&
          contextOverride === undefined &&
          contextQuery.data === undefined &&
          contextQuery.isLoading)),
  );

  const snapshot = $derived(
    joinSnapshotFromContext(contextOverride ?? contextQuery.data, {
      isLoading: auth.isLoading || contextQuery.isLoading || awaitingJoinContext,
      isAuthenticated: auth.isAuthenticated,
      authError: auth.error,
      hasClassId: options.liveClassId !== null,
    }),
  );

  let joinInfo = $state<JoinInfo | null>(null);

  $effect(() => {
    const id = options.liveClassId;
    if (id === null) {
      joinInfo = null;
      return;
    }
    if (snapshot.status !== "ready" && snapshot.status !== "prep") {
      joinInfo = null;
    }
  });

  const phase = $derived<JoinTokenPhase>(
    joinInfo !== null ? "token" : snapshot.phase,
  );
  const status = $derived<RoomStatus>(snapshot.status);
  const error = $derived(snapshot.error);
  const joinAccess = $derived<JoinAccessSnapshot | null>(snapshot.joinAccess);
  const classTitle = $derived(snapshot.classTitle);

  async function refetch() {
    const id = options.liveClassId;
    if (id === null) {
      joinInfo = null;
      contextOverride = undefined;
      return;
    }
    const args = { liveClassId: id, now: options.nowMs };
    contextOverride = canRunAuthenticatedQuery()
      ? await options.client.query(api.live.session.getJoinContext, args)
      : await authQuery(api.live.session.getJoinContext, args);
  }

  function setJoinInfo(info: JoinInfo | null) {
    if (joinInfoEqual(joinInfo, info)) return;
    joinInfo = info;
  }

  return {
    get phase() {
      return phase;
    },
    get status() {
      return status;
    },
    get error() {
      return error;
    },
    get joinInfo() {
      return joinInfo;
    },
    get joinAccess() {
      return joinAccess;
    },
    get classTitle() {
      return classTitle;
    },
    get isLoading() {
      return phase === "loading";
    },
    get hasToken() {
      return joinInfo !== null;
    },
    get canEnter() {
      return joinAccess?.canEnter === true;
    },
    refetch,
    setJoinInfo,
  };
}
