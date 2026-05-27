<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { pathologyOptions, type Pathology } from "$lib/labels";
  import { Checkbox } from "bits-ui";
  import { TextareaAutosize } from "runed";

  let {
    pathologies = $bindable(),
    notes = $bindable(),
  }: {
    pathologies: Pathology[];
    notes: string;
  } = $props();

  const { t } = useI18n();

  let search = $state("");
  let notesEl = $state<HTMLTextAreaElement | null>(null);
  const notesAutosize = new TextareaAutosize({
    element: () => notesEl ?? undefined,
    input: () => notes,
  });

  const filteredPathologies = $derived(
    pathologyOptions.filter(([, label]) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return label.toLowerCase().includes(q);
    }),
  );

  function toggle<T extends string>(list: T[], value: T) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }
</script>

<div class="notes-step">
  <label class="notes-step__search">
    <span class="notes-step__search-label">{t.onboarding.notes.searchLabel()}</span>
    <input
      type="search"
      bind:value={search}
      placeholder={t.onboarding.notes.searchPlaceholder()}
      autocomplete="off"
    />
  </label>

  <div class="notes-step__pathologies" role="group" aria-label={t.onboarding.notes.pathologiesGroup()}>
    {#each filteredPathologies as [value, label]}
      <Checkbox.Root
        class="hb-choice pathology-choice"
        checked={pathologies.includes(value)}
        onCheckedChange={() => {
          pathologies = toggle(pathologies, value);
        }}
      >
        <span>{label}</span>
      </Checkbox.Root>
    {:else}
      <p class="notes-step__empty">{t.onboarding.notes.searchEmpty()}</p>
    {/each}
  </div>

  <label class="notes-wrap">
    <span class="notes-wrap__label">{t.onboarding.notes.otherLabel()}</span>
    <textarea
      bind:value={notes}
      bind:this={notesEl}
      maxlength="600"
      placeholder={t.onboarding.notes.placeholder()}
    ></textarea>
    <span class="char-count">{t.misc.charCount({ count: notes.length })}</span>
  </label>
</div>

<style>
  .notes-step {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .notes-step__search {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .notes-step__search-label {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--foreground-muted);
  }

  .notes-step__search input {
    width: 100%;
    border: var(--border);
    padding: var(--space-3) var(--space-4);
    font: inherit;
    font-size: var(--step-0);
    background: var(--paper);
  }

  .notes-step__search input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--focus-ring);
  }

  .notes-step__pathologies {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    max-height: min(42vh, 360px);
    overflow-y: auto;
    padding-inline-end: var(--space-1);
  }

  .notes-step__pathologies :global(.pathology-choice) {
    min-height: 44px;
    padding: var(--space-2) var(--space-4);
    font-size: var(--step--1);
    font-weight: 700;
  }

  .notes-step__pathologies :global(.pathology-choice[data-state="checked"]) {
    transform: none;
    box-shadow: none;
  }

  .notes-step__empty {
    margin: 0;
    color: var(--foreground-muted);
    font-size: var(--step--1);
  }

  .notes-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .notes-wrap__label {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--foreground-muted);
  }

  .notes-wrap textarea {
    min-height: 120px;
    resize: vertical;
    border: var(--border);
    padding: var(--space-4);
    font: inherit;
    font-size: var(--step-0);
    line-height: 1.6;
    background: var(--paper);
  }

  .notes-wrap textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--focus-ring);
  }

  .char-count {
    align-self: flex-end;
    font-size: var(--step--1);
    font-family: var(--font-mono);
    color: var(--foreground-muted);
  }
</style>
