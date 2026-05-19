<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    code = $bindable(),
    email,
    pending,
    method,
    reset,
    switchToCode,
  }: {
    code: string;
    email: string;
    pending: boolean;
    method: "code" | "link" | null;
    reset: () => void;
    switchToCode: () => void;
  } = $props();

  const { t } = useI18n();

  function openEmailApp() {
    window.location.href = "mailto:";
  }
</script>

{#if method === "code"}
  <Input
    label={t.auth.codeLabel()}
    name="code"
    inputmode="numeric"
    autocomplete="one-time-code"
    required
    bind:value={code}
  />

  <Button type="submit" tone="ink" disabled={pending}>
    {pending ? t.auth.pendingVerify() : t.auth.submitEnter()}
  </Button>

  <div class="auth-links">
    <button class="link" type="button" onclick={reset}>{t.auth.switchEmail()}</button>
  </div>
{:else}
  <!-- link sent state -->
  <div class="link-sent">
    <p>{t.auth.linkSentText()}</p>
    <Button type="button" tone="paper" onclick={openEmailApp}>
      📧 {t.auth.openEmailApp()}
    </Button>
  </div>

  <div class="auth-divider">
    <span>{t.misc.or()}</span>
  </div>

  <div class="auth-links">
    <button class="link" type="button" onclick={switchToCode}>
      {t.auth.enterCodeManually()}
    </button>
    <button class="link" type="button" onclick={reset}>{t.auth.switchEmail()}</button>
  </div>
{/if}

<style>
  .link-sent {
    display: grid;
    gap: 12px;
    text-align: center;
    padding: var(--space-4) 0;
  }

  .link-sent p {
    margin: 0;
    color: var(--muted);
    font-size: var(--step-0);
    line-height: 1.5;
  }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--muted);
    font-size: var(--step--1);
  }

  .auth-divider::before,
  .auth-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--line-light);
  }

  .auth-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
  }

  .link {
    justify-self: start;
    border: 0;
    background: transparent;
    padding: 0;
    color: var(--ink);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
    font-size: var(--step--1);
    transition: color var(--duration-fast) var(--ease-out);
  }

  .link:hover {
    color: var(--sky-strong);
  }
</style>
