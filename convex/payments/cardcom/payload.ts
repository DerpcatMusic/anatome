export type CardcomBuyer = {
  name: string;
  email?: string;
  phone?: string;
  identityNumber?: string;
};

export type CardcomProductLine = {
  description: string;
  unitCost: number;
  quantity: number;
};

export type CardcomDocumentInput = {
  productDescription: string;
  amountIls: number;
  language: "he" | "en";
  buyer: CardcomBuyer;
  products?: CardcomProductLine[];
};

/** UIDefinition + Document for Low Profile — fewer fields on hosted page. */
export function buildLowProfileUiAndDocument(input: CardcomDocumentInput) {
  const email = input.buyer.email?.trim() ?? "";
  const phone = input.buyer.phone?.trim() ?? "";
  const identity = input.buyer.identityNumber?.trim() ?? "";

  return {
    uiDefinition: {
      CardOwnerNameValue: input.buyer.name,
      CardOwnerPhoneValue: phone,
      CardOwnerEmailValue: email,
      CardOwnerIdValue: identity,
      IsHideCardOwnerName: input.buyer.name.length > 0,
      IsHideCardOwnerEmail: email.length > 0,
      IsHideCardOwnerPhone: phone.length > 0,
      IsHideCardOwnerIdentityNumber: identity.length > 0,
      IsCardOwnerEmailRequired: email.length === 0,
      IsCardOwnerPhoneRequired: phone.length === 0,
      IsHideCVV: false,
    },
    document: {
      DocumentTypeToCreate: "Order" as const,
      IsAllowEditDocument: false,
      IsShowOnlyDocument: false,
      Name: input.buyer.name,
      Email: email,
      TaxId: identity,
      IsSendByEmail: email.length > 0,
      AddressLine1: "",
      AddressLine2: "",
      City: "",
      Mobile: phone,
      Phone: phone,
      Language: input.language,
      Products: (input.products ?? [
        {
          description: input.productDescription,
          unitCost: input.amountIls,
          quantity: 1,
        },
      ]).map((row) => ({
        Description: row.description,
        UnitCost: row.unitCost,
        Quantity: row.quantity,
      })),
    },
  };
}
