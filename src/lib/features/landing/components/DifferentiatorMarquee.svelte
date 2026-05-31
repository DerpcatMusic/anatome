<script lang="ts">
  const CARDS = [
    { title: "לא סרטוני יוטיוב", desc: "תוכן מדעי מבוסס אנטומיה — לא ריקודים לרקע מוזיקה" },
    { title: "בלי זום", desc: "לייב דו-כיווני ישירות בפלטפורמה — בלי התקנות" },
    { title: "החיכוך הכי נמוך", desc: "נכנסים מהדפדפן — אין אפליקציות להוריד" },
    { title: "בוגרת מרתה פילאטיס", desc: "מדריכה מוסמכת בשיקום והמכשירים המובילים בישראל" },
    { title: "שיקום רפואי אמיתי", desc: "כאבי גב, פריצת דיסק, רצפת אגן, הריון" },
    { title: "מחיר שפוי", desc: "ניסיון ראשון חינם. מנוי חודשי ללא התחייבות" },
    { title: "בבית שלך, בקצב שלך", desc: "מאות שיעורים מוקלטים זמינים 24/7" },
    { title: "תיקון תנוחות בזמן אמת", desc: "בלייב המדריכה רואה אותך ומתקנת — כמו בסטודיו" },
    { title: "התאמה אישית מלאה", desc: "אונבורדינג לפי כאבים, ציוד ומטרות" },
    { title: "מסלולים מובנים", desc: "לא מתחילות מחדש — תרגילי המשך, מעקב התקדמות" },
  ];

  /* Quadruple for seamless loop on all screen widths */
  const LOOP = [...CARDS, ...CARDS, ...CARDS, ...CARDS];
</script>

<div class="diff-marquee" aria-label="למה דווקא AnatoMe">
  <div class="diff-marquee__track">
    <div class="diff-marquee__rail">
      {#each LOOP as card, i (`${card.title}-${i}`)}
        <div class="diff-marquee__card">
          <span class="diff-marquee__title">{card.title}</span>
          <span class="diff-marquee__desc">{card.desc}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .diff-marquee {
    --dm-orange: oklch(60% 0.24 55);
    --dm-card-bg: oklch(98% 0.005 60 / 0.14);
    --dm-card-border: oklch(98% 0.005 60 / 0.25);
    --dm-text: oklch(99% 0.008 95);
    --dm-text-soft: oklch(96% 0.01 90 / 0.88);

    background: var(--dm-orange);
    padding-block: clamp(0.5rem, 1.2vh, 0.875rem);
    overflow: hidden;
  }

  .diff-marquee__track {
    width: 100%;
    overflow: hidden;
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 3%,
      black 97%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 3%,
      black 97%,
      transparent 100%
    );
  }

  .diff-marquee__rail {
    display: flex;
    gap: 0.625rem;
    width: max-content;
    animation: diff-marquee-scroll 50s linear infinite;
    will-change: transform;
  }

  .diff-marquee:hover .diff-marquee__rail {
    animation-play-state: paused;
  }

  @keyframes diff-marquee-scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .diff-marquee__card {
    flex: 0 0 auto;
    width: clamp(220px, 18vw, 280px);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-xl, 0.875rem);
    background: var(--dm-card-bg);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border: 1px solid var(--dm-card-border);
    text-align: start;
    transition: transform 0.2s ease, background 0.2s ease;
    cursor: default;
  }

  .diff-marquee__card:hover {
    transform: translateY(-2px);
    background: oklch(98% 0.005 60 / 0.2);
  }

  .diff-marquee__title {
    font-family: var(--font-display, "Secular One", system-ui, sans-serif);
    font-size: clamp(0.82rem, 1vw, 0.94rem);
    font-weight: 600;
    line-height: 1.25;
    color: var(--dm-text);
  }

  .diff-marquee__desc {
    font-family: var(--font-body, "Assistant", system-ui, sans-serif);
    font-size: clamp(0.7rem, 0.85vw, 0.8rem);
    font-weight: 400;
    line-height: 1.45;
    color: var(--dm-text-soft);
  }

  @media (prefers-reduced-motion: reduce) {
    .diff-marquee__rail {
      animation: none;
    }
    .diff-marquee__card:hover {
      transform: none;
    }
  }
</style>
