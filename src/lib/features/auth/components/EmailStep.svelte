<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    email = $bindable(),
    pending,
    method,
    sendCode,
    sendLink,
  }: {
    email: string;
    pending: boolean;
    method: "code" | "link" | null;
    sendCode: () => void;
    sendLink: () => void;
  } = $props();

  const { t } = useI18n();
</script>

<Input
  label={t.auth.emailLabel()}
  name="email"
  type="email"
  autocomplete="email"
  required
  bind:value={email}
/>

<div class="method-buttons">
  <Button type="button" tone="ink" disabled={pending} onclick={sendCode}>
    {pending && method === "code" ? t.auth.pendingSendCode() : `📩 ${t.auth.submitSendCode()}`}
  </Button>
  <Button type="button" tone="paper" disabled={pending} onclick={sendLink}>
    {pending && method === "link" ? t.auth.pendingSendLink() : `🔗 ${t.auth.submitSendLink()}`}
  </Button>
</div>

<style>
  .method-buttons {
    display: grid;
    gap: 12px;
  }
</style>
