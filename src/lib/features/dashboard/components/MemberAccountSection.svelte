<script lang="ts">
  import { Button } from "bits-ui";
  import OnboardingForm from "$features/onboarding/components/OnboardingForm.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import SubscriptionManager from "./SubscriptionManager.svelte";
  import ProfileSummary from "./ProfileSummary.svelte";
  import NotificationSettings from "$features/settings/components/NotificationSettings.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;

  type MemberProfile = {
    equipment: string[];
    experience: "new" | "some" | "steady";
    goals: string[];
    pathologies: string[];
    notes: string;
    healthDeclarationAnswers?: Record<string, "yes" | "no">;
    healthDeclarationAcceptedAt?: number;
    healthInfoConsentAcceptedAt?: number;
  };

  let {
    profile,
    displayName,
    subscription,
    subscriptionPlan,
    pendingSubscriptionPlan,
    onSaved,
    editMode = false,
  }: {
    profile: MemberProfile | null;
    displayName?: string;
    subscription: DashboardData["subscription"] | null;
    subscriptionPlan: DashboardData["subscriptionPlan"] | null;
    pendingSubscriptionPlan: DashboardData["pendingSubscriptionPlan"] | null;
    onSaved: () => void | Promise<void>;
    editMode?: boolean;
  } = $props();

  const { t } = useI18n();

  let memberEditing = $state(editMode);

  $effect(() => {
    if (editMode) {
      memberEditing = true;
    }
  });

  function startMemberEditing() {
    memberEditing = true;
  }

  function cancelMemberEditing() {
    memberEditing = false;
  }

  async function onMemberProfileSaved() {
    memberEditing = false;
    await Promise.resolve(onSaved?.());
  }
</script>

{#if profile && !memberEditing}
  <div class="dashboard-account__toolbar">
    <Button.Root
      class="hb-button hb-button--ink hb-button--sm"
      type="button"
      onclick={startMemberEditing}
    >
      {t.dashboard.profile.edit()}
    </Button.Root>
  </div>

  <ProfileSummary isStaff={false} {profile} showEditLink={false} panelVariant="default" />
{:else}
  <div class="dashboard-account__toolbar">
    {#if profile}
      <Button.Root
        class="hb-button hb-button--ghost hb-button--sm"
        type="button"
        onclick={cancelMemberEditing}
      >
        חזרה לתצוגה
      </Button.Root>
    {/if}
  </div>

  {#if !profile}
    <Notice tone="neutral">{t.app.needsOnboarding.subtitle()}</Notice>
  {/if}

  <OnboardingForm
    mode="edit"
    initialProfile={profile ?? undefined}
    initialDisplayName={displayName}
    onSaved={onMemberProfileSaved}
  />
{/if}

<div id="dashboard-subscription">
  <SubscriptionManager
    {subscription}
    {subscriptionPlan}
    {pendingSubscriptionPlan}
  />
</div>

<NotificationSettings />

<style>
  .dashboard-account__toolbar {
    display: flex;
    justify-content: flex-start;
  }
</style>
