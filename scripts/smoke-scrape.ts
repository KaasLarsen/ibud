import { fetchPartnerQuoteLive } from "../src/lib/adapters";
import type { PartnerId, QuoteRequest } from "../src/lib/quotes/types";

const request: QuoteRequest = {
  modelId: "iphone-15",
  storageGb: 128,
  condition: {
    worksNormally: true,
    screenIntact: true,
    cosmetic: "fine",
    battery: "ok",
  },
};

const partners: PartnerId[] = ["swappie", "green", "greenmind"];

async function main() {
  for (const id of partners) {
    const started = Date.now();
    try {
      const q = await fetchPartnerQuoteLive(id, request);
      console.log(
        JSON.stringify({
          partner: id,
          amountDkk: q.amountDkk,
          error: q.error ?? null,
          ms: Date.now() - started,
          notes: q.rawNotes ?? null,
        }),
      );
    } catch (e) {
      console.log(
        JSON.stringify({
          partner: id,
          fatal: String(e),
          ms: Date.now() - started,
        }),
      );
    }
  }
}

main();
