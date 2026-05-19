<script lang="ts">
  import type { LiveRoom } from "$lib/features/live/room.svelte";

  let { room }: { room: LiveRoom } = $props();

  function submit(event: SubmitEvent) {
    event.preventDefault();
    void room.sendChatMessage();
  }
</script>

<aside class="room-chat" aria-label="Room chat">
  <div class="chat-header">
    <h3>Chat</h3>
  </div>
  <div class="chat-list">
    {#each room.chatMessages as message (message.id)}
      <article class="chat-message" class:chat-message--local={message.isLocal}>
        <div class="chat-message__meta">
          <span>{message.name}</span>
          <time>{new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</time>
        </div>
        <p>{message.text}</p>
      </article>
    {/each}
  </div>
  <form class="chat-form" onsubmit={submit}>
    <input bind:value={room.chatDraft} maxlength="500" placeholder="Message" />
    <button type="submit" disabled={!room.chatDraft.trim()}>Send</button>
  </form>
</aside>

<style>
  .room-chat {
    width: clamp(240px, 22vw, 320px);
    background: var(--white);
    border-inline-start: var(--border);
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 0;
    overflow: hidden;
  }

  .chat-header {
    min-height: 48px;
    display: flex;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    border-bottom: var(--border);
  }

  .chat-header h3 {
    margin: 0;
    font-size: var(--step-0);
  }

  .chat-list {
    min-height: 0;
    overflow-y: auto;
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .chat-message {
    display: grid;
    gap: 4px;
    padding: var(--space-2);
    background: var(--surface);
    border: 1px solid var(--line-light);
  }

  .chat-message--local {
    background: var(--sky-soft);
  }

  .chat-message__meta {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    color: var(--muted);
    font-size: var(--step--2);
    font-weight: 800;
  }

  .chat-message p {
    margin: 0;
    color: var(--ink);
    font-size: var(--step--1);
    overflow-wrap: anywhere;
  }

  .chat-form {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-2);
    padding: var(--space-3);
    border-top: var(--border);
  }

  .chat-form input {
    min-width: 0;
    min-height: 40px;
    border: var(--border);
    padding-inline: var(--space-2);
    font: inherit;
  }

  .chat-form button {
    min-height: 40px;
    border: var(--border);
    background: var(--ink);
    color: var(--white);
    padding-inline: var(--space-3);
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  .chat-form button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (max-width: 64rem) {
    .room-chat {
      display: none;
    }
  }
</style>
