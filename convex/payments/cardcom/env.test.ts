import { describe, expect, test } from "bun:test";

describe("CardCom env defaults", () => {
  test("requireCardcomEnv uses sandbox defaults when unset", async () => {
    const previous = {
      CARDCOM_API_NAME: process.env.CARDCOM_API_NAME,
      CARDCOM_TERMINAL_NUMBER: process.env.CARDCOM_TERMINAL_NUMBER,
      CARDCOM_OPERATION: process.env.CARDCOM_OPERATION,
      CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
      FRONTEND_URL: process.env.FRONTEND_URL,
    };

    delete process.env.CARDCOM_API_NAME;
    delete process.env.CARDCOM_TERMINAL_NUMBER;
    delete process.env.CARDCOM_OPERATION;
    process.env.CONVEX_SITE_URL = "https://example.convex.site";
    process.env.FRONTEND_URL = "https://app.example";

    const { requireCardcomEnv } = await import("./env");
    const env = requireCardcomEnv();

    expect(env.apiName).toBe("CardTest1994");
    expect(env.terminalNumber).toBe(1000);
    expect(env.operation).toBe("ChargeOnly");
    expect(env.webhookUrl).toBe("https://example.convex.site/api/cardcom/webhook");

    process.env.CARDCOM_API_NAME = previous.CARDCOM_API_NAME;
    process.env.CARDCOM_TERMINAL_NUMBER = previous.CARDCOM_TERMINAL_NUMBER;
    process.env.CARDCOM_OPERATION = previous.CARDCOM_OPERATION;
    process.env.CONVEX_SITE_URL = previous.CONVEX_SITE_URL;
    process.env.FRONTEND_URL = previous.FRONTEND_URL;
  });
});
