<script lang="ts">
  import { api } from "../../../convex/_generated/api";
  import { convex } from "../../lib/convex/client";
  import {
    equipmentOptions,
    goalOptions,
    experienceOptions,
    equipmentLabel,
    goalLabel,
    experienceLabel,
  } from "../../lib/labels";
  import Button from "../ui/Button.svelte";
  import Notice from "../ui/Notice.svelte";
  import EquipmentIcon from "../icons/EquipmentIcon.svelte";

  let {
    redirectTo,
    initialProfile,
    mode = "onboarding",
  }: {
    redirectTo?: string;
    mode?: "onboarding" | "edit";
    initialProfile?: {
      equipment: string[];
      experience: "new" | "some" | "steady";
      goals: string[];
      notes: string;
    };
  } = $props();

  const steps = [
    { id: "experience", label: "ניסיון" },
    { id: "equipment", label: "ציוד" },
    { id: "goals", label: "מטרות" },
    { id: "notes", label: "סיום" },
  ] as const;



  type Equipment = (typeof equipmentOptions)[number][0];
  type Goal = (typeof goalOptions)[number][0];

  let stepIndex = $state(0);
  let equipment = $state<Equipment[]>(["mat"]);
  let goals = $state<Goal[]>(["strength"]);
  let experience = $state<"new" | "some" | "steady">("some");
  let notes = $state("");
  let pending = $state(false);
  let error = $state("");
  let submitted = $state(false);

  $effect(() => {
    equipment = initialProfile?.equipment?.filter((e): e is Equipment => equipmentOptions.some(([id]) => id === e)) ?? ["mat"];
    goals = initialProfile?.goals?.filter((g): g is Goal => goalOptions.some(([id]) => id === g)) ?? ["strength"];
    experience = initialProfile?.experience ?? "some";
    notes = initialProfile?.notes ?? "";
    stepIndex = 0;
    error = "";
    submitted = false;
  });

  const currentStep = $derived(steps[stepIndex]);
  const isFirst = $derived(stepIndex === 0);
  const isLast = $derived(stepIndex === steps.length - 1);
  const stepTitle = $derived(
    currentStep.id === "experience" ? "כמה ניסיון יש לך?" :
    currentStep.id === "equipment" ? "מה יש לך בבית?" :
    currentStep.id === "goals" ? "מה המטרות שלך?" :
    "משהו שחשוב שנדע?"
  );
  const stepSubtitle = $derived(
    currentStep.id === "experience" ? "אין תשובה לא נכונה. נתחיל ממשהו פשוט." :
    currentStep.id === "equipment" ? "נתאים שיעורים לפי מה שיש לך זמין." :
    currentStep.id === "goals" ? "אפשר לבחור כמה — זו לא התחייבות." :
    "אופציונלי. המדריכה תראה את זה לפני השיעור הראשון."
  );

  const canProceed = $derived(
    currentStep.id === "equipment" ? equipment.length > 0 :
    currentStep.id === "goals" ? goals.length > 0 :
    true
  );

  function toggle<T extends string>(list: T[], value: T) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function next() {
    if (!canProceed) return;
    error = "";
    if (!isLast) stepIndex++;
  }

  function back() {
    error = "";
    if (!isFirst) stepIndex--;
  }

  async function submit() {
    pending = true;
    error = "";
    try {
      await convex.mutation(api.users.completeOnboarding, {
        equipment, experience, goals, notes,
      });
      submitted = true;
      const target = redirectTo ?? "/dashboard";
      setTimeout(() => window.location.assign(target), 800);
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לשמור כרגע. נסי שוב.";
      pending = false;
    }
  }
</script>

{#if submitted}
  <div class="success">
    <div class="success-mark">✦</div>
    <h2>{mode === "edit" ? "הפרופיל עודכן" : "ההתאמה נשמרה"}</h2>
    <p>{mode === "edit" ? "מעבירים אותך חזרה..." : "מעבירים אותך לאזור האישי..."}</p>
  </div>
{:else}
  <div class="onboarding">
    <!-- Right panel: question (beige mesh) — FIRST in DOM → column 1 = RIGHT in RTL -->
    <div class="panel panel--question">
      <div class="panel__inner">
        {#if mode === "onboarding"}
          <div class="progress-dots">
            {#each steps as step, i}
              <button
                class="dot"
                class:active={i === stepIndex}
                class:done={i < stepIndex}
                onclick={() => { if (i < stepIndex) stepIndex = i; }}
                disabled={i > stepIndex}
                type="button"
                aria-label={step.label}
              ></button>
            {/each}
          </div>
        {/if}

        <div class="question">
          <span class="question__num">{String(stepIndex + 1).padStart(2, "0")}</span>
          <h1>{stepTitle}</h1>
          <p>{stepSubtitle}</p>
        </div>
      </div>
    </div>

    <!-- Left panel: form (white) — SECOND in DOM → column 2 = LEFT in RTL -->
    <div class="panel panel--form">
      <div class="panel__inner">
        <div class="form-body">
          {#if currentStep.id === "experience"}
            <div class="options">
              {#each experienceOptions as [val, title]}
            {@const desc = val === "new" ? "מעולם לא עשיתי פילאטיס, או שזה נשמע לי כמו שפה זרה" : val === "some" ? "עשיתי כמה שיעורים פה ושם, אני מכירה את הבסיס" : "פילאטיס הוא חלק משגרת השבוע שלי"}
                <label class="option" class:selected={experience === val}>
                  <input type="radio" bind:group={experience} value={val} />
                  <span class="option__title">{title}</span>
                  <span class="option__desc">{desc}</span>
                </label>
              {/each}
            </div>

          {:else if currentStep.id === "equipment"}
            <div class="equip-grid">
              {#each equipmentOptions as [value, label]}
                <label class="equip-card" class:selected={equipment.includes(value)}>
                  <input type="checkbox" checked={equipment.includes(value)} onchange={() => equipment = toggle(equipment, value)} />
                  <EquipmentIcon name={value} />
                  <span>{label}</span>
                </label>
              {/each}
            </div>
            {#if equipment.length === 0}
              <Notice tone="neutral">בחרי לפחות פריט אחד כדי שנוכל להתאים שיעורים.</Notice>
            {/if}

          {:else if currentStep.id === "goals"}
            <div class="chips">
              {#each goalOptions as [value, label]}
                <label class="chip" class:selected={goals.includes(value)}>
                  <input type="checkbox" checked={goals.includes(value)} onchange={() => goals = toggle(goals, value)} />
                  <span>{label}</span>
                </label>
              {/each}
            </div>
            {#if goals.length === 0}
              <Notice tone="neutral">בחרי לפחות מטרה אחת כדי שנוכל להתאים שיעורים.</Notice>
            {/if}

          {:else if currentStep.id === "notes"}
            <label class="notes-wrap">
              <textarea bind:value={notes} maxlength="600" placeholder="למשל: כאב גב תחתון, אחרי ניתוח קיסרי, מגבלות ברך..." rows="5"></textarea>
              <span class="char-count">{notes.length}/600</span>
            </label>

            <div class="summary-box">
              <p class="summary-box__title">סיכום</p>
              <div class="summary-box__row"><span>ניסיון</span><span>{experienceLabel(experience)}</span></div>
              <div class="summary-box__row"><span>ציוד</span><span>{equipment.map(equipmentLabel).join(", ")}</span></div>
              <div class="summary-box__row"><span>מטרות</span><span>{goals.map(goalLabel).join(", ")}</span></div>
            </div>
          {/if}

          {#if error}
            <Notice tone="danger">{error}</Notice>
          {/if}
        </div>

        <div class="form-footer">
          {#if !isFirst}
            <button class="back-btn" type="button" onclick={back} disabled={pending}>← חזרה</button>
          {:else}
            <span></span>
          {/if}

          {#if isLast}
            <Button type="button" tone="ink" disabled={pending || !canProceed} onclick={submit}>
              {pending ? "שומרים..." : mode === "edit" ? "שמור שינויים ✦" : "לשמור ולהתחיל ✦"}
            </Button>
          {:else}
            <Button type="button" tone="ink" disabled={!canProceed} onclick={next}>
              המשך →
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ─── Layout: edge-to-edge, full height, 2 equal panes ─── */
  .onboarding {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 56px);
    align-items: start; /* panels size independently — no cross-panel stretch */
  }

  /* In RTL: first child → column 1 = RIGHT side */
  /* second child → column 2 = LEFT side */

  .panel {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 56px);
    contain: layout; /* isolate layout changes from sibling panel */
  }

  .panel__inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: clamp(32px, 5vw, 64px) clamp(24px, 4vw, 56px);
  }

  /* ─── Right panel: question + beige mesh ─── */
  .panel--question {
    background-color: var(--paper);
    background-image:
      radial-gradient(ellipse 70% 50% at 20% 30%, color-mix(in srgb, var(--sky) 35%, transparent), transparent 55%),
      radial-gradient(ellipse 50% 70% at 80% 20%, color-mix(in srgb, var(--beige) 40%, transparent), transparent 50%),
      radial-gradient(ellipse 60% 40% at 50% 80%, color-mix(in srgb, var(--sky-soft) 28%, transparent), transparent 50%);
    background-size: 180% 180%;
    animation: mesh-drift 24s ease-in-out infinite alternate;
  }

  @keyframes mesh-drift {
    0% { background-position: 0% 0%, 100% 0%, 50% 100%; }
    50% { background-position: 8% 12%, 92% 8%, 48% 92%; }
    100% { background-position: 15% 5%, 85% 15%, 45% 85%; }
  }

  .progress-dots {
    display: flex;
    gap: var(--space-3);
    margin-bottom: auto;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: var(--border);
    background: var(--white);
    cursor: pointer;
    padding: 0;
    transition: background var(--duration-fast), transform var(--duration-fast);
  }

  .dot.active {
    background: var(--ink);
    border-color: var(--ink);
    transform: scale(1.15);
  }

  .dot.done {
    background: var(--ink);
    border-color: var(--ink);
  }

  .dot:disabled {
    cursor: default;
    opacity: 0.3;
  }

  .question {
    margin-top: auto;
    margin-bottom: auto;
    padding-bottom: var(--space-8);
  }

  .question__num {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    display: block;
    margin-bottom: var(--space-4);
  }

  .question h1 {
    font-size: var(--step-3);
    line-height: 1.05;
    margin: 0 0 var(--space-4);
  }

  .question p {
    font-size: var(--step-1);
    color: var(--muted);
    line-height: 1.5;
    max-width: 36ch;
    margin: 0;
  }

  /* ─── Left panel: form + white ─── */
  .panel--form {
    background: var(--white);
  }

  .form-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    overflow-y: auto;
    min-height: 360px; /* lock minimum so short steps don't collapse */
    padding-bottom: var(--space-4);
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--space-6);
    border-top: var(--border);
    flex-shrink: 0;
  }

  /* ─── Experience options ─── */
  .options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .option {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-5);
    border: var(--border);
    background: var(--white);
    cursor: pointer;
    transition: background var(--duration-fast);
  }

  .option:hover {
    background: var(--surface);
  }

  .option.selected {
    background: var(--sky-soft);
    border-color: var(--line);
  }

  .option input {
    position: absolute;
    opacity: 0;
  }

  .option__title {
    font-weight: 700;
    font-size: var(--step-1);
  }

  .option__desc {
    color: var(--muted);
    font-size: var(--step-0);
  }

  /* ─── Equipment grid ─── */
  .equip-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  .equip-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-5) var(--space-4);
    border: var(--border);
    background: var(--white);
    cursor: pointer;
    text-align: center;
    transition: background var(--duration-fast);
  }

  .equip-card:hover {
    background: var(--surface);
  }

  .equip-card.selected {
    background: var(--sky-soft);
    border-color: var(--line);
  }

  .equip-card input {
    position: absolute;
    opacity: 0;
  }

  .equip-card span {
    font-size: var(--step-0);
    font-weight: 600;
  }

  /* ─── Goal chips ─── */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .chip {
    cursor: pointer;
  }

  .chip input {
    position: absolute;
    opacity: 0;
  }

  .chip span {
    display: inline-flex;
    min-height: 48px;
    align-items: center;
    border: var(--border);
    background: var(--white);
    padding-inline: var(--space-5);
    font-size: var(--step-0);
    font-weight: 600;
    transition: background var(--duration-fast);
  }

  .chip:hover span {
    background: var(--surface);
  }

  .chip.selected span {
    background: var(--sky);
    border-color: var(--line);
  }

  /* ─── Notes ─── */
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

  /* ─── Summary ─── */
  .summary-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-5);
    background: var(--surface);
    border: var(--border);
  }

  .summary-box__title {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--muted);
    margin: 0;
  }

  .summary-box__row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    font-size: var(--step-0);
    padding-block: var(--space-2);
    border-bottom: var(--border);
  }

  .summary-box__row:last-child {
    border-bottom: 0;
  }

  .summary-box__row span:first-child {
    color: var(--muted);
  }

  .summary-box__row span:last-child {
    font-weight: 700;
  }

  /* ─── Back button ─── */
  .back-btn {
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    font-size: var(--step-1);
    cursor: pointer;
    padding: var(--space-3) var(--space-6);
    min-height: 52px;
    transition: background var(--duration-fast);
  }

  .back-btn:hover {
    background: var(--surface);
  }

  .back-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* ─── Success ─── */
  .success {
    display: grid;
    place-content: center;
    text-align: center;
    gap: var(--space-3);
    min-height: 60vh;
    padding: var(--space-7);
  }

  .success-mark {
    font-size: var(--step-4);
    color: var(--sky-strong);
    line-height: 1;
  }

  .success h2 {
    font-size: var(--step-3);
  }

  .success p {
    color: var(--muted);
    font-size: var(--step-1);
  }

  /* ─── Mobile ─── */
  @media (max-width: 860px) {
    .onboarding {
      grid-template-columns: 1fr;
    }

    .panel--question {
      min-height: 30vh;
      border-block-end: var(--border);
    }

    .panel__inner {
      padding: var(--space-5) clamp(20px, 4vw, 32px);
    }

    .question {
      margin-top: 0;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .question h1 {
      font-size: var(--step-2);
    }

    .equip-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
