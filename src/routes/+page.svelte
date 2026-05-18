<script lang="ts">
  import AuthPanel from "../components/auth/AuthPanel.svelte";

  function openAuthOverlay() {
    const overlay = document.getElementById("auth-overlay");
    if (overlay) {
      overlay.classList.add("is-open");
      setTimeout(() => overlay.querySelector("input")?.focus(), 100);
    }
  }
</script>

<svelte:head>
  <title>HomeBody | פילאטיס שיקומי בבית</title>
  <meta name="description" content="פילאטיס אונליין בעברית — שיעורים חיים, מוקלטים ופרטיים. התמחות בפטולוגיות ופילאטיס שיקומי. למדתי אצל מרתה פילאטיס." />
  <meta property="og:title" content="HomeBody | פילאטיס שיקומי בבית" />
  <meta property="og:description" content="פילאטיס אונליין בעברית — שיעורים חיים, מוקלטים ופרטיים. התמחות בפטולוגיות ופילאטיס שיקומי." />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="he_IL" />
</svelte:head>

<main class="landing">
  <!-- ===== HERO ===== -->
  <section class="hero" aria-label="ראשי">
    <div class="hero__inner">
      <p class="eyebrow">HomeBody — פילאטיס שיקומי בבית</p>
      <h1>גוף אמיתי.<br>תנועה אמיתית.</h1>
      <p class="lead">
        פילאטיס אונליין בעברית, לגוף עם כאבים, מגבלות ורצון לחזור לתנועה. שיעורים חיים, מוקלטים ופרטיים — עם התמחות בפטולוגיות.
      </p>
      <div class="actions">
        <button class="btn btn--ink" onclick={openAuthOverlay}>
          שיעור ראשון בחינם
        </button>
        <a class="btn btn--paper" href="#content">
          גלי איך זה עובד
        </a>
      </div>
    </div>
  </section>

  <!-- ===== PAIN POINTS ===== -->
  <section id="content" class="content-section section--pain" aria-label="למה השאר לא עובדים">
    <div class="section-header">
      <span class="section-tag">THE PROBLEM</span>
      <h2>למה שיעורים רגילים לא עובדים</h2>
    </div>
    <div class="pain-grid">
      <div class="pain-item"><span class="pain-x">✕</span><span>נדרשת הרשמה מראש</span></div>
      <div class="pain-item"><span class="pain-x">✕</span><span>שיעורים של 60–75 דקות</span></div>
      <div class="pain-item"><span class="pain-x">✕</span><span>צריך לנהוג לשם</span></div>
      <div class="pain-item"><span class="pain-x">✕</span><span>רשימת המתנה</span></div>
      <div class="pain-item"><span class="pain-x">✕</span><span>קוד לבוש</span></div>
      <div class="pain-item"><span class="pain-x">✕</span><span>מרגישה לא בנוח כי את חדשה</span></div>
      <div class="pain-item"><span class="pain-x">✕</span><span>קצב שלהם, לא שלך</span></div>
      <div class="pain-item"><span class="pain-x">✕</span><span>לא מתאימים לכאבים או מגבלות</span></div>
    </div>
  </section>

  <!-- ===== THREE PILLARS ===== -->
  <section class="content-section section--pillars" aria-label="השלושה יסודות">
    <div class="section-header section-header--center">
      <span class="section-tag">WHAT YOU GET</span>
      <h2>שלוש דרכים לזוז</h2>
    </div>
    <div class="pillars-grid">
      <article class="pillar">
        <span class="pillar-num">01</span>
        <h3>מוקלטים</h3>
        <p class="pillar-lead">15, 30, 45 דקות. לפי הקצב שלך.</p>
        <p class="pillar-body">מאות שיעורים בכל רמה. עם גרפיקת פטולוגיה שמסבירה בדיוק איזו שריר או עצם כל תרגיל מחזק. אין לוח זמנים נוקשה. אין אשמה על פספוס.</p>
      </article>
      <article class="pillar">
        <span class="pillar-num">02</span>
        <h3>חיים</h3>
        <p class="pillar-lead">עד 12 משתתפים. תיקון בזמן אמת.</p>
        <p class="pillar-body">שיעורים חיים בקבוצות קטנות. המדריכה רואה את כולם, מתקנת בזמן אמת, ויוצרת תחושת סטודיו — רק מהספה. קהילה ישראלית אמיתית.</p>
      </article>
      <article class="pillar">
        <span class="pillar-num">03</span>
        <h3>פרטי</h3>
        <p class="pillar-lead">אחד על אחד. התאמה מלאה.</p>
        <p class="pillar-body">שיעור פרטי אונליין עם התאמה מלאה לגוף שלך, לכאבים שלך, למטרות שלך. ליווי אישי ותכנית עבודה מותאמת — בנוי רק בשבילך.</p>
      </article>
    </div>
  </section>

  <!-- ===== PATHOLOGY GRAPHICS ===== -->
  <section class="content-section section--feature" aria-label="גרפיקת פטולוגיה">
    <div class="feature-split">
      <div class="feature-text">
        <span class="section-tag">UNIQUE</span>
        <h2>תראי בדיוק מה כל תרגיל עושה לגוף שלך</h2>
        <p class="feature-lead">
          כל שיעור מוקלט מלווה בגרפיקה אנטומית שמראה בדיוק איזו שריר מופעל, איזו עצמה תומכת, ואיך התנועה עוזרת לפתולוגיה שלך.
        </p>
        <p class="feature-body">
          לא צריך לנחש. לא צריך לדע אנטומיה. פשוט רואים את החץ על השריר, קוראים את ההסבר, ויודעים בדיוק למה את עושה את זה.
        </p>
      </div>
      <div class="feature-visual">
        <div class="anatomy-demo">
          <div class="anatomy-figure">
            <div class="anatomy-bone anatomy-bone--femur"></div>
            <div class="anatomy-muscle anatomy-muscle--quad"></div>
            <div class="anatomy-dot anatomy-dot--a"></div>
            <div class="anatomy-dot anatomy-dot--b"></div>
            <div class="anatomy-line anatomy-line--a"></div>
            <div class="anatomy-line anatomy-line--b"></div>
            <div class="anatomy-tag anatomy-tag--muscle">שריר הירך</div>
            <div class="anatomy-tag anatomy-tag--bone">עצם הירך</div>
          </div>
          <div class="anatomy-caption">דוגמה לגרפיקה בשיעור</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== CREDENTIALS ===== -->
  <section class="content-section section--creds" aria-label="הסמכות">
    <div class="creds-inner">
      <span class="section-tag">LINEAGE</span>
      <blockquote class="creds-quote">
        למדתי אצל מרתה פילאטיס.
      </blockquote>
      <p class="creds-body">
        השיטה שלי מבוססת על ירושה ישירה של שיטת פילאטיס הקלאסית, עם התמחות עמוקה בפתולוגיות ושיקום. לא "תעשי איתי" מיוטיוב — אלא הבנה אנטומית מדויקת של הגוף שלך.
      </p>
    </div>
  </section>

  <!-- ===== HOW IT WORKS ===== -->
  <section class="content-section section--steps" aria-label="איך זה עובד">
    <div class="section-header section-header--center">
      <span class="section-tag">HOW IT WORKS</span>
      <h2>שלוש צעדים ואת בתוכנית</h2>
    </div>
    <div class="steps-grid">
      <div class="step">
        <span class="step-num">01</span>
        <h3>נרשמת בחינם</h3>
        <p>שיעור ראשון בחינם, בלי כרטיס אשראי, בלי התחייבות.</p>
      </div>
      <div class="step">
        <span class="step-num">02</span>
        <h3>בוחרת את הנתיב שלך</h3>
        <p>מוקלטים לבד, לייב בקבוצה, או שיעור פרטי — לפי הרמה והנוחות שלך.</p>
      </div>
      <div class="step">
        <span class="step-num">03</span>
        <h3>מתחילה לזוז</h3>
        <p>לוחצת play ומתחילה. עם תמיכה, קהילה, וגרפיקה שמלמדת אותך בדרך.</p>
      </div>
    </div>
  </section>

  <!-- ===== TESTIMONIALS ===== -->
  <section class="content-section section--testimonials" aria-label="מה אומרים עלינו">
    <div class="section-header">
      <span class="section-tag">TESTIMONIALS</span>
      <h2>מה הקהילה אומרת</h2>
    </div>
    <div class="testimonials-grid">
      <blockquote class="testimonial">
        <p>"אחרי שנים של כאבי גב, סוף סוף מצאתי מקום שמבין אותי. השיעורים השיקומיים הצילו אותי."</p>
        <footer>— רוני, 42, תל אביב</footer>
      </blockquote>
      <blockquote class="testimonial">
        <p>"הגרפיקה של השרירים עוזרת לי להבין בדיוק מה אני עושה. פעם ראשונה שאני לא מרגישה אבודה בשיעור פילאטיס."</p>
        <footer>— מיכל, 35, חיפה</footer>
      </blockquote>
      <blockquote class="testimonial">
        <p>"השיעורים הפרטיים שינו לי את החיים. התאמה אישית, הקשבה אמיתית, ותוצאות שאני מרגישה."</p>
        <footer>— שרה, 51, ירושלים</footer>
      </blockquote>
    </div>
  </section>

  <!-- ===== FAQ ===== -->
  <section class="content-section section--faq" aria-label="שאלות נפוצות">
    <div class="section-header">
      <span class="section-tag">FAQ</span>
      <h2>שאלות נפוצות</h2>
    </div>
    <div class="faq-list">
      <details class="faq-item">
        <summary>אני מתחילה לגמרי — זה מתאים לי?</summary>
        <p>לגמרי. יש שיעורי מבוא, ניווט ברמות, והתאמה לכל רמה פיזית. ואם צריך — תמיד אפשר שיעור פרטי.</p>
      </details>
      <details class="faq-item">
        <summary>האם השיעורים מתאימים לכאבי גב / דיסק / כתף קפואה?</summary>
        <p>כן. זה בדיוק התמחות שלנו. כל שיעור מלווה בהסברים על איזה תרגיל מתאים לאיזו פתולוגיה, ומה לעשות אם משהו כואב.</p>
      </details>
      <details class="faq-item">
        <summary>איזה ציוד אני צריכה?</summary>
        <p>רק מזרן. אין צורך בציוד מקצועי או בסטודיו יקר. חלק מהשיעורים משתמשים בחפצים פשוטים מהבית.</p>
      </details>
      <details class="faq-item">
        <summary>מה ההבדל בין מוקלט ללייב?</summary>
        <p>מוקלט — צופים בזמן שלך, 15/30/45 דקות. לייב — שיעור קבוצתי בזמן אמת עם תיקונים אישיים. למי שרוצה אנרגיה של קבוצה.</p>
      </details>
      <details class="faq-item">
        <summary>איך עובד השיעור הפרטי?</summary>
        <p>תואמים זמן, מתחברים בווידאו, והמדריכה בונה שיעור מותאם אישית לגוף ולמטרות שלך.</p>
      </details>
    </div>
  </section>

  <!-- ===== FINAL CTA ===== -->
  <section class="content-section section--final-cta" aria-label="התחילי עכשיו">
    <div class="final-cta-inner">
      <h2>גוף אמיתי.<br>תנועה אמיתית.</h2>
      <p>השיעור הראשון בחינם. בלי כרטיס אשראי. בלי סיפורים.</p>
      <button class="btn btn--ink btn--xl" onclick={openAuthOverlay}>
        תני לי את השיעור הראשון
      </button>
      <p class="final-cta-note">HomeBody — פילאטיס שיקומי בבית, בעברית, עם קהילה.</p>
    </div>
  </section>
</main>

<div id="auth-overlay" class="auth-overlay" role="button" tabindex="-1"
  onclick={(e) => { if(e.target === e.currentTarget) e.currentTarget.classList.remove('is-open'); }}
  onkeydown={(e) => { if(e.key === 'Escape') e.currentTarget.classList.remove('is-open'); }}
>
  <div class="auth-card" role="dialog" aria-modal="true" aria-label="כניסה והרשמה">
    <AuthPanel />
  </div>
</div>

<style>
  /* ═══════════════════════════════════════════
     LANDING PAGE — HARD EDGES, NO STICKY, NO FLUFF
     ═══════════════════════════════════════════ */

  .landing {
    display: flex;
    flex-direction: column;
  }

  /* ─── HERO ─── */
  .hero {
    position: relative;
    min-height: calc(100vh - 56px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(48px, 8vw, 100px) clamp(24px, 5vw, 80px);
    border-bottom: var(--border);
    background-color: var(--paper);
    background-image:
      radial-gradient(ellipse 80% 60% at 15% 25%, color-mix(in srgb, var(--sky) 40%, transparent), transparent 55%),
      radial-gradient(ellipse 60% 80% at 85% 75%, color-mix(in srgb, var(--beige) 45%, transparent), transparent 50%);
    background-size: 150% 150%;
    animation: mesh-drift-hero 18s ease-in-out infinite alternate;
  }

  @keyframes mesh-drift-hero {
    0% { background-position: 0% 0%, 100% 100%; }
    50% { background-position: 12% 8%, 88% 92%; }
    100% { background-position: 8% 15%, 92% 85%; }
  }

  .hero__inner {
    max-width: 900px;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: var(--space-5);
  }

  .hero h1 {
    font-size: var(--step-4);
    line-height: 0.95;
    letter-spacing: -0.03em;
    margin: 0 0 var(--space-6);
    font-weight: 800;
  }

  .lead {
    font-size: var(--step-1);
    color: var(--muted);
    line-height: 1.6;
    max-width: 44ch;
    margin: 0 0 var(--space-7);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .btn {
    display: inline-flex;
    min-height: 56px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    padding-inline: var(--space-7);
    background: var(--white);
    color: var(--ink);
    font-weight: 700;
    font-size: var(--step-0);
    cursor: pointer;
    font-family: inherit;
    text-decoration: none;
    transition: background var(--duration-fast);
  }

  .btn:hover {
    background: var(--surface);
  }

  .btn--ink {
    background: var(--ink);
    color: var(--white);
    border-color: var(--ink);
  }

  .btn--ink:hover {
    background: var(--ink-secondary);
  }

  .btn--paper {
    background: rgba(255, 255, 255, 0.6);
    color: var(--ink);
    backdrop-filter: blur(4px);
  }

  .btn--paper:hover {
    background: var(--white);
  }

  .btn--xl {
    min-height: 64px;
    padding-inline: var(--space-8);
    font-size: var(--step-1);
  }

  /* ─── CONTENT SECTIONS ─── */
  .content-section {
    border-top: var(--border);
    padding: clamp(72px, 10vw, 140px) clamp(24px, 5vw, 80px);
    background: var(--white);
  }

  .content-section:first-of-type {
    border-top: 0;
  }

  .section-header {
    margin-bottom: clamp(40px, 5vw, 64px);
  }

  .section-header--center {
    text-align: center;
  }

  .section-header--center h2 {
    max-width: 24ch;
    margin-inline: auto;
  }

  .section-tag {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--sky-strong);
    font-weight: 700;
    display: block;
    margin-bottom: var(--space-4);
  }

  .content-section h2 {
    font-size: var(--step-3);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0;
    font-weight: 700;
  }

  /* ─── PAIN POINTS ─── */
  .pain-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: var(--border);
  }

  .pain-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    border-bottom: var(--border);
    border-left: var(--border);
    font-size: var(--step-0);
    font-weight: 600;
  }

  .pain-item:nth-last-child(-n+2) {
    border-bottom: 0;
  }

  .pain-x {
    font-family: var(--font-mono);
    color: var(--danger);
    font-weight: 700;
    font-size: var(--step-1);
    flex-shrink: 0;
    line-height: 1;
  }

  /* ─── THREE PILLARS ─── */
  .pillars-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .pillar {
    border-top: var(--border);
    padding-top: var(--space-5);
  }

  .pillar-num {
    font-family: var(--font-mono);
    font-size: var(--step-1);
    color: var(--sky-strong);
    font-weight: 700;
    display: block;
    margin-bottom: var(--space-4);
  }

  .pillar h3 {
    font-size: var(--step-2);
    line-height: 1.1;
    margin-bottom: var(--space-3);
    font-weight: 700;
  }

  .pillar-lead {
    font-size: var(--step-1);
    color: var(--ink);
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: var(--space-3);
  }

  .pillar-body {
    font-size: var(--step-0);
    color: var(--muted);
    line-height: 1.6;
  }

  /* ─── FEATURE SPLIT ─── */
  .feature-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(40px, 6vw, 80px);
    align-items: center;
  }

  .feature-text h2 {
    max-width: 18ch;
    margin-bottom: var(--space-5);
  }

  .feature-lead {
    font-size: var(--step-1);
    color: var(--ink);
    line-height: 1.5;
    max-width: 44ch;
    margin: 0 0 var(--space-4);
    font-weight: 600;
  }

  .feature-body {
    font-size: var(--step-0);
    color: var(--muted);
    line-height: 1.6;
    max-width: 46ch;
    margin: 0;
  }

  .feature-visual {
    display: flex;
    justify-content: center;
  }

  /* ─── ANATOMY DEMO ─── */
  .anatomy-demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
  }

  .anatomy-figure {
    width: 260px;
    height: 320px;
    border: var(--border);
    background: var(--white);
    position: relative;
    overflow: hidden;
  }

  .anatomy-bone {
    position: absolute;
    background: var(--ink);
  }

  .anatomy-bone--femur {
    width: 16px;
    height: 140px;
    left: 50%;
    top: 60px;
    transform: translateX(-50%);
  }

  .anatomy-muscle {
    position: absolute;
    background: var(--sky);
    opacity: 0.7;
  }

  .anatomy-muscle--quad {
    width: 48px;
    height: 100px;
    left: 50%;
    top: 70px;
    transform: translateX(-50%);
  }

  .anatomy-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--danger);
    border-radius: 50%;
  }

  .anatomy-dot--a {
    left: 65%;
    top: 100px;
  }

  .anatomy-dot--b {
    left: 38%;
    top: 140px;
  }

  .anatomy-line {
    position: absolute;
    height: 1px;
    background: var(--ink);
    transform-origin: left center;
  }

  .anatomy-line--a {
    width: 60px;
    left: calc(65% + 8px);
    top: 104px;
  }

  .anatomy-line--b {
    width: 50px;
    left: calc(38% + 8px);
    top: 144px;
  }

  .anatomy-tag {
    position: absolute;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    letter-spacing: 0.05em;
    background: var(--white);
    padding: 2px 6px;
    border: var(--border);
    white-space: nowrap;
  }

  .anatomy-tag--muscle {
    left: calc(65% + 68px);
    top: 96px;
  }

  .anatomy-tag--bone {
    left: calc(38% + 58px);
    top: 136px;
  }

  .anatomy-caption {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  /* ─── CREDENTIALS ─── */
  .section--creds {
    background-color: var(--paper);
    background-image:
      radial-gradient(ellipse 70% 50% at 20% 30%, color-mix(in srgb, var(--sky) 32%, transparent), transparent 55%),
      radial-gradient(ellipse 50% 70% at 80% 70%, color-mix(in srgb, var(--beige) 38%, transparent), transparent 50%);
    background-size: 150% 150%;
  }

  .creds-inner {
    max-width: 800px;
  }

  .creds-quote {
    font-size: clamp(2.4rem, 5vw, 4.5rem);
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 var(--space-5);
    padding: 0;
    border: 0;
  }

  .creds-body {
    font-size: var(--step-1);
    color: var(--muted);
    line-height: 1.6;
    max-width: 50ch;
  }

  /* ─── STEPS ─── */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
  }

  .step {
    border-top: var(--border);
    padding: var(--space-5) var(--space-6);
  }

  .step:not(:last-child) {
    border-left: var(--border);
  }

  .step-num {
    font-family: var(--font-mono);
    font-size: var(--step-1);
    color: var(--sky-strong);
    font-weight: 700;
    display: block;
    margin-bottom: var(--space-4);
  }

  .step h3 {
    font-size: var(--step-2);
    line-height: 1.1;
    margin-bottom: var(--space-3);
    font-weight: 700;
  }

  .step p {
    color: var(--muted);
    font-size: var(--step-0);
    line-height: 1.6;
    max-width: 34ch;
  }

  /* ─── TESTIMONIALS ─── */
  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .testimonial {
    border-top: 3px solid var(--sky);
    padding-top: var(--space-5);
    margin: 0;
  }

  .testimonial p {
    font-size: var(--step-1);
    line-height: 1.5;
    margin-bottom: var(--space-4);
    font-weight: 600;
  }

  .testimonial footer {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
  }

  /* ─── FAQ ─── */
  .faq-list {
    border-top: var(--border);
    max-width: 800px;
  }

  .faq-item {
    border-bottom: var(--border);
  }

  .faq-item summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-5) 0;
    font-size: var(--step-1);
    font-weight: 700;
    cursor: pointer;
    list-style: none;
    gap: var(--space-4);
  }

  .faq-item summary::-webkit-details-marker {
    display: none;
  }

  .faq-item summary::after {
    content: '+';
    font-family: var(--font-mono);
    font-size: var(--step-2);
    font-weight: 400;
    line-height: 1;
    flex-shrink: 0;
  }

  .faq-item[open] summary::after {
    content: '×';
  }

  .faq-item p {
    padding-bottom: var(--space-5);
    color: var(--muted);
    max-width: 60ch;
    font-size: var(--step-0);
    line-height: 1.6;
  }

  /* ─── FINAL CTA ─── */
  .section--final-cta {
    background: var(--ink);
    color: var(--white);
    border-top: var(--border);
    text-align: center;
  }

  .final-cta-inner {
    max-width: 700px;
    margin: 0 auto;
  }

  .section--final-cta h2 {
    color: var(--white);
    margin-bottom: var(--space-4);
  }

  .section--final-cta p {
    color: var(--line-light);
    margin-bottom: var(--space-7);
    font-size: var(--step-1);
  }

  .final-cta-note {
    margin-top: var(--space-6);
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
  }

  /* ─── AUTH OVERLAY ─── */
  .auth-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    background: rgba(10, 10, 10, 0.45);
    padding: var(--space-5);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  :global(.auth-overlay.is-open) {
    opacity: 1;
    pointer-events: auto;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    background: var(--white);
    padding: var(--space-6);
    border: var(--border);
    transform: translateY(8px);
    transition: transform 0.2s;
  }

  :global(.auth-overlay.is-open .auth-card) {
    transform: translateY(0);
  }

  /* ─── MOBILE ─── */
  @media (max-width: 860px) {
    .hero h1 {
      font-size: clamp(2.8rem, 10vw, 4.5rem);
    }

    .pain-grid {
      grid-template-columns: 1fr;
    }

    .pain-item:nth-last-child(-n+2) {
      border-bottom: var(--border);
    }

    .pain-item:last-child {
      border-bottom: 0;
    }

    .pain-item {
      border-left: 0;
    }

    .pillars-grid {
      grid-template-columns: 1fr;
    }

    .feature-split {
      grid-template-columns: 1fr;
    }

    .feature-visual {
      order: -1;
    }

    .steps-grid {
      grid-template-columns: 1fr;
    }

    .step:not(:last-child) {
      border-left: 0;
    }

    .testimonials-grid {
      grid-template-columns: 1fr;
    }

    .creds-quote {
      font-size: clamp(2rem, 8vw, 3rem);
    }
  }

  @media (max-width: 520px) {
    .actions {
      display: grid;
    }

    .btn {
      width: 100%;
    }

    .auth-card {
      padding: var(--space-5);
    }

    .content-section {
      padding: var(--space-8) clamp(20px, 4vw, 32px);
    }

    .step {
      padding: var(--space-5) 0;
    }
  }
</style>
