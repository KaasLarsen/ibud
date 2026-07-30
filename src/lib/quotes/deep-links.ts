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
 * Deep links that land on the partner's sell-flow for the chosen iPhone model.
 * Only use URL patterns we know exist for that model.
 */
export function partnerDeepLink(
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
      // Confirmed: /dk/saelg/iphone/iphone-15-pro/
      return `https://swappie.com/dk/saelg/iphone/${model.swappieSlug}/`;

    case "greenmind":
      // No reliable model deep-link — open sell tool (user picks model there)
      return PARTNERS.greenmind.sellBaseUrl;

    case "phonehero":
      // No reliable model deep-link — open sell tool (user picks model there)
      return PARTNERS.phonehero.sellBaseUrl;

    case "miphone":
      // iPhone sell page (model still picked in form; better than generic hub)
      return "https://miphone.dk/saelg/saelg-din-iphone/";

    default:
      return fallback;
  }
}
