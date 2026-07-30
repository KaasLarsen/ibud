# iBud — deploy notes

## Next.js (Vercel)

1. Push til GitHub — Vercel deployer automatisk.
2. Environment:
   - `SCRAPER_MODE=live` (mock ignoreres alligevel på Vercel)
   - `AWS_LAMBDA_JS_RUNTIME=nodejs22.x`
   - `WORKER_URL` + `WORKER_SECRET` (**krævet for rigtige priser** — se nedenfor)
   - `NEXT_PUBLIC_SITE_URL=https://ibud.dk`
3. Syntetiske priser er deaktiveret. Fejl → “Ikke tilgængelig”.

## Playwright worker (påkrævet i production)

Partner-sites (Swappie/Green) kører Cloudflare bot-check. Vercel’s serverless-IP’er bliver blokeret, så live scrape **skal** køre på en dedikeret worker.

### Railway (anbefalet)

1. Gå til [railway.app/new](https://railway.app/new) → Deploy from GitHub repo `KaasLarsen/ibud`
2. Railway bruger `Dockerfile` + `railway.toml` i repo-roden
3. Sæt variables på worker-servicen:
   - `SCRAPER_MODE=live`
   - `WORKER_SECRET=<lang-hemmelighed>`
   - `PORT=8787`
4. Generér public domain under Settings → Networking
5. På Vercel-projektet `brugt` sæt:
   - `WORKER_URL=https://<din-railway-domain>`
   - `WORKER_SECRET=<samme-hemmelighed>`
6. Redeploy Vercel

### Lokal worker

```bash
SCRAPER_MODE=live WORKER_SECRET=dev npm run worker
# Peg evt. WORKER_URL=http://localhost:8787 i .env.local
```

## Supabase

Run `supabase/schema.sql` in the SQL editor, then add the URL + service role key to Vercel and locally.
