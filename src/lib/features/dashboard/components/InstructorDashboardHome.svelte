<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import InstructorQuickUpload from "./InstructorQuickUpload.svelte";
  import InstructorUpcomingAgenda from "./InstructorUpcomingAgenda.svelte";
  import InstructorCreateLiveCard from "./InstructorCreateLiveCard.svelte";
  import ProfileSummary from "./ProfileSummary.svelte";
  import "../dashboard.css";

  type StaffProfile = NonNullable<
    FunctionReturnType<typeof api.users.dashboard.get>
  >["appProfile"];

  let { appProfile }: { appProfile: StaffProfile | null } = $props();
</script>

<div class="dashboard-home">
  <InstructorCreateLiveCard />

  <div class="dashboard-home__grid dashboard-home__grid--instructor">
    <InstructorQuickUpload />
    <InstructorUpcomingAgenda />
  </div>

  {#if appProfile}
    <ProfileSummary isStaff={true} {appProfile} showEditLink />
  {/if}
</div>
