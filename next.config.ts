import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core", "playwright"],
  env: {
    // Kræves af @sparticuz/chromium før modul-load på Vercel/Lambda
    AWS_LAMBDA_JS_RUNTIME: process.env.AWS_LAMBDA_JS_RUNTIME ?? "nodejs22.x",
  },
};

export default nextConfig;
