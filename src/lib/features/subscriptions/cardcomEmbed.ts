import type { Id } from "$convex/_generated/dataModel";

type CheckoutOrderId = Id<"subscriptionOrders"> | Id<"creditOrders">;

export const CARDCOM_CHECKOUT_MESSAGE = "anatome:cardcom-checkout" as const;

export type CardcomCheckoutMessage = {
  type: typeof CARDCOM_CHECKOUT_MESSAGE;
  status: "success" | "failure";
  orderId: string;
};

export function isCardcomCheckoutMessage(data: unknown): data is CardcomCheckoutMessage {
  if (!data || typeof data !== "object") return false;
  const row = data as CardcomCheckoutMessage;
  return (
    row.type === CARDCOM_CHECKOUT_MESSAGE &&
    (row.status === "success" || row.status === "failure") &&
    typeof row.orderId === "string"
  );
}

export function notifyCardcomCheckoutParent(
  status: "success" | "failure",
  orderId: CheckoutOrderId,
) {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage(
    {
      type: CARDCOM_CHECKOUT_MESSAGE,
      status,
      orderId,
    } satisfies CardcomCheckoutMessage,
    window.location.origin,
  );
}
