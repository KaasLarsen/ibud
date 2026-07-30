import type { Browser, Page } from "puppeteer-core";
import { BROWSER_USER_AGENT } from "./browser-helpers";
import { partnerDeepLink, partnerDestinationUrl } from "../quotes/deep-links";
import { getModelById } from "../quotes/catalog";
import type { PartnerId, QuoteRequest, QuoteResult } from "../quotes/types";
import { baseResult, parseDkkAmount } from "./types";

/**
 * Serverless scrapers via puppeteer-core + @sparticuz/chromium.
 * Playwright adapters bruges lokalt/worker — Puppeteer er mere stabilt på Vercel.
 */

export async function launchServerlessBrowser(): Promise<Browser> {
  // MUST be set before importing @sparticuz/chromium
  process.env.AWS_LAMBDA_JS_RUNTIME = "nodejs22.x";

  const chromium = (await import("@sparticuz/chromium")).default;
  chromium.setGraphicsMode(false);

  const executablePath = await chromium.executablePath();
  if (executablePath) {
    const libDir = executablePath.replace(/\/[^/]+$/, "");
    process.env.LD_LIBRARY_PATH = [libDir, process.env.LD_LIBRARY_PATH]
      .filter(Boolean)
      .join(":");
  }

  const puppeteer = await import("puppeteer-core");
  return puppeteer.default.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport ?? { width: 1280, height: 800 },
    executablePath,
    headless: chromium.headless ?? true,
  });
}

async function newPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  await page.setUserAgent(BROWSER_USER_AGENT);
  await page.setExtraHTTPHeaders({ "Accept-Language": "da-DK,da;q=0.9" });
  return page;
}

export async function fetchPartnerQuoteServerless(
  partnerId: PartnerId,
  request: QuoteRequest,
): Promise<QuoteResult> {
  const browser = await launchServerlessBrowser();
  try {
    const page = await newPage(browser);
    if (partnerId === "swappie") return await scrapeSwappie(page, request);
    if (partnerId === "green") return await scrapeGreen(page, request);
    return baseResult(partnerId, partnerDeepLink(partnerId, request), {
      error: "Live scrape på Vercel understøtter pt. Green og Swappie",
    });
  } finally {
    await browser.close().catch(() => undefined);
  }
}

async function scrapeSwappie(
  page: Page,
  request: QuoteRequest,
): Promise<QuoteResult> {
  const deepLink = partnerDeepLink("swappie", request);
  const url = partnerDestinationUrl("swappie", request);
  const model = getModelById(request.modelId);
  if (!model) {
    return baseResult("swappie", deepLink, { error: "Ukendt model" });
  }

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await sleep(1500);
  await dismissCookies(page);
  await sleep(1500);

  if (!(await waitForEnabledButton(page, /fortsæt/i, 30_000))) {
    return baseResult("swappie", deepLink, {
      error: "Swappie-flow blev ikke klar",
    });
  }
  await clickButton(page, /fortsæt/i);
  await sleep(1500);

  const storageLabel =
    request.storageGb >= 1024
      ? `${request.storageGb / 1024}TB`
      : `${request.storageGb}GB`;

  const selected = await page.evaluate((label) => {
    const input = Array.from(
      document.querySelectorAll('input[type="radio"]'),
    ).find(
      (el) =>
        (el as HTMLInputElement).value.toLowerCase() === label.toLowerCase(),
    ) as HTMLInputElement | undefined;
    if (!input) return false;
    input.click();
    const lab = Array.from(document.querySelectorAll("label")).find(
      (l) => l.textContent?.trim().toLowerCase() === label.toLowerCase(),
    );
    lab?.click();
    return input.checked;
  }, storageLabel);

  if (!selected) {
    return baseResult("swappie", deepLink, {
      error: `Kunne ikke vælge lager ${storageLabel}`,
    });
  }

  let amount: number | null = null;
  for (let i = 0; i < 15; i++) {
    amount = await readSwappieEstimate(page);
    if (amount !== null) break;
    await sleep(400);
  }

  if (amount === null) {
    return baseResult("swappie", deepLink, {
      error: "Kunne ikke læse Swappie-estimat",
    });
  }

  return baseResult("swappie", deepLink, {
    amountDkk: amount,
    rawNotes: "Live estimat fra Swappie (Vercel)",
  });
}

async function scrapeGreen(
  page: Page,
  request: QuoteRequest,
): Promise<QuoteResult> {
  const deepLink = partnerDeepLink("green", request);
  const url = partnerDestinationUrl("green", request);

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await sleep(1000);
  await dismissCookies(page);
  await sleep(800);

  const storageLabels = [
    `${request.storageGb} GB`,
    `${request.storageGb}GB`,
  ];
  for (const label of storageLabels) {
    const clicked = await page.evaluate((text) => {
      const el = Array.from(
        document.querySelectorAll("button, a, label, div, span"),
      ).find((n) => n.textContent?.trim() === text);
      if (el instanceof HTMLElement) {
        el.click();
        return true;
      }
      return false;
    }, label);
    if (clicked) break;
  }

  await sleep(1000);

  let amount: number | null = null;
  for (let i = 0; i < 10; i++) {
    const body = await page.evaluate(() => document.body.innerText);
    amount = readAmountFromText(body);
    if (amount !== null) break;

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        /næste|fortsæt|beregn|se pris|få tilbud/i.test(b.textContent || ""),
      );
      btn?.click();
    });
    await sleep(700);
  }

  if (amount === null) {
    return baseResult("green", deepLink, {
      error: "Kunne ikke læse Green-estimat",
    });
  }

  return baseResult("green", deepLink, {
    amountDkk: amount,
    rawNotes: "Live estimat fra Green (Vercel)",
  });
}

async function dismissCookies(page: Page) {
  await page.evaluate(() => {
    const selectors = [
      "#onetrust-accept-btn-handler",
      "#accept-recommended-btn-handler",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el instanceof HTMLElement) {
        el.click();
        break;
      }
    }
    const buttons = Array.from(document.querySelectorAll("button"));
    const match = buttons.find((b) =>
      /accept all cookies|tillad alle|accepter alle/i.test(b.textContent || ""),
    );
    match?.click();
    const filter = document.querySelector(".onetrust-pc-dark-filter");
    if (filter instanceof HTMLElement) filter.style.display = "none";
    const banner = document.querySelector("#onetrust-banner-sdk");
    if (banner instanceof HTMLElement) banner.style.display = "none";
  });
}

async function waitForEnabledButton(
  page: Page,
  name: RegExp,
  timeoutMs: number,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await page.evaluate((source) => {
      const re = new RegExp(source, "i");
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        re.test((b.textContent || "").trim()),
      );
      return Boolean(btn && !btn.disabled);
    }, name.source);
    if (ok) return true;
    await sleep(300);
  }
  return false;
}

async function clickButton(page: Page, name: RegExp) {
  await page.evaluate((source) => {
    const re = new RegExp(source, "i");
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      re.test((b.textContent || "").trim()),
    );
    if (btn && !btn.disabled) btn.click();
  }, name.source);
}

async function readSwappieEstimate(page: Page): Promise<number | null> {
  const body = await page.evaluate(() => document.body.innerText);
  const match = body.match(/Estimeret værdi[:\s]*([^\n]+)/i);
  if (!match) return null;
  const amount = parseDkkAmount(match[1]);
  return amount && amount >= 100 ? amount : null;
}

function readAmountFromText(body: string): number | null {
  const lines = body.split("\n").map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (/pris|tilbud|værdi|estimat|du får|udbetaling|vi betaler/i.test(lines[i])) {
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const amount = parseDkkAmount(lines[j]);
        if (amount && amount >= 500) return amount;
      }
    }
  }
  return null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
