import { browser } from "$app/environment";
import { isCardcomCheckoutMessage, type CardcomCheckoutMessage } from "./cardcomEmbed";

export type CardcomCheckoutResult = Pick<CardcomCheckoutMessage, "status" | "orderId">;

/**
 * Listens for embed success/failure pages posting `anatome:cardcom-checkout` to the parent.
 */
export function useCardcomCheckoutChannel(options: {
  getActiveOrderId: () => string | null | undefined;
  onResult: (result: CardcomCheckoutResult) => void;
}) {
  if (!browser) return;

  $effect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isCardcomCheckoutMessage(event.data)) return;
      const active = options.getActiveOrderId();
      if (active && event.data.orderId !== active) return;
      options.onResult({ status: event.data.status, orderId: event.data.orderId });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });
}
