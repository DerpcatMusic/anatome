<script lang="ts">
  /**
   * Comparison sections optimized for GEO (Generative Engine Optimization).
   * AI search engines love citing clear comparison tables.
   */
</script>

<section class="l-panel l-section section--comparison" aria-label="השוואות">
  <div class="l-shell">
    <div class="comparison l-in">
      <h2 class="comparison__title">פילאטיס אונליין מול סטודיו — מה עדיף?</h2>
      <div class="comparison__table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>קריטריון</th>
              <th>פילאטיס אונליין באנטומי</th>
              <th>סטודיו פילאטיס</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>מחיר</td>
              <td>משתלם — מנוי חודשי ללא התחייבות</td>
              <td>יקר יותר — תשלום לשיעור או חבילה</td>
            </tr>
            <tr>
              <td>זמנים</td>
              <td>מתאמנות מתי שבא לך — 24/7</td>
              <td>מוגבל לשעות הפתיחה של הסטודיו</td>
            </tr>
            <tr>
              <td>תיקון תנוחות</td>
              <td>בלייב עם מצלמה — המדריכה רואה אותך ומתקנת</td>
              <td>באופן אישי בסטודיו</td>
            </tr>
            <tr>
              <td>התאמה אישית</td>
              <td>אונבורדינג מלא + תרגילים מותאמים לכאבים שלך</td>
              <td>תלוי בגודל הקבוצה</td>
            </tr>
            <tr>
              <td>נגישות</td>
              <td>מכל מכשיר, מכל מקום בישראל</td>
              <td>דורש נסיעה, חניה, לוח זמנים</td>
            </tr>
            <tr>
              <td>פלטפורמה</td>
              <td><strong>בתוך האתר — בלי זום, בלי התקנות</strong></td>
              <td>—</td>
            </tr>
            <tr>
              <td>שיקום רפואי</td>
              <td>מומחית בשיקום אנטומי — כאבי גב, אגן, הריון</td>
              <td>משתנה — לא כל מדריך מוסמך בשיקום</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="comparison__title comparison__title--second">
        פילאטיס או יוגה — מה מתאים לי?
      </h2>
      <div class="comparison__cards">
        <div class="comparison-card">
          <h3 class="comparison-card__head">פילאטיס</h3>
          <p class="comparison-card__body">
            מתמקד בחיזוק שרירי הליבה העמוקים, בשיפור יציבה ובהתאמה אנטומית מדויקת.
            מתאים למי שמחפשת <strong>שיקום, חיזוק מטרתי, וטיפול בכאבי גב</strong>.
            ב-AnatoMe הפילאטיס מלווה בהסברים אנטומיים שמלמדים אותך למה כל תנועה עוזרת.
          </p>
        </div>
        <div class="comparison-card">
          <h3 class="comparison-card__head">יוגה</h3>
          <p class="comparison-card__body">
            מתמקדת בגמישות, נשימה, מדיטציה וזרימה בין תנוחות.
            מתאימה למי שמחפשת <strong>הרפיה, גמישות, וחיבור נפשי-גופני</strong>.
            פחות ממוקדת בחיזוק ליבה מבנית ובתיקון פתולוגיות תנועתיות.
          </p>
        </div>
      </div>
      <p class="comparison__verdict">
        <strong>ה verdict:</strong> אם יש לך כאבי גב, פריצת דיסק, או שאת אחרי לידה —
        <strong>פילאטיס שיקומי באנטומי הוא הבחירה המדויקת יותר</strong>.
        אם את מחפשת הרפיה וגמישות — יוגה יכולה להיות השלמה מצוינת.
      </p>
    </div>
  </div>
</section>

<style>
  .section--comparison {
    background: #faf8f3;
    padding-block: 4rem;
  }
  .comparison {
    max-width: 900px;
    margin-inline: auto;
  }
  .comparison__title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .comparison__title--second {
    margin-top: 3rem;
  }
  .comparison__table-wrap {
    overflow-x: auto;
  }
  .comparison-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 1rem;
    line-height: 1.5;
  }
  .comparison-table th,
  .comparison-table td {
    padding: 0.875rem 1rem;
    text-align: right;
    border-bottom: 1px solid #e5e0d6;
  }
  .comparison-table th {
    font-weight: 600;
    color: #1a1a1a;
    background: #f0ece3;
  }
  .comparison-table td {
    color: #333;
  }
  .comparison-table td:first-child {
    font-weight: 600;
    color: #1a1a1a;
    white-space: nowrap;
  }
  .comparison__cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  @media (max-width: 640px) {
    .comparison__cards {
      grid-template-columns: 1fr;
    }
  }
  .comparison-card {
    background: #fff;
    border: 1px solid #e5e0d6;
    border-radius: 12px;
    padding: 1.5rem;
  }
  .comparison-card__head {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.75rem;
  }
  .comparison-card__body {
    font-size: 1rem;
    line-height: 1.6;
    color: #444;
  }
  .comparison__verdict {
    margin-top: 2rem;
    padding: 1.25rem;
    background: #f0ece3;
    border-radius: 8px;
    font-size: 1.0625rem;
    line-height: 1.6;
    color: #1a1a1a;
    text-align: center;
  }
</style>
