<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';

  let {
    notes = $bindable(),
  }: {
    notes: string;
  } = $props();

  const { t } = useI18n();
</script>

<label class="notes-wrap">
  <textarea bind:value={notes} maxlength="600" placeholder={t.onboarding.notes.placeholder()} rows="5"></textarea>
  <span class="char-count">{t.misc.charCount({ count: notes.length })}</span>
</label>

<style>
  .notes-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .notes-wrap textarea {
    min-height: 160px;
    resize: vertical;
    border: var(--border);
    padding: var(--space-4);
    font: inherit;
    font-size: var(--step-0);
    line-height: 1.6;
    background: var(--white);
  }

  .notes-wrap textarea:focus {
    outline: none;
    border-color: var(--sky-strong);
  }

  .char-count {
    align-self: flex-end;
    font-size: var(--step--1);
    font-family: var(--font-mono);
    color: var(--muted);
  }
</style>
