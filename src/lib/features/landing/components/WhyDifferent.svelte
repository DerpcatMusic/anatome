<script lang="ts">
  /**
   * YouTube vs AnatoMe comparison table.
   * Positioned after the orange differentiator marquee.
   */
</script>

<section class="l-panel l-section section--why-different" aria-label="AnatoMe מול סרטוני פילאטיס ביוטיוב">
  <div class="l-shell">
    <div class="why-different l-in">
      <h2 class="why-different__title">AnatoMe מול סרטוני פילאטיס ביוטיוב</h2>

      <div class="vs-table-wrap">
        <table class="vs-table">
          <thead>
            <tr>
              <th>קריטריון</th>
              <th>סרטוני YouTube</th>
              <th>AnatoMe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>בסיס מדעי</td>
              <td>לרוב אין — ריקודים ותרגילים אקראיים</td>
              <td><strong>כל שיעור מבוסס אנטומיה ושיקום</strong></td>
            </tr>
            <tr>
              <td>התאמה אישית</td>
              <td>אין — אותו סרטון לכולן</td>
              <td><strong>אונבורדינג, סינון לפי כאבים וציוד</strong></td>
            </tr>
            <tr>
              <td>תיקון תנוחות</td>
              <td>אין — את לבד מול המסך</td>
              <td><strong>לייב דו-כיווני עם תיקון בזמן אמת</strong></td>
            </tr>
            <tr>
              <td>שיקום רפואי</td>
              <td>מסוכן — בלי ידע בפתולוגיות</td>
              <td><strong>מדריכה מוסמכת בשיקום, מרתה פילאטיס</strong></td>
            </tr>
            <tr>
              <td>מעקב והתקדמות</td>
              <td>אין — מתחילות מחדש כל פעם</td>
              <td><strong>מסלולים מובנים, תרגילי המשך, 1:1</strong></td>
            </tr>
            <tr>
              <td>מחיר</td>
              <td>"חינם" — אבל בלי ערך מקצועי</td>
              <td><strong>משתלם — תוכן פרימיום במחיר נגיש</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<style>
  .section--why-different {
    background: var(--primary);
    color: var(--primary-foreground);
    padding-block: 4rem;
  }
  .why-different {
    max-width: 960px;
    margin-inline: auto;
  }
  .why-different__title {
    font-size: 1.875rem;
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
    margin-bottom: 2.5rem;
    color: var(--primary-foreground);
  }
  .vs-table-wrap {
    overflow-x: auto;
  }
  .vs-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 1rem;
    line-height: 1.5;
  }
  .vs-table th,
  .vs-table td {
    padding: 0.875rem 1rem;
    text-align: right;
    border-bottom: 1px solid color-mix(in oklch, var(--primary-foreground) 18%, transparent);
  }
  .vs-table th {
    font-weight: 600;
    color: var(--primary-foreground);
    background: color-mix(in oklch, var(--primary-foreground) 8%, transparent);
  }
  .vs-table td {
    color: color-mix(in oklch, var(--primary-foreground) 78%, transparent);
  }
  .vs-table td:first-child {
    font-weight: 600;
    color: var(--primary-foreground);
    white-space: nowrap;
  }
  .vs-table td:last-child strong {
    color: color-mix(in oklch, var(--primary-foreground) 92%, oklch(70% 0.12 135));
  }
</style>
