<script lang="ts">
	import AppLayout from "$features/app/components/AppLayout.svelte";

	let { children } = $props();
</script>

<AppLayout>
	{@render children()}
</AppLayout>
