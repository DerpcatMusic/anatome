<script lang="ts">
  import { page } from "$app/state";
  import { Collapsible } from "bits-ui";
  import { resource } from "runed";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useConvexClient, useQuery } from "convex-svelte";
  import AvatarUpload from "$features/profile/components/AvatarUpload.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import "../dashboard.css";
  import InstructorAccountSection from "./InstructorAccountSection.svelte";
  import MemberAccountSection from "./MemberAccountSection.svelte";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;
  type ViewerProfile = NonNullable<FunctionReturnType<typeof api.profiles.viewer.get>>;
  type StaffViewerProfile = ViewerProfile & {
    certificateDocument?: string;
    insuranceDocument?: string;
  };

  function staffViewerProfile(profile: ViewerProfile | null | undefined): StaffViewerProfile | null {
    if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) return null;
    return profile as StaffViewerProfile;
  }

  function buildMemberProfile(raw: NonNullable<DashboardData["profile"]>)
 {
    return {
      equipment: raw.equipment,
      experience: raw.experience,
      goals: raw.goals,
      pathologies: raw.pathologies ?? [],
      notes: raw.notes ?? "",
      healthDeclarationAnswers: raw.healthDeclarationAnswers ?? undefined,
      healthDeclarationAcceptedAt: raw.healthDeclarationAcceptedAt ?? undefined,
      healthInfoConsentAcceptedAt: raw.healthInfoConsentAcceptedAt ?? undefined,
    };
  }

  let {
    open = $bindable(false),
    isStaff,
    dashboard,
  }: {
    open?: boolean;
    isStaff: boolean;
    dashboard: DashboardData | null;
  } = $props();

  const auth = initAuth();
  const { t } = useI18n();
  const queryNow = useQueryNowMs();
  const client = useConvexClient();

  const dashboardResource = resource(
    () => (auth.isAuthenticated ? queryNow.nowMs : null),
    async (now) => {
      if (now === null) return dashboard;
      return await authQuery(api.users.dashboard.get, { now });
    },
  );

  const appProfileResource = resource(
    () => auth.isAuthenticated && isStaff,
    async (shouldLoad) => {
      if (!shouldLoad) return null;
      return await authQuery(api.profiles.viewer.get, {});
    },
  );

  const viewerQuery = useQuery(api.profiles.viewer.get, () => (auth.isAuthenticated ? {} : "skip"));
  const viewerAvatarUrl = $derived(viewerQuery.data?.avatarUrl ?? null);
  const viewerDisplayName = $derived(viewerQuery.data?.displayName ?? "");

  const profile = $derived(
    dashboardResource.current?.profile
      ? buildMemberProfile(dashboardResource.current.profile)
      : null,
  );

  $effect(() => {
    if (page.url.searchParams.get("panel") === "account") {
      open = true;
    }
    if (page.url.searchParams.get("edit") === "1" && !isStaff) {
      open = true;
    }
  });

  async function refreshViewerProfile() {
    if (isStaff) {
      await appProfileResource.refetch();
    }
  }

  async function onMemberProfileSaved() {
    await dashboardResource.refetch();
  }
</script>

<section id="dashboard-account" class="dashboard-account">
  <Collapsible.Root bind:open class="dashboard-account__collapsible">
    <Collapsible.Trigger class="dashboard-account__trigger">
      <span class="dashboard-account__trigger-label">{t.dashboard.member.accountSectionTitle()}</span>
      <span class="material-symbols-rounded dashboard-account__chevron" aria-hidden="true">
        expand_more
      </span>
    </Collapsible.Trigger>

    <Collapsible.Content class="dashboard-account__content">
      <section class="dashboard-account__avatar" aria-label="תמונת פרופיל">
        <AvatarUpload
          avatarUrl={viewerAvatarUrl}
          displayName={viewerDisplayName}
          onUpdated={refreshViewerProfile}
        />
      </section>

      {#if isStaff}
        <InstructorAccountSection
          profile={staffViewerProfile(appProfileResource.current)}
          onProfileUpdate={refreshViewerProfile}
        />
      {:else}
        <MemberAccountSection
          {profile}
          displayName={dashboardResource.current?.appProfile?.displayName}
          subscription={dashboardResource.current?.subscription ?? null}
          subscriptionPlan={dashboardResource.current?.subscriptionPlan ?? null}
          pendingSubscriptionPlan={dashboardResource.current?.pendingSubscriptionPlan ?? null}
          onSaved={onMemberProfileSaved}
          editMode={page.url.searchParams.get("edit") === "1"}
        />
      {/if}
    </Collapsible.Content>
  </Collapsible.Root>
</section>

<style>
  .dashboard-account {
    min-width: 0;
    scroll-margin-top: var(--space-6);
  }

  :global(.dashboard-account__collapsible) {
    border: var(--border);
    border-radius: var(--radius-lg);
    background: var(--elevated);
    overflow: hidden;
  }

  :global(.dashboard-account__trigger) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-4);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    text-align: start;
  }

  :global(.dashboard-account__trigger:focus-visible) {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
  }

  .dashboard-account__trigger-label {
    font-size: var(--text-base);
    font-weight: 700;
  }

  .dashboard-account__chevron {
    transition: transform var(--duration-fast) var(--ease-out);
  }

  :global(.dashboard-account__collapsible[data-state="open"]) .dashboard-account__chevron {
    transform: rotate(180deg);
  }

  :global(.dashboard-account__content) {
    display: grid;
    gap: var(--space-4);
    padding: 0 var(--space-4) var(--space-4);
  }

  .dashboard-account__avatar {
    padding-top: var(--space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard-account__chevron {
      transition: none;
    }
  }
</style>
