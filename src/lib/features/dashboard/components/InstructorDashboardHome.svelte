<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import InstructorQuickUpload from "./InstructorQuickUpload.svelte";
  import InstructorUpcomingAgenda from "./InstructorUpcomingAgenda.svelte";
  import InstructorCreateLiveCard from "./InstructorCreateLiveCard.svelte";
  import InstructorComplianceBar from "./InstructorComplianceBar.svelte";
  import "../dashboard.css";

  type StaffProfile = NonNullable<
    FunctionReturnType<typeof api.users.dashboard.get>
  >["appProfile"];

  let { appProfile }: { appProfile: StaffProfile | null } = $props();
</script>

<div class="dashboard-home dashboard-home--instructor">
  <InstructorComplianceBar {appProfile} />
  <InstructorCreateLiveCard />
  <InstructorUpcomingAgenda />
  <InstructorQuickUpload />
</div>
