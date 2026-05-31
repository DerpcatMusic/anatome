<script lang="ts">
  import { Button, PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from "bits-ui";

  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    code = $bindable(),
    email,
    pending,
    method,
    reset,
    switchToCode,
    submitCode,
  }: {
    code: string;
    email: string;
    pending: boolean;
    method: "code" | "link" | null;
    reset: () => void;
    switchToCode: () => void;
    submitCode: () => void;
  } = $props();

  const { t } = useI18n();

  type CellProps = PinInputRootSnippetProps["cells"][0];

  let pinInputEl: HTMLInputElement | null = null;

  /** Strip spaces, dashes, etc. so paste works from SMS and email apps. */
  function sanitizeOtpPaste(text: string) {
    return text.replace(/\D/g, "");
  }

  $effect(() => {
    if (method !== "code") return;
    queueMicrotask(() => pinInputEl?.focus());
  });

  function openEmailApp() {
    window.location.href = "mailto:";
  }
</script>

{#if method === "code"}
  <div class="hb-input-field">
    <label class="hb-field__label" for="auth-code-input">{t.auth.codeLabel()}</label>
    <PinInput.Root
      bind:value={code}
      bind:inputRef={pinInputEl}
      inputId="auth-code-input"
      maxlength={6}
      pattern={REGEXP_ONLY_DIGITS}
      pasteTransformer={sanitizeOtpPaste}
      textalign="center"
      autocomplete="one-time-code"
      onComplete={submitCode}
    >
      {#snippet children({ cells })}
        <div class="otp-cells" dir="ltr">
          {#each cells as cell, index (index)}
            {@render Cell(cell)}
          {/each}
        </div>
      {/snippet}
    </PinInput.Root>
  </div>

  <Button.Root class="hb-button hb-button--ink" type="submit" disabled={pending}>
    {pending ? t.auth.pendingVerify() : t.auth.submitEnter()}
  </Button.Root>

  <div class="auth-links">
    <Button.Root class="hb-button hb-button--ghost" type="button" onclick={reset}>{t.auth.switchEmail()}</Button.Root>
  </div>
{:else}
  <!-- link sent state -->
  <div class="link-sent">
    <p>{t.auth.linkSentText()}</p>
    <Button.Root class="hb-button hb-button--paper" type="button" onclick={openEmailApp}>
      {t.auth.openEmailApp()}
    </Button.Root>
  </div>

  <div class="auth-divider">
    <span>{t.misc.or()}</span>
  </div>

  <div class="auth-links">
    <Button.Root class="hb-button hb-button--ghost" type="button" onclick={switchToCode}>
      {t.auth.enterCodeManually()}
    </Button.Root>
    <Button.Root class="hb-button hb-button--ghost" type="button" onclick={reset}>{t.auth.switchEmail()}</Button.Root>
  </div>
{/if}

<style>
  .link-sent {
    display: grid;
    gap: var(--space-3);
    text-align: center;
    padding: var(--space-2) 0;
  }

  .link-sent p {
    margin: 0;
    color: var(--foreground-muted);
    font-size: var(--step-0);
    line-height: 1.5;
  }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--foreground-muted);
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

  .otp-cells {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.5rem;
    margin-block-start: 0.25rem;
  }

  :global(.otp-cell) {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    min-height: 3.5rem;
    border: 1px solid var(--line);
    border-radius: 0.5rem;
    background: var(--surface);
    color: var(--ink);
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    transition:
      border-color 120ms ease,
      box-shadow 120ms ease,
      transform 120ms ease;
  }

  /* bits-ui sets data-active="" (not "true") when the cell is focused */
  :global(.otp-cell[data-active]) {
    border-color: var(--secondary);
    background: var(--secondary-subtle);
    box-shadow: var(--ring);
    transform: translateY(-1px);
  }

  :global(.otp-caret) {
    position: absolute;
    width: 2px;
    height: 1.35rem;
    border-radius: 1px;
    background: var(--secondary);
    animation: otp-caret-blink 1s step-end infinite;
  }

  @keyframes otp-caret-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.otp-caret) {
      animation: none;
      opacity: 1;
    }

    :global(.otp-cell[data-active]) {
      transform: none;
    }
  }

</style>

{#snippet Cell(cell: CellProps)}
  <PinInput.Cell {cell} class="otp-cell">
    {#if cell.char !== null}
      <span>{cell.char}</span>
    {/if}
    {#if cell.hasFakeCaret}
      <span class="otp-caret" aria-hidden="true"></span>
    {/if}
  </PinInput.Cell>
{/snippet}
