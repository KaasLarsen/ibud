import type { Page } from "playwright";
import { getModelById } from "../quotes/catalog";
import { partnerDeepLink } from "../quotes/deep-links";
import type { QuoteRequest, QuoteResult } from "../quotes/types";
import { baseResult, parseDkkAmount, type PartnerAdapter } from "./types";

/**
 * Swappie sell flow: /dk/saelg/iphone/{slug}/
 */
async function fetchSwappieQuote(
  request: QuoteRequest,
  page: Page,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const deepLink = partnerDeepLink("swappie", request);

  if (!model) {
    return baseResult("swappie", deepLink, { error: "Ukendt model" });
  }

  await page.goto(deepLink, { waitUntil: "domcontentloaded", timeout: 30_000 });

  // Dismiss cookie banners if present
  for (const label of ["Accepter", "Acceptér", "Accept all", "Tillad alle"]) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") });
    if (await btn.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.first().click().catch(() => undefined);
      break;
    }
  }

  // Continue past model step if needed
  const continueBtn = page.getByRole("button", { name: /fortsæt/i });
  if (await continueBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    await continueBtn.first().click().catch(() => undefined);
  }

  // Select storage
  const storageLabel =
    request.storageGb >= 1024
      ? `${request.storageGb / 1024} TB`
      : `${request.storageGb} GB`;

  const storageOption = page.getByText(storageLabel, { exact: true }).first();
  if (await storageOption.isVisible({ timeout: 5000 }).catch(() => false)) {
    await storageOption.click();
  }

  if (await continueBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await continueBtn.first().click().catch(() => undefined);
  }

  // Answer condition questions based on normalized condition
  await answerYesNo(page, request.condition.worksNormally);
  await answerYesNo(page, request.condition.screenIntact);
  await answerBattery(page, request.condition.battery === "ok");
  await answerCosmetic(page, request.condition.cosmetic);

  // Keep clicking continue / answering until estimate appears
  for (let i = 0; i < 8; i++) {
    const amount = await readEstimate(page);
    if (amount !== null) {
      return baseResult("swappie", deepLink, {
        amountDkk: amount,
        rawNotes: "Estimat fra Swappie sælg-flow",
      });
    }

    const yes = page.getByRole("button", { name: /^(ja|yes)$/i });
    const no = page.getByRole("button", { name: /^(nej|no)$/i });
    if (await yes.first().isVisible({ timeout: 800 }).catch(() => false)) {
      // Prefer optimistic answers when ambiguous mid-flow
      const preferYes = request.condition.worksNormally && request.condition.screenIntact;
      await (preferYes ? yes : no).first().click().catch(() => undefined);
      continue;
    }

    if (await continueBtn.first().isVisible({ timeout: 800 }).catch(() => false)) {
      await continueBtn.first().click().catch(() => undefined);
      continue;
    }

    await page.waitForTimeout(800);
  }

  const amount = await readEstimate(page);
  if (amount !== null) {
    return baseResult("swappie", deepLink, {
      amountDkk: amount,
      rawNotes: "Estimat fra Swappie sælg-flow",
    });
  }

  return baseResult("swappie", deepLink, {
    error: "Kunne ikke læse Swappie-estimat",
  });
}

async function answerYesNo(page: Page, yes: boolean) {
  const label = yes ? /^(ja|yes)$/i : /^(nej|no)$/i;
  const btn = page.getByRole("button", { name: label });
  if (await btn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.first().click().catch(() => undefined);
  }
}

async function answerBattery(page: Page, ok: boolean) {
  // Swappie often asks about battery health / issues
  const options = ok
    ? [/over 85/i, /god/i, /ingen problemer/i, /^ja$/i]
    : [/under 85/i, /dårlig/i, /problemer/i, /^nej$/i];

  for (const pattern of options) {
    const el = page.getByText(pattern).first();
    if (await el.isVisible({ timeout: 800 }).catch(() => false)) {
      await el.click().catch(() => undefined);
      return;
    }
  }
  await answerYesNo(page, ok);
}

async function answerCosmetic(
  page: Page,
  cosmetic: QuoteRequest["condition"]["cosmetic"],
) {
  const patterns =
    cosmetic === "fine"
      ? [/som ny/i, /ingen ridser/i, /perfekt/i, /god stand/i]
      : cosmetic === "scratches"
        ? [/ridser/i, /brugsspor/i, /synlige/i]
        : [/skadet/i, /revner/i, /defekt/i, /dårlig/i];

  for (const pattern of patterns) {
    const el = page.getByText(pattern).first();
    if (await el.isVisible({ timeout: 800 }).catch(() => false)) {
      await el.click().catch(() => undefined);
      return;
    }
  }
}

async function readEstimate(page: Page): Promise<number | null> {
  const body = await page.locator("body").innerText().catch(() => "");
  // Look near "Estimeret værdi" / "pris"
  const lines = body.split("\n").map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (/estimeret|værdi|prisoverslag|tilbud/i.test(lines[i])) {
      for (let j = i; j < Math.min(i + 4, lines.length); j++) {
        const amount = parseDkkAmount(lines[j]);
        if (amount && amount >= 100) return amount;
      }
    }
  }

  // Fallback: any currency-looking number in prominent elements
  const candidates = page.locator("h1, h2, h3, [class*='price'], [class*='Price']");
  const count = await candidates.count().catch(() => 0);
  for (let i = 0; i < Math.min(count, 20); i++) {
    const text = await candidates.nth(i).innerText().catch(() => "");
    const amount = parseDkkAmount(text);
    if (amount && amount >= 100) return amount;
  }

  return null;
}

export const swappieAdapter: PartnerAdapter = {
  id: "swappie",
  fetchQuote: fetchSwappieQuote,
};
