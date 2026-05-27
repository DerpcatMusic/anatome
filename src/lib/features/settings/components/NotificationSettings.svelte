<script lang="ts">
  import { Button } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import { useConvexClient, useQuery } from "convex-svelte";
  import Notice from "$components/ui/Notice.svelte";
  import PwaInstallCard from "$features/pwa/components/PwaInstallCard.svelte";
  import { canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import {
    hasActivePushSubscription,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
  } from "$lib/pwa/push-subscribe";
  import { browser } from "$app/environment";
  import { canPromptForPushOnThisPlatform, isIosSafari, isStandaloneDisplayMode } from "$lib/pwa/platform";
  import { PUBLIC_VAPID_PUBLIC_KEY } from "$env/static/public";

  const client = useConvexClient();

  const prefsQuery = useQuery(api.push.preferences.get, () =>
    canRunAuthenticatedQuery() ? {} : "skip",
  );

  let pushBusy = $state(false);
  let saveBusy = $state(false);
  let pushSubscribed = $state(false);
  let error = $state("");
  let success = $state("");

  const vapidConfigured = $derived(Boolean(PUBLIC_VAPID_PUBLIC_KEY?.trim()));
  const pushSupported = $derived(canPromptForPushOnThisPlatform());
  const needsInstallFirst = $derived(
    browser && isIosSafari() && !isStandaloneDisplayMode(),
  );

  $effect(() => {
    if (!canRunAuthenticatedQuery()) return;
    void refreshPushState();
  });

  async function refreshPushState() {
    pushSubscribed = await hasActivePushSubscription();
  }

  async function enablePush() {
    error = "";
    success = "";
    pushBusy = true;
    try {
      const result = await subscribeToPushNotifications(client);
      if (!result.ok) {
        if (result.reason === "denied") {
          error = "הרשאת התראות נדחתה. אפשר לאפשר בהגדרות הדפדפן.";
        } else if (result.reason === "no_vapid") {
          error = "התראות דחיפה עדיין לא מוגדרות בשרת.";
        } else if (result.reason === "unsupported") {
          error = needsInstallFirst
            ? "ב-iPhone צריך להוסיף את האפליקציה למסך הבית לפני הפעלת התראות."
            : "הדפדפן לא תומך בהתראות דחיפה.";
        } else {
          error = result.message ?? "לא הצלחנו להפעיל התראות.";
        }
        return;
      }
      pushSubscribed = true;
      success = "התראות דחיפה הופעלו.";
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "שגיאה בהפעלת התראות";
    } finally {
      pushBusy = false;
    }
  }

  async function disablePush() {
    error = "";
    success = "";
    pushBusy = true;
    try {
      await unsubscribeFromPushNotifications(client);
      pushSubscribed = false;
      success = "התראות דחיפה כובו במכשיר זה.";
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "שגיאה בביטול התראות";
    } finally {
      pushBusy = false;
    }
  }

  async function savePreferences(liveRemindersPush: boolean, liveRemindersEmail: boolean) {
    error = "";
    success = "";
    saveBusy = true;
    try {
      await client.mutation(api.push.preferences.update, {
        liveRemindersPush,
        liveRemindersEmail,
      });
      success = "העדפות נשמרו.";
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לשמור.";
    } finally {
      saveBusy = false;
    }
  }
</script>

<section class="notification-settings" aria-labelledby="notification-settings-title">
  <h2 id="notification-settings-title" class="notification-settings__title">התראות ואפליקציה</h2>

  <PwaInstallCard />

  {#if error}
    <Notice tone="danger">{error}</Notice>
  {/if}
  {#if success}
    <Notice tone="success">{success}</Notice>
  {/if}

  {#if prefsQuery.isLoading}
    <p class="notification-settings__muted" aria-busy="true">טוען העדפות…</p>
  {:else if prefsQuery.data}
    <div class="notification-settings__group">
      <h3 class="notification-settings__subtitle">תזכורות לשיעור חי</h3>
      <p class="notification-settings__muted">
        נשלח תזכורת יום לפני השיעור ו-30 דקות לפני תחילתו (בנוסף להתראה באפליקציה כשהשיעור עלה).
      </p>

      <label class="notification-settings__row">
        <input
          type="checkbox"
          checked={prefsQuery.data.liveRemindersEmail}
          disabled={saveBusy}
          onchange={(e) =>
            void savePreferences(
              prefsQuery.data?.liveRemindersPush ?? true,
              e.currentTarget.checked,
            )}
        />
        <span>אימייל</span>
      </label>

      <label class="notification-settings__row">
        <input
          type="checkbox"
          checked={prefsQuery.data.liveRemindersPush}
          disabled={saveBusy || !vapidConfigured}
          onchange={(e) =>
            void savePreferences(
              e.currentTarget.checked,
              prefsQuery.data?.liveRemindersEmail ?? true,
            )}
        />
        <span>התראות דחיפה (מכשיר)</span>
      </label>
    </div>

    <div class="notification-settings__group">
      <h3 class="notification-settings__subtitle">מכשיר זה</h3>
      {#if !vapidConfigured}
        <Notice tone="neutral">מפתחות VAPID לא הוגדרו — התראות דחיפה לא זמינות.</Notice>
      {:else if !pushSupported}
        <p class="notification-settings__muted">
          {#if needsInstallFirst}
            הוסיפי את AnatoMe למסך הבית, ואז חזרי לכאן להפעיל התראות.
          {:else}
            הדפדפן הנוכחי לא תומך בהתראות דחיפה.
          {/if}
        </p>
      {:else if pushSubscribed}
        <p class="notification-settings__muted">התראות דחיפה פעילות במכשיר זה.</p>
        <Button.Root
          class="hb-button hb-button--ghost"
          type="button"
          disabled={pushBusy}
          onclick={disablePush}
        >
          {pushBusy ? "מבטלת…" : "כיבוי התראות במכשיר"}
        </Button.Root>
      {:else}
        <Button.Root
          class="hb-button hb-button--ink"
          type="button"
          disabled={pushBusy || !prefsQuery.data.liveRemindersPush}
          onclick={enablePush}
        >
          {pushBusy ? "מפעילה…" : "הפעלת התראות במכשיר"}
        </Button.Root>
      {/if}
    </div>
  {/if}
</section>

<style>
  .notification-settings {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    margin-block: var(--space-6);
  }

  .notification-settings__title {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: 600;
  }

  .notification-settings__subtitle {
    margin: 0 0 var(--space-2);
    font-size: var(--text-base);
    font-weight: 600;
  }

  .notification-settings__muted {
    margin: 0 0 var(--space-3);
    font-size: var(--text-sm);
    color: var(--foreground-muted);
    line-height: 1.5;
  }

  .notification-settings__group {
    padding: var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--muted);
  }

  .notification-settings__row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: 44px;
    font-size: var(--text-sm);
    cursor: pointer;
  }

  .notification-settings__row input {
    width: 1.125rem;
    height: 1.125rem;
    accent-color: var(--primary);
  }
</style>
