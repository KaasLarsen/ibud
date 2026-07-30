# iBud — deploy notes

## Next.js (Vercel)

1. Push repo to GitHub and import in Vercel.
2. Set environment variables:
   - `SCRAPER_MODE=live` (**krævet** i production — aldrig `mock`)
   - `WORKER_URL=https://your-worker.example.com` (**krævet** — uden worker = ingen priser)
   - `WORKER_SECRET=...`
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.dk`
3. Deploy. Vercel kører kun Next.js — Playwright må **ikke** køre på Vercel serverless.
4. Syntetiske/fabricerede priser er deaktiveret. Uden live scrape får brugeren “Ikke tilgængelig”.

## Playwright worker (Railway / Fly / Docker)

Workeren i `/worker` åbner Chromium og henter bud fra partnernes sælg-flows.

```bash
# Local
SCRAPER_MODE=live WORKER_SECRET=dev npm run worker
```

Dockerfile (allerede i repo-roden):

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

Sæt samme `WORKER_SECRET` på Vercel og worker-hosten. Sæt `WORKER_URL` på Vercel til workerens offentlige URL.

## Supabase

Run `supabase/schema.sql` in the SQL editor, then add the URL + service role key to Vercel and locally.
