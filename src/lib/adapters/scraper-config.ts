/** Identificerbar bot UA — kontakt i user-agent strengen. */
export const SCRAPER_USER_AGENT =
  "iBudBot/1.0 (+https://ibud.dk; info@ibud.dk) Playwright";

export function isMockMode(): boolean {
  return process.env.SCRAPER_MODE === "mock";
}

/** Vercel/serverless har ikke Chromium — Playwright må ikke køres her. */
export function isServerlessRuntime(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

export function hasWorker(): boolean {
  return Boolean(process.env.WORKER_URL?.trim());
}

/**
 * Live scrape er muligt når:
 * - eksplicit mock er slået fra, OG
 * - enten remote worker findes, eller vi ikke er på serverless
 */
export function canScrapeLive(): boolean {
  if (isMockMode()) return false;
  return hasWorker() || !isServerlessRuntime();
}
