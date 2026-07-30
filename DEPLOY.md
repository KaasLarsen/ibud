# MestFor — deploy notes

## Next.js (Vercel)

1. Push repo to GitHub and import in Vercel.
2. Set environment variables:
   - `SCRAPER_MODE=live` (or `mock` until worker is ready)
   - `WORKER_URL=https://your-worker.example.com`
   - `WORKER_SECRET=...`
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.dk`
3. Deploy. Vercel runs the Next.js app only — Playwright should not run on Vercel serverless.

## Playwright worker (Railway / Fly / Docker)

The worker in `/worker` opens Chromium and hits partner sell-flows.

```bash
# Local
SCRAPER_MODE=live WORKER_SECRET=dev npm run worker
```

Dockerfile example (Railway/Fly):

```dockerfile
FROM mcr.microsoft.com/playwright:v1.62.0-jammy
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV PORT=8787
ENV SCRAPER_MODE=live
CMD ["npx", "tsx", "worker/server.ts"]
```

Set the same `WORKER_SECRET` on Vercel and the worker host.

## Supabase

Run `supabase/schema.sql` in the SQL editor, then add the URL + service role key to Vercel and locally.
