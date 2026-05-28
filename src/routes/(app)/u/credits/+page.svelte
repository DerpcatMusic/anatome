<script lang="ts">
  import PageShell from "$features/app/components/PageShell.svelte";
  import CreditPurchaser from "$lib/features/credits/components/CreditPurchaser.svelte";
</script>

<PageShell
  title="קניית קרדיטים"
  description="בוחרים סוגים וכמויות — הנחת כמות עד 10% לכל סוג בנפרד."
>
  <CreditPurchaser />
</PageShell>
