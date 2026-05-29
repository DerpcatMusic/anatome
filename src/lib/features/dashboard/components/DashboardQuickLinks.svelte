<script lang="ts">
  import { routePath } from "$lib/i18n/context";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import "../dashboard.css";

  const { t } = useI18n();

  const links = [
    { href: routePath("library"), icon: "play_lesson", label: () => t.dashboard.nav.video() },
    { href: routePath("uCalendar"), icon: "calendar_month", label: () => t.dashboard.nav.lives() },
    { href: routePath("uOneOnOne"), icon: "person", label: () => t.dashboard.member.quickOneOnOne() },
  ];
</script>

<nav class="dashboard-quick" aria-label={t.dashboard.member.quickLinksAria()}>
  <ul class="dashboard-quick__list">
    {#each links as link (link.href)}
      <li>
        <a class="dashboard-quick__link" href={link.href}>
          <span class="material-symbols-rounded dashboard-quick__icon" aria-hidden="true">{link.icon}</span>
          <span class="dashboard-quick__label">{link.label()}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .dashboard-quick {
    min-width: 0;
  }

  .dashboard-quick__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-2);
  }

  .dashboard-quick__link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    min-height: 4.5rem;
    padding: var(--space-3) var(--space-2);
    border: var(--border);
    border-radius: var(--radius-md);
    background: var(--elevated);
    text-decoration: none;
    color: inherit;
    text-align: center;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .dashboard-quick__link:hover {
    background: color-mix(in oklch, var(--accent) 10%, var(--elevated));
  }

  .dashboard-quick__link:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .dashboard-quick__icon {
    --icon-size: 1.5rem;
    color: var(--primary);
  }

  .dashboard-quick__label {
    font-size: var(--text-xs);
    font-weight: 700;
    line-height: var(--leading-snug);
  }

  @media (max-width: 400px) {
    .dashboard-quick__list {
      grid-template-columns: 1fr;
    }

    .dashboard-quick__link {
      flex-direction: row;
      justify-content: flex-start;
      min-height: 3rem;
    }
  }
</style>
