<script lang="ts">
  import { Button } from "bits-ui";

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

<label class="hb-input-field">
  <span class="hb-field__label">{t.auth.emailLabel()}</span>
  <input class="hb-input" type="email" name="email" autocomplete="email" required bind:value={email} />
</label>

<div class="method-buttons grid gap-3">
  <Button.Root class="hb-button hb-button--ink" type="button" disabled={pending} onclick={sendCode}>
    {pending && method === "code" ? t.auth.pendingSendCode() : t.auth.submitSendCode()}
  </Button.Root>
  <Button.Root class="hb-button hb-button--paper" type="button" disabled={pending} onclick={sendLink}>
    {pending && method === "link" ? t.auth.pendingSendLink() : t.auth.submitSendLink()}
  </Button.Root>
</div>

<style>
  .method-buttons {
    min-width: 0;
  }
</style>
