"use node";

import { requireCardcomEnv, type CardcomOperation } from "./env";
import { buildLowProfileUiAndDocument, type CardcomProductLine } from "./payload";

const CARDCOM_BASE = "https://secure.cardcom.solutions/api/v11";
const REQUEST_TIMEOUT_MS = 5_000;

export type CardcomBaseResponse = {
  ResponseCode: number;
  Description?: string;
};

export type CreateLowProfileResponse = CardcomBaseResponse & {
  LowProfileId?: string;
  Url?: string;
};

export type GetLpResultResponse = CardcomBaseResponse & {
  TranzactionId?: number;
  Operation?: string;
  DocumentInfo?: {
    DocumentType?: string;
    DocumentNumber?: number;
  };
  TokenInfo?: {
    Token?: string;
    CardYear?: number;
    CardMonth?: number;
    TokenApprovalNumber?: string;
    CardOwnerIdentityNumber?: string;
  };
};

export type CancelDocResponse = CardcomBaseResponse & {
  NewDocumentNumber?: number;
  NewDocumentType?: string;
};

export type TransactionResponse = CardcomBaseResponse & {
  TranzactionId?: number;
  DocumentNumber?: number;
  DocumentType?: string;
};

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${CARDCOM_BASE}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`CardCom HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === 0) continue;
    }
  }

  throw lastError ?? new Error("CardCom request failed");
}

export type CreateLowProfileInput = {
  amountIls: number;
  returnValue: string;
  operation: CardcomOperation;
  successRedirectUrl: string;
  failedRedirectUrl: string;
  webhookUrl: string;
  language: "he" | "en";
  embed: boolean;
  planSlug: string;
  checkoutCssUrl: string;
  buyer: {
    name: string;
    email?: string;
    phone?: string;
    identityNumber?: string;
  };
  productDescription: string;
  documentProducts?: CardcomProductLine[];
};

export async function createLowProfile(
  input: CreateLowProfileInput,
): Promise<CreateLowProfileResponse> {
  const env = requireCardcomEnv();

  const { uiDefinition, document } = buildLowProfileUiAndDocument({
    productDescription: input.productDescription,
    amountIls: input.amountIls,
    language: input.language,
    buyer: input.buyer,
    products: input.documentProducts,
  });

  return await postJson<CreateLowProfileResponse>("/LowProfile/Create", {
    TerminalNumber: env.terminalNumber,
    ApiName: env.apiName,
    Operation: input.operation,
    ReturnValue: input.returnValue,
    Amount: input.amountIls,
    ProductName: input.productDescription,
    SuccessRedirectUrl: input.successRedirectUrl,
    FailedRedirectUrl: input.failedRedirectUrl,
    CancelRedirectUrl: input.failedRedirectUrl,
    WebHookUrl: input.webhookUrl,
    Language: input.language,
    ISOCoinId: 1,
    AdvancedDefinition: {
      MinNumOfPayments: 1,
      MaxNumOfPayments: 1,
    },
    UIDefinition: {
      ...uiDefinition,
      CSSUrl: input.checkoutCssUrl,
    },
    Document: document,
  });
}

export async function getLpResult(lowProfileId: string): Promise<GetLpResultResponse> {
  const env = requireCardcomEnv();
  return await postJson<GetLpResultResponse>("/LowProfile/GetLpResult", {
    TerminalNumber: env.terminalNumber,
    ApiName: env.apiName,
    LowProfileId: lowProfileId,
  });
}

export async function cancelDocument(input: {
  documentNumber: number;
  documentType: string;
}): Promise<CancelDocResponse> {
  const env = requireCardcomEnv();
  if (!env.apiPassword) {
    throw new Error("CARDCOM_API_PASSWORD is required for refunds");
  }
  return await postJson<CancelDocResponse>("/Documents/CancelDoc", {
    ApiName: env.apiName,
    ApiPassword: env.apiPassword,
    DocumentNumber: input.documentNumber,
    DocumentType: input.documentType,
  });
}

export type ChargeTokenInput = {
  amountIls: number;
  token: string;
  cardMonth: number;
  cardYear: number;
  /** Idempotency key — reuse same value on retry to avoid duplicate charge (CardCom error 608). */
  externalUniqTranId?: string;
  buyer: {
    name: string;
    email?: string;
    identityNumber?: string;
  };
  productDescription: string;
  language: "he" | "en";
};

export async function chargeToken(input: ChargeTokenInput): Promise<TransactionResponse> {
  const env = requireCardcomEnv();
  const mm = String(input.cardMonth).padStart(2, "0");
  const yy = String(input.cardYear).padStart(2, "0").slice(-2);

  const { document } = buildLowProfileUiAndDocument({
    productDescription: input.productDescription,
    amountIls: input.amountIls,
    language: input.language,
    buyer: input.buyer,
  });

  return await postJson<TransactionResponse>("/Transactions/Transaction", {
    TerminalNumber: env.terminalNumber,
    ApiName: env.apiName,
    Amount: input.amountIls,
    Token: input.token,
    CardExpirationMMYY: `${mm}${yy}`,
    ...(input.externalUniqTranId
      ? {
          ExternalUniqTranId: input.externalUniqTranId,
          ExternalUniqUniqTranIdResponse: true,
        }
      : {}),
    NumOfPayments: 1,
    ISOCoinId: 1,
    CardOwnerInformation: {
      FullName: input.buyer.name,
      IdentityNumber: input.buyer.identityNumber ?? "",
      CardOwnerEmail: input.buyer.email ?? "",
    },
    Document: document,
  });
}
