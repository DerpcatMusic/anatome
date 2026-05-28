"use node";

export type CardcomOperation = "ChargeOnly" | "CreateTokenOnly";

declare const process: {
  env: {
    CARDCOM_API_NAME?: string;
    CARDCOM_API_PASSWORD?: string;
    CARDCOM_TERMINAL_NUMBER?: string;
    CARDCOM_OPERATION?: string;
    CONVEX_SITE_URL?: string;
    FRONTEND_URL?: string;
    /** HTTPS origin for CardCom CSSUrl when FRONTEND_URL is localhost */
    CARDCOM_CHECKOUT_CSS_URL?: string;
  };
};

const DEFAULT_API_NAME = "CardTest1994";
const DEFAULT_TERMINAL = "1000";
const DEFAULT_OPERATION: CardcomOperation = "ChargeOnly";

export function requireCardcomEnv() {
  const apiName = process.env.CARDCOM_API_NAME?.trim() || DEFAULT_API_NAME;
  const apiPassword = process.env.CARDCOM_API_PASSWORD?.trim() ?? "";
  const terminalRaw = process.env.CARDCOM_TERMINAL_NUMBER?.trim() || DEFAULT_TERMINAL;
  const terminalNumber = Number.parseInt(terminalRaw, 10);
  if (!Number.isFinite(terminalNumber)) {
    throw new Error("CARDCOM_TERMINAL_NUMBER must be a valid integer");
  }

  const operationRaw = (process.env.CARDCOM_OPERATION?.trim() ||
    DEFAULT_OPERATION) as CardcomOperation;
  if (operationRaw !== "ChargeOnly" && operationRaw !== "CreateTokenOnly") {
    throw new Error('CARDCOM_OPERATION must be "ChargeOnly" or "CreateTokenOnly"');
  }

  const convexSiteUrl = process.env.CONVEX_SITE_URL?.trim().replace(/\/$/, "");
  if (!convexSiteUrl) {
    throw new Error("CONVEX_SITE_URL is required for CardCom webhooks");
  }

  const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/$/, "");
  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is required for CardCom redirects");
  }

  const checkoutCssBase = (
    process.env.CARDCOM_CHECKOUT_CSS_URL?.trim() || frontendUrl
  ).replace(/\/$/, "");

  return {
    apiName,
    apiPassword,
    terminalNumber,
    operation: operationRaw,
    webhookUrl: `${convexSiteUrl}/api/cardcom/webhook`,
    frontendUrl,
    checkoutCssBase,
  };
}
