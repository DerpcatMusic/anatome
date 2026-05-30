/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const APP_SHELL_CANDIDATES = ["/app.html", "/index.html"] as const;

async function serveAppShell({ request }: { request: Request }): Promise<Response> {
  // 1. Try precache candidates first.
  for (const url of APP_SHELL_CANDIDATES) {
    const cached = await matchPrecache(url);
    if (cached) return cached;
  }
  // 2. Fetch the requested URL directly (same-origin, guaranteed by NavigationRoute).
  //    Dev: SvelteKit dev server renders each route dynamically.
  //    Prod: static host serves the HTML file (or fallback to app.html via adapter-static).
  const navUrl = new URL(request.url);
  if (navUrl.origin === self.location.origin) {
    try {
      const response = await fetch(request.url, { cache: "no-store" });
      if (response.ok) return response;
    } catch {
      // fall through
    }
  }
  // 3. Fall back to explicit app shell files for hosts that need them.
  for (const url of APP_SHELL_CANDIDATES) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return response;
    } catch {
      // try next candidate
    }
  }
  return Response.error();
}

registerRoute(
  new NavigationRoute(serveAppShell, {
    denylist: [/^\/api\//, /^\/convex\//, /^\/_app\//],
  }),
);

void self.skipWaiting();
clientsClaim();

type PushPayload = {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
};

function parsePushPayload(event: PushEvent): PushPayload {
  if (!event.data) {
    return { title: "AnatoMe", body: "יש עדכון חדש" };
  }
  try {
    return event.data.json() as PushPayload;
  } catch {
    const text = event.data.text();
    return { title: "AnatoMe", body: text || "יש עדכון חדש" };
  }
}

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  const title = payload.title ?? "AnatoMe";
  const options: NotificationOptions = {
    body: payload.body ?? "",
    icon: payload.icon ?? "/icons/icon-192.png",
    badge: payload.badge ?? "/icons/icon-192.png",
    tag: payload.tag ?? "anatome-reminder",
    data: { url: payload.url ?? "/" },
    dir: "rtl",
    lang: "he",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    typeof event.notification.data?.url === "string"
      ? event.notification.data.url
      : "/";

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if ("focus" in client && client.url.includes(self.location.origin)) {
          await client.focus();
          if ("navigate" in client && typeof client.navigate === "function") {
            await client.navigate(targetUrl);
          }
          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })(),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      // Client re-subscribes on next visit via NotificationSettings.
      await self.registration.pushManager.getSubscription();
    })(),
  );
});
