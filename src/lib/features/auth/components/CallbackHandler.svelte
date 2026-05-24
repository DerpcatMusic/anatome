<script lang="ts">
  import { browser } from "$app/environment";
  import { completeSignIn, storeTokens } from "$lib/auth/session.svelte";
  import { useConvexClient } from "convex-svelte";
  import { api } from "$convex/_generated/api";

  let message = $state("מעבירים אותך...");
  let error = $state("");
  const client = useConvexClient();

  async function handle() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      window.location.replace("/");
      return;
    }

    try {
      const result = await client.action(api.auth.signIn, { provider: "email", params: { code } });
      storeTokens(result.tokens ?? null);
      await completeSignIn();
    } catch (err) {
      console.error("Magic link failed:", err);
      error = "הקוד פג תוקף או כבר נוצל. נסי להתחבר שוב.";
      message = "";
      setTimeout(() => window.location.replace("/"), 3000);
    }
  }

  if (browser) {
    handle();
  }
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
    color: var(--muted);
  }
</style>
