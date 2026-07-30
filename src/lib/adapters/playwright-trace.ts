/**
 * Force NFT/Vercel file tracing to include playwright-core metadata.
 * Without this, serverless boots fail on missing browsers.json (Playwright ≥1.60).
 */
import browsers from "playwright-core/browsers.json";

void browsers;
