/**
 * Force NFT/Vercel file tracing to include playwright-core metadata.
 * Without this, serverless boots fail on missing browsers.json (Playwright ≥1.60).
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("playwright-core/browsers.json");
