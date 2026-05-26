export type AuthOpenDetail = {
  email?: string;
  /** Prefill email and request a verification code immediately (landing signup CTA). */
  autoSendCode?: boolean;
};

export const AUTH_OPEN_EVENT = "anatome:auth-open";
export const AUTH_CLOSE_EVENT = "anatome:auth-close";

export function openAuthOverlay(detail?: AuthOpenDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AuthOpenDetail>(AUTH_OPEN_EVENT, { detail }));
}

export function closeAuthOverlay() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CLOSE_EVENT));
}

export function readAuthOpenDetail(event: Event): AuthOpenDetail | undefined {
  if (!(event instanceof CustomEvent)) return undefined;
  const detail = event.detail;
  if (!detail || typeof detail !== "object") return undefined;
  const { email, autoSendCode } = detail as AuthOpenDetail;
  return {
    email: typeof email === "string" ? email : undefined,
    autoSendCode: autoSendCode === true,
  };
}
