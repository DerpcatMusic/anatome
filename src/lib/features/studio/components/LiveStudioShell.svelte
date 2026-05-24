<script lang="ts">
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { authQuery, setCachedRole } from "$lib/auth/session.svelte";
  import { useConvexClient } from "convex-svelte";
  import { liveRoomHref } from "$lib/i18n/context";
  import WeeklyAgenda from "$features/live/components/WeeklyAgenda.svelte";
  import StudioLiveClassForm from "./StudioLiveClassForm.svelte";
  import LiveClassModalShell from "$features/live/components/LiveClassModalShell.svelte";
  import type { Equipment } from "$lib/labels";

  type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];
  type ViewerProfile = FunctionReturnType<typeof api.profiles.viewer.get>;

  let profile = $state<ViewerProfile | null>(null);
  let classes = $state<LiveClass[]>([]);
  let loading = $state(true);
  let error = $state("");
  let actionId = $state<string | null>(null);

  let showCreateModal = $state(false);
  let title = $state("פילאטיס לייב - נשימה, כוח ותנועה");
  let description = $state("שיעור דו־כיווני קטן עם תיקונים אישיים. הכיני מרחב שקט, מצלמה פתוחה וציוד מתאים.");
  let liveType = $state<"group_live" | "one_on_one">("group_live");
  let startsAtLocal = $state(defaultStartsAtLocal());
  let durationMinutes = $state(50);
  let joinOpensMinutesBefore = $state(10);
  let capacity = $state(12);
  let requiredEquipment = $state<Equipment[]>(["mat"]);

  function defaultStartsAtLocal() {
    const date = new Date(Date.now() + 60 * 60 * 1000);
    date.setMinutes(0, 0, 0);
    return toDateTimeLocal(date);
  }

  function toDateTimeLocal(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  async function load() {
    loading = true;
    error = "";
    try {
      profile = await authQuery(api.profiles.viewer.get, {});
      if (profile === null || (profile.role !== "admin" && profile.role !== "instructor")) {
        window.location.assign("/calendar");
        return;
      }
      setCachedRole(profile.role);
      classes = (await authQuery(api.live.class.listMine, {})) ?? [];
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לטעון את אזור הלייב.";
    } finally {
      loading = false;
    }
  }

  async function retryLoad() {
    await load();
  }

  const client = useConvexClient();

  async function createClass() {
    error = "";
    actionId = "create";
    try {
      await client.mutation(api.live.class.create, {
        title,
        description,
        type: liveType,
        startsAt: new Date(startsAtLocal).getTime(),
        durationMinutes,
        joinOpensMinutesBefore,
        capacity: liveType === "one_on_one" ? 1 : capacity,
        requiredEquipment,
      });
      startsAtLocal = defaultStartsAtLocal();
      durationMinutes = 50;
      showCreateModal = false;
      await load();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו ליצור לייב.";
    } finally {
      actionId = null;
    }
  }

  async function startLive(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    error = "";
    try {
      await client.mutation(api.live.class.start, { liveClassId });
      await load();
      window.location.assign(liveRoomHref(liveClassId));
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו להתחיל את הלייב.";
    } finally {
      actionId = null;
    }
  }

  async function endLive(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    error = "";
    try {
      await client.mutation(api.live.class.end, { liveClassId });
      await load();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לסיים את הלייב.";
    } finally {
      actionId = null;
    }
  }

  function handleSelectSlot(timeLocalString: string, slotDurationMinutes: number) {
    startsAtLocal = timeLocalString;
    durationMinutes = slotDurationMinutes;
    showCreateModal = true;
  }

  function openCreateModal() {
    startsAtLocal = defaultStartsAtLocal();
    durationMinutes = 50;
    showCreateModal = true;
  }

  $effect(() => {
    void load();
  });
</script>

{#if loading}
  <div class="studio-skeleton">
    <div class="skeleton skeleton--header"></div>
    <div class="skeleton skeleton--grid"></div>
  </div>
{:else if error}
  <div class="studio-error">
    <p>{error}</p>
    <button class="hb-button hb-button--ghost" type="button" onclick={retryLoad}>נסה שוב</button>
  </div>
{:else}
  <div class="studio-page">
    <WeeklyAgenda
      {classes}
      onStart={startLive}
      onEnd={endLive}
      {actionId}
      onSelectSlot={handleSelectSlot}
      onRefreshClasses={load}
      onCreateButtonClick={openCreateModal}
    />
  </div>
{/if}

<LiveClassModalShell
  bind:open={showCreateModal}
  title="תזמון שיעור לייב חדש"
  icon="calendar_add_on"
  iconColor="var(--sky-strong)"
>
  <StudioLiveClassForm
    bind:title
    bind:description
    bind:liveType
    bind:startsAtLocal
    bind:durationMinutes
    bind:joinOpensMinutesBefore
    bind:capacity
    bind:requiredEquipment
    pending={actionId === "create"}
    onSubmit={() => void createClass()}
  />
  {#if error}
    <div class="form-error" role="alert">
      <span class="material-symbols-rounded">error</span>
      {error}
    </div>
  {/if}
</LiveClassModalShell>

<style>
  .studio-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    direction: rtl;
  }

  .studio-skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    height: 100%;
  }

  .skeleton {
    background: var(--line-light);
    animation: pulse 1.6s ease-in-out infinite;
    border-radius: 4px;
  }

  .skeleton--header {
    height: 48px;
    width: 60%;
  }

  .skeleton--grid {
    flex: 1;
    min-height: 0;
  }

  .studio-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-6);
    text-align: center;
  }

  .studio-error p {
    color: var(--danger-text);
    font-weight: 700;
    margin: 0;
  }

  .form-error {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--danger-soft);
    color: var(--danger-text);
    border: 1px solid var(--danger);
    padding: var(--space-3);
    font-weight: 800;
    font-size: var(--step--1);
    margin-block-start: var(--space-3);
  }

  .form-error .material-symbols-rounded {
    font-size: var(--step-1);
    flex-shrink: 0;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
</style>
