<script lang="ts">
  import Button from "../ui/Button.svelte";
  import Input from "../ui/Input.svelte";
  import Notice from "../ui/Notice.svelte";
  import { initAuth, signOut, startEmailSignIn, verifyEmailCode } from "../../lib/auth/session.svelte";

  type Step = "email" | "code";

  let step = $state<Step>("email");
  let email = $state("");
  let code = $state("");
  let status = $state("");
  let pending = $state(false);
  const auth = initAuth();

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    status = "";
    pending = true;

    try {
      if (step === "email") {
        await startEmailSignIn(email);
        step = "code";
        status = "שלחנו קוד כניסה לאימייל שלך. בדקי גם בתיקיית הספאם.";
      } else {
        await verifyEmailCode(email, code);
      }
    } catch (reason) {
      status = reason instanceof Error ? reason.message : "לא הצלחנו להתחבר כרגע. נסי שוב בעוד רגע.";
    } finally {
      pending = false;
    }
  }

  function closeModal() {
    const overlay = document.getElementById("auth-overlay");
    if (overlay) overlay.classList.remove("is-open");
  }
</script>

{#if auth.isLoading}
  <div class="auth-state">
    <Notice>בודקים חשבון...</Notice>
  </div>
{:else if auth.isAuthenticated}
  <div class="auth-state">
    <div class="auth-state__text">
      <p class="kicker">מחוברת ✦</p>
      <h2>החשבון פתוח</h2>
      <p class="intro">אפשר להמשיך לאזור האישי או לצאת.</p>
    </div>
    <a class="auth-btn auth-btn--primary" href="/dashboard">לאזור האישי</a>
    <button class="auth-btn" type="button" onclick={() => { signOut(); closeModal(); }}>יציאה</button>
  </div>
{:else}
  <form class="auth-form" onsubmit={submit}>
    <div class="auth-form__header">
      <p class="kicker">גישה לחברים</p>
      <h2>{step === "email" ? "כניסה או הרשמה" : "בדקי את האימייל"}</h2>
      <p class="intro">
        {step === "email"
          ? "מכניסים כתובת אימייל ומקבלים קוד חד־פעמי. אין צורך בסיסמה."
          : `שלחנו קוד לכתובת ${email}`}
      </p>
    </div>

    {#if step === "email"}
      <Input
        label="אימייל"
        name="email"
        type="email"
        autocomplete="email"
        required
        bind:value={email}
      />
    {:else}
      <Input
        label="קוד חד־פעמי"
        name="code"
        inputmode="numeric"
        autocomplete="one-time-code"
        required
        bind:value={code}
      />
      <button class="link" type="button" onclick={() => { step = "email"; status = ""; }}>
        להשתמש באימייל אחר
      </button>
    {/if}

    <Button type="submit" tone="ink" disabled={pending}>
      {pending ? "רגע..." : step === "email" ? "שלחו לי קוד" : "להיכנס"}
    </Button>

    {#if auth.error}
      <Notice tone="danger">{auth.error}</Notice>
    {/if}

    {#if status}
      <Notice tone={status.includes("לא הצלחנו") ? "danger" : "neutral"}>{status}</Notice>
    {/if}
  </form>
{/if}

<style>
  .auth-form,
  .auth-state {
    display: grid;
    gap: 16px;
  }

  .auth-form__header,
  .auth-state__text {
    display: grid;
    gap: 8px;
    margin-block-end: 4px;
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
    line-height: 1.5;
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

  .auth-btn {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    padding-inline: var(--space-4);
    font-weight: 700;
    font-size: var(--step--1);
    cursor: pointer;
    text-decoration: none;
    font-family: inherit;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .auth-btn:hover {
    background: var(--surface);
  }

  .auth-btn--primary {
    background: var(--ink);
    color: var(--white);
    border-color: var(--ink);
  }

  .auth-btn--primary:hover {
    background: var(--ink-secondary);
  }
</style>
