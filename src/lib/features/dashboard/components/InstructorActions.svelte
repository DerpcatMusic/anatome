<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";


  const { t } = useI18n();
</script>

<div class="instructor-actions">
  <a class="action-card" href="/i/calendar">
    <span class="action-card__num">01</span>
    <h3>{t.dashboard.actions.studioLive.title()}</h3>
    <p>{t.dashboard.actions.studioLive.desc()}</p>
  </a>
  <a class="action-card" href="/i/videos">
    <span class="action-card__num">02</span>
    <h3>{t.dashboard.actions.videos.title()}</h3>
    <p>{t.dashboard.actions.videos.desc()}</p>
  </a>
  <a class="action-card" href="/u/calendar">
    <span class="action-card__num">03</span>
    <h3>{t.dashboard.actions.calendar.title()}</h3>
    <p>{t.dashboard.actions.calendar.desc()}</p>
  </a>
</div>

<style>
  .instructor-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-4);
  }

  .action-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    border: var(--border);
    background: var(--elevated);
    padding: var(--space-6);
    text-decoration: none;
    color: var(--ink);
    will-change: transform, box-shadow, border-radius, background;
    transition:
      background var(--duration-fast) var(--ease-out),
      transform 0.3s var(--ease-elastic),
      box-shadow 0.3s var(--ease-elastic),
      border-radius 0.4s var(--ease-elastic);
  }

  .action-card:hover {
    background: var(--accent-soft);
    transform: translate(-3px, -3px);
    box-shadow: 4px 4px 0 var(--ink);
    border-radius: 8px;
  }

  .action-card__num {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--primary);
    font-weight: 700;
  }

  .action-card h3 {
    font-size: var(--step-1);
    margin: 0;
    line-height: 1.2;
  }

  .action-card p {
    color: var(--foreground-muted);
    margin: 0;
    line-height: 1.5;
  }
</style>
