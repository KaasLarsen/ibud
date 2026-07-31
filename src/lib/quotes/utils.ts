import { createHash } from "crypto";
import type { NormalizedCondition, QuoteRequest } from "./types";

export function conditionHash(condition: NormalizedCondition): string {
  return [
    condition.worksNormally ? "1" : "0",
    condition.screenIntact ? "1" : "0",
    condition.cosmetic,
    condition.battery,
  ].join("-");
}

/** v3: HTTP-API priser (Reusely/GreenMind) i stedet for CF-blokeret scrape. */
export function cacheKey(partnerId: string, request: QuoteRequest): string {
  return [
    "v3",
    partnerId,
    request.modelId,
    String(request.storageGb),
    conditionHash(request.condition),
  ].join(":");
}

export function requestFingerprint(request: QuoteRequest): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        modelId: request.modelId,
        storageGb: request.storageGb,
        condition: request.condition,
      }),
    )
    .digest("hex")
    .slice(0, 16);
}

export { formatDkk, formatStorage, pickWinner } from "./format";
