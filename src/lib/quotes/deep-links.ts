import { getModelById, PARTNERS } from "./catalog";
import type { PartnerId, QuoteRequest } from "./types";

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
    case "green":
      // Confirmed: /pages/saelg-iphone-15-pro etc.
      return `https://green.dk/pages/saelg-${model.id}`;

    case "phonetrade":
      return `https://phonetrade.dk/pages/saelg-${model.id}`;

    case "swappie":
      // Confirmed: /dk/saelg/iphone/iphone-15-pro/
      return `https://swappie.com/dk/saelg/iphone/${model.swappieSlug}/`;

    case "greenmind":
      // No reliable model deep-link — open sell tool (user picks model there)
      return PARTNERS.greenmind.sellBaseUrl;

    case "phonehero":
      return PARTNERS.phonehero.sellBaseUrl;

    case "miphone":
      // MiPhone sell hub for Apple devices
      return "https://miphone.dk/saelg/";

    default:
      return fallback;
  }
}
