<script lang="ts">
  import InstructorAvatar from "$lib/features/calendar/components/InstructorAvatar.svelte";

  let {
    displayName,
    avatarUrl = null,
    size = 32,
  }: {
    displayName: string;
    avatarUrl?: string | null;
    size?: number;
  } = $props();
</script>

<div class="roster-member-identity">
  <InstructorAvatar name={displayName} {avatarUrl} {size} />
  <span class="roster-member-identity__name">{displayName}</span>
</div>

<style>
  .roster-member-identity {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
  }

  .roster-member-identity__name {
    font-weight: 700;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
