<script lang="ts">
  import LandingCopyEditor from "$lib/features/landing/components/LandingCopyEditor.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>עריכת טקסטים — עמוד הבית</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<LandingCopyEditor baseline={data.baseline} fieldCount={data.fieldCount} />
