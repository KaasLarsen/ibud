/** Identificerbar bot UA — kontakt i user-agent strengen. */
export const SCRAPER_USER_AGENT =
  "iBudBot/1.0 (+https://ibud.dk; info@ibud.dk) Playwright";

/** Vercel/serverless har ikke fuld Chromium — brug @sparticuz/chromium. */
export function isServerlessRuntime(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

/**
 * Mock kun lokalt til UI-udvikling.
 * På Vercel/production er mock ALTID slået fra — rigtige priser eller "ikke tilgængelig".
 */
export function isMockMode(): boolean {
  if (isServerlessRuntime() || process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.SCRAPER_MODE === "mock";
}

export function hasWorker(): boolean {
  return Boolean(process.env.WORKER_URL?.trim());
}

/**
 * Live scrape er muligt når mock er slået fra
 * (lokal Playwright, remote worker, eller serverless Chromium).
 */
export function canScrapeLive(): boolean {
  return !isMockMode();
}
