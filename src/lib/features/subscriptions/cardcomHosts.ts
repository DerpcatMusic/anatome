/** CardCom-hosted page origins (iframe + 3DS popups). */
export const CARDCOM_SECURE_ORIGINS = [
  "https://secure.cardcom.solutions",
  "https://secure.cardcom.co.il",
] as const;

export function isCardcomSecureOrigin(origin: string): boolean {
  return CARDCOM_SECURE_ORIGINS.some((allowed) => origin === allowed);
}
