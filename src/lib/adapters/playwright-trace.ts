/**
 * Force Vercel/NFT to include playwright-core metadata in the serverless bundle.
 * Also keep a local copy so require() succeeds even if node_modules tracing misses it.
 */
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("playwright-core/browsers.json");
} catch {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./browsers.json");
}
