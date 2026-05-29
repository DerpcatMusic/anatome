<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { Button } from "bits-ui";
  import { useConvexClient } from "convex-svelte";
  import LiveClassModalShell from "$features/live/components/LiveClassModalShell.svelte";
  import StudioLiveClassForm from "$features/studio/components/StudioLiveClassForm.svelte";
  import type { Equipment } from "$lib/labels";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { nextAppHourDateTimeLocalString, parseDateTimeLocal } from "$lib/datetime/local";
  import Notice from "$components/ui/Notice.svelte";
  import "../dashboard.css";

  const client = useConvexClient();
  const { t } = useI18n();

  let modalOpen = $state(false);
  let pending = $state(false);
  let error = $state("");

  let title = $state("פילאטיס לייב");
  let description = $state("שיעור קטן עם תיקונים. מצלמה וציוד מוכנים.");
  let liveType = $state<"group_live" | "one_on_one">("group_live");
  let startsAtLocal = $state(defaultStartsAtLocal());
  let durationMinutes = $state(50);
  let joinOpensMinutesBefore = $state(15);
  let capacity = $state(12);
  let requiredEquipment = $state<Equipment[]>(["mat"]);

  function defaultStartsAtLocal() {
    return nextAppHourDateTimeLocalString();
  }

  function resetForm() {
    title = "פילאטיס לייב";
    description = "שיעור קטן עם תיקונים. מצלמה וציוד מוכנים.";
    liveType = "group_live";
    startsAtLocal = defaultStartsAtLocal();
    durationMinutes = 50;
    joinOpensMinutesBefore = 15;
    capacity = 12;
    requiredEquipment = ["mat"];
  }

  function closeModal() {
    modalOpen = false;
    error = "";
  }

  async function createClass() {
    error = "";
    pending = true;
    try {
      await client.mutation(api.live.class.create, {
        title,
        description,
        type: liveType,
        startsAt: parseDateTimeLocal(startsAtLocal),
        durationMinutes: liveType === "one_on_one" ? 45 : durationMinutes,
        joinOpensMinutesBefore,
        capacity: liveType === "one_on_one" ? 1 : capacity,
        requiredEquipment: requiredEquipment.length > 0 ? requiredEquipment : ["mat"],
      });
      closeModal();
      resetForm();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : t.dashboard.instructor.createError();
    } finally {
      pending = false;
    }
  }
</script>

<section class="dashboard-panel instructor-create" aria-labelledby="instructor-create-title">
  <h3 id="instructor-create-title" class="dashboard-panel__title instructor-create__title">
    {t.dashboard.instructor.createTitle()}
  </h3>
  <Button.Root
    class="hb-button hb-button--ink hb-button--md"
    type="button"
    onclick={() => {
      modalOpen = true;
    }}
  >
    {t.dashboard.instructor.createCta()}
  </Button.Root>
</section>

<LiveClassModalShell
  bind:open={modalOpen}
  title={t.dashboard.instructor.createModalTitle()}
  icon="live_tv"
  iconColor="var(--accent)"
  wide
  onClose={closeModal}
>
  {#if error}
    <Notice tone="danger">{error}</Notice>
  {/if}
  <StudioLiveClassForm
    bind:title
    bind:description
    bind:liveType
    bind:startsAtLocal
    bind:durationMinutes
    bind:joinOpensMinutesBefore
    bind:capacity
    bind:requiredEquipment
    pending={pending}
    mode="quick"
    onSubmit={createClass}
    onCancel={closeModal}
  />
</LiveClassModalShell>

<style>
  .instructor-create {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
    min-width: 0;
    border-color: color-mix(in oklch, var(--accent) 18%, var(--border-color));
    background: color-mix(in oklch, var(--accent) 5%, var(--elevated));
  }

  .instructor-create__title {
    margin: 0;
    flex: 1 1 12rem;
    min-width: 0;
  }
</style>
