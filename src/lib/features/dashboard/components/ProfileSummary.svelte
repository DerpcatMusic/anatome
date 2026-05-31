<script lang="ts">
  import StaffProfileSummary from "./StaffProfileSummary.svelte";
  import CustomerProfileSummary from "./CustomerProfileSummary.svelte";

  type StaffProfile = {
    displayName?: string | null;
    credentials?: string | null;
    hasCertificate?: boolean;
    hasInsurance?: boolean;
  };

  type CustomerProfile = {
    experience: string;
    equipment: string[];
    goals: string[];
    pathologies?: string[];
    notes?: string | null;
    healthDeclarationAnswers?: Record<string, "yes" | "no">;
    healthDeclarationAcceptedAt?: number;
    healthInfoConsentAcceptedAt?: number;
  };

  let {
    isStaff,
    appProfile,
    profile,
    showEditLink = true,
    panelVariant = "default",
  }: {
    isStaff: boolean;
    appProfile?: StaffProfile | null;
    profile?: CustomerProfile | null;
    showEditLink?: boolean;
    panelVariant?: "default" | "aside";
  } = $props();
</script>

{#if isStaff && appProfile}
  <StaffProfileSummary {panelVariant} {showEditLink} {appProfile} />
{:else if !isStaff && profile}
  <CustomerProfileSummary {panelVariant} {showEditLink} {profile} />
{/if}
