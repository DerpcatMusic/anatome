<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { authQuery, setCachedRole } from "$lib/auth/session.svelte";
  import { convex } from "$lib/convex/client";
  import { liveRoomHref } from "$lib/i18n/context";
  import PageShell from "$features/app/components/PageShell.svelte";
  import FormSection from "$features/app/components/FormSection.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import WeeklyAgenda from "$features/live/components/WeeklyAgenda.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import type { Equipment } from "$lib/labels";

  type LiveClass = FunctionReturnType<typeof api.instructorLive.listMine>[number];
  type ViewerProfile = FunctionReturnType<typeof api.appProfiles.viewer>;

  let profile = $state<ViewerProfile | null>(null);
  let classes = $state<LiveClass[]>([]);
  let loading = $state(true);
  let error = $state("");
  let actionId = $state<string | null>(null);

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
      profile = await authQuery(api.appProfiles.viewer, {});
      if (profile === null || (profile.role !== "admin" && profile.role !== "instructor")) {
        error = "רק מדריכה או אדמין יכולות לפתוח לייב";
        return;
      }
      setCachedRole(profile.role);
      classes = (await authQuery(api.instructorLive.listMine, {})) ?? [];
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לטעון את אזור הלייב.";
    } finally {
      loading = false;
    }
  }

  async function createClass() {
    error = "";
    actionId = "create";
    try {
      await convex.mutation(api.instructorLive.createLiveClass, {
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
      await convex.mutation(api.instructorLive.startLive, { liveClassId });
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
      await convex.mutation(api.instructorLive.endLive, { liveClassId });
      await load();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לסיים את הלייב.";
    } finally {
      actionId = null;
    }
  }

  onMount(() => void load());
</script>

<PageShell
  kicker="HomeBody Studio"
  title="יצירת לייב פילאטיס"
  description="תזמון שיעור, ציוד חובה, פתיחת חדר LiveKit וניהול הכניסה לפני השידור."
  badge={profile?.role === "admin" ? "Admin" : "Instructor"}
  {loading}
  error={error || null}
>
  {#if !loading && !error}
    <div class="studio-grid">
      <FormSection title="תזמון שיעור חדש">
        <form onsubmit={(event) => { event.preventDefault(); void createClass(); }}>
          <div class="live-type-switch" role="radiogroup" aria-label="סוג לייב">
            <label class:selected={liveType === "group_live"}>
              <input type="radio" bind:group={liveType} value="group_live" />
              <span>לייב קבוצתי</span>
              <small>עד 12 משתתפות, RSVP, קרדיט לייב אחד</small>
            </label>
            <label class:selected={liveType === "one_on_one"}>
              <input type="radio" bind:group={liveType} value="one_on_one" />
              <span>1:1 אישי</span>
              <small>משתתפת אחת, קרדיט 1:1 אחד</small>
            </label>
          </div>

          <label class="field">
            <span class="field__label">כותרת</span>
            <input bind:value={title} required maxlength="120" />
          </label>

          <label class="field">
            <span class="field__label">תיאור קצר</span>
            <textarea bind:value={description} rows="3" maxlength="500"></textarea>
          </label>

          <div class="form-grid">
            <label class="field">
              <span class="field__label">מתי מתחילים</span>
              <input type="datetime-local" bind:value={startsAtLocal} required />
            </label>
            <label class="field">
              <span class="field__label">משך בדקות</span>
              <input type="number" min="15" max="180" bind:value={durationMinutes} />
            </label>
            <label class="field">
              <span class="field__label">פתיחת כניסה לפני</span>
              <input type="number" min="0" max="60" bind:value={joinOpensMinutesBefore} />
            </label>
            <label class="field">
              <span class="field__label">מקומות</span>
              <input type="number" min="1" max="12" bind:value={capacity} disabled={liveType === "one_on_one"} />
            </label>
          </div>

          <EquipmentPicker bind:selected={requiredEquipment} label="ציוד חובה לשיעור" />

          <button class="primary-action" type="submit" disabled={actionId === "create" || requiredEquipment.length === 0}>
            {actionId === "create" ? "יוצרות..." : "לתזמן לייב"}
          </button>
        </form>
      </FormSection>

      <WeeklyAgenda {classes} onStart={startLive} onEnd={endLive} {actionId} />
    </div>
  {:else if error}
    <div class="retry-state">
      <button type="button" onclick={load}>נסה שוב</button>
    </div>
  {/if}
</PageShell>

<style>
  .studio-grid {
    display: grid;
    grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.35fr);
    gap: var(--space-6);
    align-items: start;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .live-type-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .live-type-switch label {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    border: var(--border);
    padding: var(--space-4);
    cursor: pointer;
    background: var(--white);
  }

  .live-type-switch label.selected {
    background: var(--sky);
  }

  .live-type-switch input {
    position: absolute;
    opacity: 0;
  }

  .live-type-switch span {
    font-weight: 900;
  }

  .live-type-switch small {
    color: var(--muted);
    line-height: 1.5;
    font-weight: 600;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .field__label {
    font-size: var(--step--1);
    color: var(--muted);
    font-weight: 800;
  }

  input,
  textarea {
    width: 100%;
    min-width: 0;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    font: inherit;
    padding: var(--space-3);
    box-sizing: border-box;
  }

  textarea {
    resize: vertical;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .primary-action,
  .retry-state button {
    width: fit-content;
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--ink);
    color: var(--white);
    padding-inline: var(--space-5);
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  .primary-action:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .retry-state {
    border: var(--border);
    background: var(--white);
    padding: var(--space-5);
  }

  @media (max-width: 980px) {
    .studio-grid,
    .form-grid,
    .live-type-switch {
      grid-template-columns: 1fr;
    }
  }
</style>
