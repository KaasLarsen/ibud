import { applyGreenTracking } from "@/lib/partners/green/tracking";
import { getModelById, PARTNERS } from "./catalog";
import type { PartnerId, QuoteRequest } from "./types";

/**
 * Green sell-page slug, or null when no dedicated model page exists
 * (fall back to sellBaseUrl so the user does not hit a 404).
 */
function greenSellSlug(modelId: string): string | null {
  // Green lists 17 / 17 Pro / 17 Pro Max / 16e — but not Air (as of 2026-07).
  if (modelId === "iphone-17-air") return null;
  return modelId;
}

/** Phonetrade sell-page slug (Air lives at saelg-iphone-air). */
function phonetradeSellSlug(modelId: string): string {
  if (modelId === "iphone-17-air") return "iphone-air";
  return modelId;
}

/**
 * Raw partner destination (no affiliate wrap). Use for scraping / page.goto.
 */
export function partnerDestinationUrl(
  partnerId: PartnerId,
  request: QuoteRequest,
): string {
  const model = getModelById(request.modelId);
  const fallback = PARTNERS[partnerId].sellBaseUrl;
  if (!model) return fallback;

  switch (partnerId) {
    case "green": {
      const slug = greenSellSlug(model.id);
      if (!slug) return fallback;
      return `https://green.dk/pages/saelg-${slug}`;
    }

    case "phonetrade":
      return `https://phonetrade.dk/pages/saelg-${phonetradeSellSlug(model.id)}`;

    case "swappie":
      return `https://swappie.com/dk/saelg/iphone/${model.swappieSlug}/`;

    case "greenmind":
      return PARTNERS.greenmind.sellBaseUrl;

    case "phonehero":
      return PARTNERS.phonehero.sellBaseUrl;

    case "miphone":
      return "https://miphone.dk/saelg/saelg-din-iphone/";

    default:
      return fallback;
  }
}

/**
 * User-facing deep link (Green goes through Partner-Ads tracking).
 */
export function partnerDeepLink(
  partnerId: PartnerId,
  request: QuoteRequest,
): string {
  const destination = partnerDestinationUrl(partnerId, request);
  if (partnerId === "green") return applyGreenTracking(destination);
  return destination;
}
