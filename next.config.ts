import type { NextConfig } from "next";

const chromiumIncludes = [
  "./node_modules/playwright-core/**/*",
  "./node_modules/@sparticuz/chromium/**/*",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/quotes/partner": chromiumIncludes,
    "/api/quotes": chromiumIncludes,
  },
  env: {
    AWS_LAMBDA_JS_RUNTIME: process.env.AWS_LAMBDA_JS_RUNTIME ?? "nodejs22.x",
  },
};

export default nextConfig;
