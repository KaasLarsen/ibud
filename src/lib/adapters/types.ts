import type { Page } from "playwright";
import type { PartnerId, QuoteRequest, QuoteResult } from "../quotes/types";

export type PartnerAdapter = {
  id: PartnerId;
  fetchQuote: (request: QuoteRequest, page: Page) => Promise<QuoteResult>;
};

export function parseDkkAmount(text: string): number | null {
  const cleaned = text
    .replace(/\u00a0/g, " ")
    .replace(/kr\.?/gi, "")
    .replace(/DKK/gi, "")
    .trim();

  // Match e.g. 3.200 | 3 200 | 3200 | 3.200,00 | 2 841 kr
  const match = cleaned.match(
    /(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,\d{2})?/,
  );
  if (!match) return null;

  const digits = match[1].replace(/[.\s]/g, "");
  const value = Number.parseInt(digits, 10);
  return Number.isFinite(value) ? value : null;
}

export function baseResult(
  partnerId: PartnerId,
  deepLink: string,
  partial?: Partial<QuoteResult>,
): QuoteResult {
  return {
    partnerId,
    amountDkk: null,
    currency: "DKK",
    deepLink,
    fetchedAt: new Date().toISOString(),
    ...partial,
  };
}
