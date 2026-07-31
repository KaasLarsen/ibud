import { partnerDeepLink } from "../../quotes/deep-links";
import type { PartnerId, QuoteRequest, QuoteResult } from "../../quotes/types";
import { baseResult } from "../types";
import { fetchGreenmindHttpQuote } from "./greenmind";
import { fetchPhoneheroHttpQuote } from "./phonehero";
import { fetchReuselyQuote, isReuselyPartner } from "./reusely";
import { fetchSwappieHttpQuote } from "./swappie";

/**
 * HTTP-baserede bud uden Playwright/Chromium.
 * Primær path på Vercel hvor partner-sider er bag Cloudflare.
 */
export async function fetchPartnerQuoteHttp(
  partnerId: PartnerId,
  request: QuoteRequest,
): Promise<QuoteResult | null> {
  if (isReuselyPartner(partnerId)) {
    return fetchReuselyQuote(partnerId, request);
  }
  if (partnerId === "greenmind") {
    return fetchGreenmindHttpQuote(request);
  }
  if (partnerId === "swappie") {
    return fetchSwappieHttpQuote(request);
  }
  if (partnerId === "phonehero") {
    return fetchPhoneheroHttpQuote(request);
  }
  // MiPhone: ingen stabil offentlig pris-API endnu
  return null;
}

export async function fetchPartnerQuoteHttpOrUnavailable(
  partnerId: PartnerId,
  request: QuoteRequest,
): Promise<QuoteResult> {
  const hit = await fetchPartnerQuoteHttp(partnerId, request);
  if (hit) return hit;
  return baseResult(partnerId, partnerDeepLink(partnerId, request), {
    error: "Ingen HTTP-priskilde for denne partner",
  });
}
