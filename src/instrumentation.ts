export async function register() {
  // Must be set before @sparticuz/chromium initializes on Vercel/Lambda
  process.env.AWS_LAMBDA_JS_RUNTIME ??= "nodejs22.x";
}
