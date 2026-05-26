<script lang="ts">
  import { tick } from "svelte";
  import { ScrollState } from "runed";
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { ChatMessage } from "$lib/features/live/types";

  let {
    open,
    messages,
    draft = $bindable(""),
    onSend,
    onClose,
  }: {
    open: boolean;
    messages: ChatMessage[];
    draft?: string;
    onSend: () => void;
    onClose: () => void;
  } = $props();

  const { t } = useI18n();

  let scrollEl = $state<HTMLDivElement | null>(null);
  const scroll = new ScrollState({ element: () => scrollEl });
  const showScrollButton = $derived(!scroll.arrived.bottom);

  function submit(event: SubmitEvent) {
    event.preventDefault();
    onSend();
  }

  function scrollToBottom() {
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
  }

  $effect(() => {
    const count = messages.length;
    if (count > 0 && scroll.arrived.bottom) {
      void tick().then(scrollToBottom);
    }
  });
</script>

{#if open}
  <aside class="lr-chat" aria-label={t.live.room.chatTitle()}>
    <div class="lr-panel__header">
      <h3>{t.live.room.chatTitle()}</h3>
      <button
        type="button"
        class="hb-button hb-button--close"
        onclick={onClose}
        aria-label={t.live.room.close()}
      >
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>

    <div class="lr-chat__scroll" bind:this={scrollEl}>
      <div class="lr-chat__list">
        {#if messages.length === 0}
          <div class="lr-chat__empty">{t.live.room.chatEmpty()}</div>
        {/if}
        {#each messages as message (message.id)}
          <article class="lr-chat-message" class:lr-chat-message--local={message.isLocal}>
            <div class="lr-chat-message__meta">
              <span>{message.name}</span>
              <time>{new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem" }).format(new Date(message.createdAt))}</time>
            </div>
            <p class="lr-chat-message__text">{message.text}</p>
          </article>
        {/each}
      </div>
    </div>

    {#if showScrollButton}
      <button
        type="button"
        class="lr-chat__scroll-btn"
        onclick={scrollToBottom}
        aria-label={t.live.room.newMessages()}
      >
        <span class="material-symbols-rounded">arrow_downward</span>
      </button>
    {/if}

    <form class="lr-chat__form" onsubmit={submit}>
      <input
        class="lr-chat__input"
        bind:value={draft}
        maxlength="500"
        placeholder={t.live.room.chatPlaceholder()}
        aria-label={t.live.room.chatPlaceholder()}
      />
      <Button.Root class="hb-button hb-button--ink hb-button--sm" type="submit" disabled={!draft.trim()}>
        {t.live.room.chatSend()}
      </Button.Root>
    </form>
  </aside>
{/if}

<style>
  .lr-chat {
    position: relative;
  }

  .lr-chat__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--line-light) transparent;
  }

  .lr-chat__scroll::-webkit-scrollbar {
    width: 6px;
  }

  .lr-chat__scroll::-webkit-scrollbar-thumb {
    background: var(--line-light);
    border-radius: 999px;
  }

  .lr-chat__scroll-btn {
    position: absolute;
    inset-block-end: 56px;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 36px;
    display: inline-grid;
    place-items: center;
    background: var(--ink);
    color: var(--white);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    z-index: 5;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: bounce-in 0.3s var(--ease-out);
  }

  .lr-chat__scroll-btn:hover {
    background: var(--ink-secondary);
  }

  @keyframes bounce-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
</style>
