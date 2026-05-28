import { describe, expect, test } from "bun:test";
import { buildLowProfileUiAndDocument } from "./payload";

describe("buildLowProfileUiAndDocument", () => {
  test("locks invoice editing and hides prefilled buyer fields", () => {
    const { uiDefinition, document } = buildLowProfileUiAndDocument({
      productDescription: "מנוי Guided",
      amountIls: 1266.5,
      language: "he",
      buyer: {
        name: "Test User",
        email: "pay@example.com",
        phone: "0501234567",
        identityNumber: "123456782",
      },
    });

    expect(document.IsAllowEditDocument).toBe(false);
    expect(document.DocumentTypeToCreate).toBe("Order");
    expect(document.TaxId).toBe("123456782");
    expect(uiDefinition.IsHideCardOwnerEmail).toBe(true);
    expect(uiDefinition.IsHideCardOwnerName).toBe(true);
  });

  test("requires email and phone when not prefilled", () => {
    const { uiDefinition } = buildLowProfileUiAndDocument({
      productDescription: "קרדיטים",
      amountIls: 99,
      language: "he",
      buyer: { name: "לקוח" },
    });

    expect(uiDefinition.IsHideCardOwnerEmail).toBe(false);
    expect(uiDefinition.IsCardOwnerEmailRequired).toBe(true);
    expect(uiDefinition.IsCardOwnerPhoneRequired).toBe(true);
  });
});
