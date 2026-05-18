<script lang="ts">
  import { verifyMagicLinkCode } from "../../lib/auth/session.svelte";

  let message = $state("מעבירים אותך...");
  let error = $state("");

  async function handle() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      window.location.replace("/");
      return;
    }

    try {
      await verifyMagicLinkCode(code);
      // verifyMagicLinkCode handles its own redirect
    } catch (err) {
      console.error("Magic link failed:", err);
      error = "הקוד פג תוקף או כבר נוצל. נסי להתחבר שוב.";
      message = "";
      setTimeout(() => window.location.replace("/"), 3000);
    }
  }

  handle();
</script>

<div class="callback">
  {#if error}
    <p class="error">{error}</p>
    <p class="sub">מעבירים אותך חזרה...</p>
  {:else}
    <p class="message">{message}</p>
  {/if}
</div>

<style>
  .callback {
    display: grid;
    place-content: center;
    text-align: center;
    gap: var(--space-3);
    min-height: 40vh;
  }
  .message {
    font-size: var(--step-1);
    color: var(--muted);
  }
  .error {
    font-size: var(--step-0);
    color: var(--danger);
  }
  .sub {
    font-size: var(--step--1);
    color: var(--muted-light);
  }
</style>
