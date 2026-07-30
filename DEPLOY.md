# iBud — deploy notes

## Next.js (Vercel)

1. Push til GitHub — Vercel deployer automatisk.
2. Environment variables:
   - `SCRAPER_MODE=live` (**krævet** — aldrig `mock` i production)
   - `AWS_LAMBDA_JS_RUNTIME=nodejs22.x` (til `@sparticuz/chromium`)
   - `NEXT_PUBLIC_SITE_URL=https://ibud.dk`
   - Supabase + Partner-Ads efter behov
3. Live scrape kører **direkte på Vercel** via `@sparticuz/chromium` + `playwright-core` (60s / 1024 MB på quote-routes).
4. Syntetiske priser er deaktiveret. Fejl → “Ikke tilgængelig”.

### Valgfri remote worker

Hvis serverless Chromium er for stram, kan du stadig pege på en Docker-worker:

```bash
SCRAPER_MODE=live WORKER_SECRET=dev npm run worker
```

Sæt `WORKER_URL` + `WORKER_SECRET` på Vercel. Dockerfile ligger i repo-roden.

## Supabase

Run `supabase/schema.sql` in the SQL editor, then add the URL + service role key to Vercel and locally.
