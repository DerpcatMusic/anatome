export type SubscriptionPickerOpenDetail = {
  /** Scroll/highlight this plan when the panel opens */
  highlightSlug?: string;
};

export const SUBSCRIPTION_PICKER_OPEN_EVENT = "anatome:subscription-picker-open";
export const SUBSCRIPTION_PICKER_CLOSE_EVENT = "anatome:subscription-picker-close";

const PENDING_PLAN_KEY = "homebody:pendingPlanSlug";

export function openSubscriptionPicker(detail?: SubscriptionPickerOpenDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<SubscriptionPickerOpenDetail>(SUBSCRIPTION_PICKER_OPEN_EVENT, {
      detail,
    }),
  );
}

export function closeSubscriptionPicker() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SUBSCRIPTION_PICKER_CLOSE_EVENT));
}

export function readSubscriptionPickerDetail(
  event: Event,
): SubscriptionPickerOpenDetail | undefined {
  if (!(event instanceof CustomEvent)) return undefined;
  const detail = event.detail;
  if (!detail || typeof detail !== "object") return undefined;
  const { highlightSlug } = detail as SubscriptionPickerOpenDetail;
  return {
    highlightSlug: typeof highlightSlug === "string" ? highlightSlug : undefined,
  };
}

export function stashPendingPlanSlug(slug: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_PLAN_KEY, slug);
}

export function takePendingPlanSlug(): string | null {
  if (typeof window === "undefined") return null;
  const slug = sessionStorage.getItem(PENDING_PLAN_KEY);
  if (slug) sessionStorage.removeItem(PENDING_PLAN_KEY);
  return slug;
}

export function peekPendingPlanSlug(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PENDING_PLAN_KEY);
}
