import { api } from "$convex/_generated/api";
import type { ConvexClient } from "convex/browser";
import { PUBLIC_VAPID_PUBLIC_KEY } from "$lib/pwa/vapid-config";
import { canPromptForPushOnThisPlatform } from "./platform";

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength);
}

export type PushSubscribeResult =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "denied" | "no_vapid" | "no_sw" | "error"; message?: string };

export async function subscribeToPushNotifications(
  client: ConvexClient,
): Promise<PushSubscribeResult> {
  if (!canPromptForPushOnThisPlatform()) {
    return { ok: false, reason: "unsupported" };
  }

  const vapidKey = PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!vapidKey) {
    return { ok: false, reason: "no_vapid" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "denied" };
  }

  const registration = await navigator.serviceWorker.ready;
  if (!registration.pushManager) {
    return { ok: false, reason: "unsupported" };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { ok: false, reason: "error", message: "מנוי התראות לא תקין" };
  }

  await client.mutation(api.push.subscribe.upsert, {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    userAgent: navigator.userAgent.slice(0, 512),
  });

  return { ok: true };
}

export async function unsubscribeFromPushNotifications(
  client: ConvexClient,
): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager?.getSubscription();
  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await client.mutation(api.push.subscribe.remove, { endpoint });
  }
}

export async function hasActivePushSubscription(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager?.getSubscription();
  return subscription !== null;
}
