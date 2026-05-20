<script lang="ts">
  import { tick } from "svelte";
  import Button from "$components/ui/Button.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();

  let scrollEl = $state<HTMLDivElement | null>(null);
  let showScrollButton = $state(false);

  function submit(event: SubmitEvent) {
    event.preventDefault();
    void room.sendChatMessage();
  }

  function scrollToBottom() {
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
      showScrollButton = false;
    }
  }

  function onScroll() {
    if (!scrollEl) return;
    const nearBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 60;
    showScrollButton = !nearBottom;
  }

  $effect(() => {
    const count = room.chatMessages.length;
    if (count > 0 && !showScrollButton) {
      void tick().then(scrollToBottom);
    }
  });
</script>

{#if room.showChat}
  <aside class="lr-chat lr-glass" aria-label={t.live.room.chatTitle()}>
    <div class="lr-panel__header">
      <h3>{t.live.room.chatTitle()}</h3>
      <button
        type="button"
        class="hb-button hb-button--close"
        onclick={() => room.showChat = false}
        aria-label={t.live.room.close()}
      >
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>

    <div class="lr-chat__scroll" bind:this={scrollEl} onscroll={onScroll}>
      <div class="lr-chat__list">
        {#if room.chatMessages.length === 0}
          <div class="lr-chat__empty">{t.live.room.chatEmpty()}</div>
        {/if}
        {#each room.chatMessages as message (message.id)}
          <article class="lr-chat-message" class:lr-chat-message--local={message.isLocal}>
            <div class="lr-chat-message__meta">
              <span>{message.name}</span>
              <time>{new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</time>
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
        bind:value={room.chatDraft}
        maxlength="500"
        placeholder={t.live.room.chatPlaceholder()}
        aria-label={t.live.room.chatPlaceholder()}
      />
      <Button type="submit" tone="ink" size="sm" disabled={!room.chatDraft.trim()}>
        {t.live.room.chatSend()}
      </Button>
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
