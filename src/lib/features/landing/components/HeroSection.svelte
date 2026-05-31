<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes";
  import TrueMarquee from "./TrueMarquee.svelte";

  let {
    openAuthOverlay,
  }: {
    openAuthOverlay?: () => void;
  } = $props();

  const { t } = useI18n();

  const DIFFERENTIATORS = [
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

  const COMPARISON_COLUMNS = ["AnatoMe", "יעל ישראל אונליין", "סטודיו / יוטיוב"];

  const COMPARISON_ROWS = [
    {
      criterion: "פורמט",
      yael: "שיעורי לייב בזום, דרך אפליקציית הסטודיו",
      general: "שיעור פיזי או סרטון חד-כיווני",
      anatome: "לייב בתוך האתר, VOD ושיעור 1:1",
    },
    {
      criterion: "התאמה לגוף",
      yael: "התאמות בזמן שיעור לפי מה שרואים במצלמה",
      general: "בחירה עצמאית לפי רמה או מורה",
      anatome: "אונבורדינג לפי כאב, ציוד ומטרות",
    },
    {
      criterion: "שיקום ופתולוגיות",
      yael: "פילאטיס אונליין עם דגש על תיקון והכוונה",
      general: "תוכן כללי, לא תמיד מותאם לכאב",
      anatome: "גב, דיסק, רצפת אגן, הריון ולידה",
    },
    {
      criterion: "אחרי השיעור",
      yael: "חוזרות לשיעור הבא בלוח",
      general: "מחפשות שוב מה מתאים",
      anatome: "ספרייה, מסלולי המשך ומעקב תרגול",
    },
  ];
</script>

<section class="hero" aria-label="ראשי">
  <div class="hero__stage">
    <div class="hero__title-band">
      <div class="l-shell hero__inner">
        <p class="hero__eyebrow">{t.landing.hero.eyebrow()}</p>

        <h1 class="hero__title l-in">
          {t.landing.hero.headlineBefore()}<span class="hero__accent">{t.landing.hero.headlineAccent()}</span>{t.landing.hero.headlineAfter()}
        </h1>

        <div class="hero__ctas l-in l-in--1">
          <Button.Root
            class="hb-button hb-button--brand hb-button--pill"
            type="button"
            onclick={openAuthOverlay}
            data-analytics="hero-cta-primary"
          >
            {t.landing.hero.ctaPrimary()}
          </Button.Root>
          <Button.Root
            class="hb-button hb-button--paper hb-button--pill"
            href="#about"
            data-analytics="hero-cta-secondary"
          >
            {t.landing.hero.ctaSecondary()}
          </Button.Root>
        </div>
      </div>
    </div>

    <div class="hero__proof" aria-label="AnatoMe מול פתרונות פילאטיס אחרים">
      <div class="hero__comparison">
        <table class="hero__comparison-table">
          <thead>
            <tr>
              <th>מה בודקים</th>
              {#each COMPARISON_COLUMNS as column (column)}
                <th class:hero__comparison-us={column === "AnatoMe"}>{column}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each COMPARISON_ROWS as row (row.criterion)}
              <tr>
                <th scope="row">{row.criterion}</th>
                <td data-label="AnatoMe" class="hero__comparison-us"><strong>{row.anatome}</strong></td>
                <td data-label="יעל ישראל אונליין">{row.yael}</td>
                <td data-label="סטודיו / יוטיוב">{row.general}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <div class="hero__comparison-cards" aria-hidden="true">
          {#each COMPARISON_ROWS as row (row.criterion)}
            <article class="hero__comparison-card">
              <h2>{row.criterion}</h2>
              <dl>
                <div class="hero__comparison-card-us">
                  <dt>AnatoMe</dt>
                  <dd>{row.anatome}</dd>
                </div>
                <div>
                  <dt>יעל ישראל</dt>
                  <dd>{row.yael}</dd>
                </div>
                <div>
                  <dt>סטודיו / יוטיוב</dt>
                  <dd>{row.general}</dd>
                </div>
              </dl>
            </article>
          {/each}
        </div>
      </div>
    </div>

    <div class="hero__marquee" aria-label="יתרונות AnatoMe">
      <TrueMarquee duration={52} pauseOnHover={true}>
        {#each DIFFERENTIATORS as card (card.title)}
          <div class="hero__marquee-card">
            <span class="hero__marquee-card-title">{card.title}</span>
            <span class="hero__marquee-card-desc">{card.desc}</span>
          </div>
        {/each}
      </TrueMarquee>
    </div>
  </div>
</section>
