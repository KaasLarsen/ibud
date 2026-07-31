import { getModelById } from "../../quotes/catalog";
import { partnerDeepLink } from "../../quotes/deep-links";
import type { QuoteRequest, QuoteResult } from "../../quotes/types";
import { baseResult, parseDkkAmount } from "../types";

/**
 * PhoneHero publicerer en lille sammenligningstabel på sælg-siden.
 * Dækker kun få modeller — brug når match findes.
 */
export async function fetchPhoneheroHttpQuote(
  request: QuoteRequest,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const deepLink = partnerDeepLink("phonehero", request);
  if (!model) {
    return baseResult("phonehero", deepLink, { error: "Ukendt model" });
  }

  try {
    const res = await fetch(
      "https://phonehero.dk/saelg-din-gamle-mobil-til-os",
      {
        headers: {
          Accept: "text/html",
          "User-Agent":
            "iBudBot/1.0 (+https://ibud.dk; info@ibud.dk) Mozilla/5.0",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return baseResult("phonehero", deepLink, {
        error: `PhoneHero HTTP ${res.status}`,
      });
    }

    const html = await res.text();
    const storage =
      request.storageGb >= 1024
        ? `${request.storageGb / 1024} TB`
        : `${request.storageGb} GB`;

    // Fx: <td>iPhone 15 128 GB</td><td>2.950&nbsp;kr.</td>
    const escapedName = model.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const storageAlt = storage.replace(" GB", "\\s*GB").replace(" TB", "\\s*TB");
    const re = new RegExp(
      `<td[^>]*>\\s*${escapedName}\\s+${storageAlt}\\s*<\\/td>\\s*<td[^>]*>\\s*([^<]+)<\\/td>`,
      "i",
    );
    const match = html.match(re);
    if (!match) {
      return baseResult("phonehero", deepLink, {
        error: "Model findes ikke i PhoneHeros pristabel",
      });
    }

    const amount = parseDkkAmount(match[1].replace(/\u00a0/g, " "));
    if (amount == null || amount < 1) {
      return baseResult("phonehero", deepLink, {
        error: "Kunne ikke læse PhoneHero-pris",
      });
    }

    return baseResult("phonehero", deepLink, {
      amountDkk: amount,
      rawNotes: "PhoneHero offentlig pristabel",
    });
  } catch (err) {
    return baseResult("phonehero", deepLink, {
      error: err instanceof Error ? err.message : "PhoneHero-fejl",
    });
  }
}
