<script lang="ts">
  import Notice from "$components/ui/Notice.svelte";
  import { initAuth, signOut, storeTokens } from "$lib/auth/session.svelte";

  import { useI18n } from "$lib/i18n/runes.svelte";
  import { useConvexClient } from "convex-svelte";
  import { api } from "$convex/_generated/api";
  import EmailStep from "./EmailStep.svelte";
  import CodeStep from "./CodeStep.svelte";
  import LoggedInState from "./LoggedInState.svelte";

  type Method = "code" | "link";
  type Step = "email" | "verify";

  let step = $state<Step>("email");
  let method = $state<Method | null>(null);
  let email = $state("");
  let code = $state("");
  let status = $state("");
  let pending = $state(false);
  const auth = initAuth();
  const client = useConvexClient();
  const { t } = useI18n();

  async function sendCode() {
    if (!email.trim()) {
      status = t.auth.validation.emailRequired();
      return;
    }
    method = "code";
    await submitRequest();
  }

  async function sendLink() {
    if (!email.trim()) {
      status = t.auth.validation.emailRequired();
      return;
    }
    method = "link";
    await submitRequest();
  }

  async function submitRequest() {
    status = "";
    pending = true;

    try {
      await client.action(api.auth.signIn, {
        provider: "email",
        params: { email: email.trim().toLowerCase() },
      });
      step = "verify";
      if (method === "code") {
        status = t.auth.statusCodeSent();
      } else {
        status = t.auth.statusLinkSent();
      }
    } catch (reason) {
      status = reason instanceof Error ? reason.message : t.auth.statusSendError();
      method = null;
    } finally {
      pending = false;
    }
  }

  async function verifyCode() {
    if (!code.trim()) return;

    status = "";
    pending = true;

    try {
      const result = await client.action(api.auth.signIn, {
        provider: "email",
        params: { email, code: code.trim() },
      });
      storeTokens(result.tokens ?? null);
      window.location.assign("/onboarding");
    } catch (reason) {
      status = reason instanceof Error ? reason.message : t.auth.statusCodeError();
    } finally {
      pending = false;
    }
  }

  function reset() {
    step = "email";
    method = null;
    status = "";
    code = "";
  }

  function closeModal() {
    window.dispatchEvent(new CustomEvent("anatome:auth-close"));
  }

  function switchToCode() {
    method = "code";
    code = "";
    status = "";
  }
</script>

{#if auth.isLoading}
  <div class="auth-state">
    <Notice>{t.auth.loading()}</Notice>
  </div>
{:else if auth.isAuthenticated}
  <LoggedInState {signOut} {closeModal} />
{:else}
  <form class="auth-form" onsubmit={(e) => { e.preventDefault(); if (step === "verify" && method === "code") verifyCode(); }}>
    <div class="auth-form__header">
      <p class="kicker">{t.auth.title()}</p>

      {#if step === "email"}
        <h2>{t.auth.emailStepTitle()}</h2>
        <p class="intro">{t.auth.emailStepIntro()}</p>
      {:else if method === "code"}
        <h2>{t.auth.codeStepTitle()}</h2>
        <p class="intro">{t.auth.codeStepIntro({ email })}</p>
      {:else}
        <h2>{t.auth.codeStepTitle()}</h2>
        <p class="intro">{t.auth.linkStepIntro({ email })}</p>
      {/if}
    </div>

    {#if step === "email"}
      <EmailStep bind:email {pending} {method} {sendCode} {sendLink} />
    {:else}
      <CodeStep bind:code {email} {pending} {method} {reset} {switchToCode} submitCode={verifyCode} />
    {/if}

    {#if auth.error}
      <Notice tone="danger">{auth.error}</Notice>
    {/if}

    {#if status}
      <Notice tone={status.includes("לא הצלחנו") || status.includes("שגוי") || status.includes("נא להזין") ? "danger" : "neutral"}>
        {status}
      </Notice>
    {/if}
  </form>
{/if}

<style>
  .auth-form,
  .auth-state {
    display: grid;
    gap: var(--space-4);
  }

  .auth-form__header {
    display: grid;
    gap: var(--space-2);
    margin-block-end: var(--space-1);
  }

  .kicker {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
  }

  h2 {
    margin: 0;
    font-size: var(--step-2);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  .intro {
    margin: 0;
    color: var(--muted);
    line-height: 1.4;
    font-size: var(--step-0);
  }

</style>
