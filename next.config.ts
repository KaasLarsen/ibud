import type { NextConfig } from "next";

const chromiumIncludes = [
  "./node_modules/playwright-core/**/*",
  "./node_modules/@sparticuz/chromium/**/*",
  "./node_modules/@sparticuz/chromium-min/**/*",
];

const nextConfig: NextConfig = {
  // Keep chromium external so Next doesn't try to bundle the binary.
  // playwright-core must be traced (see outputFileTracingIncludes) for browsers.json.
  serverExternalPackages: ["@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/quotes/partner": chromiumIncludes,
    "/api/quotes": chromiumIncludes,
    "/src/app/api/quotes/partner/route": chromiumIncludes,
    "/src/app/api/quotes/route": chromiumIncludes,
  },
  env: {
    AWS_LAMBDA_JS_RUNTIME: process.env.AWS_LAMBDA_JS_RUNTIME ?? "nodejs22.x",
  },
};

export default nextConfig;
