# iBud

Hvor får du mest for din iPhone? Søg din model — iBud scanner Green, Swappie og GreenMind og viser det bedste bud først.

## Udvikling

```bash
cp .env.example .env.local
npm install
npx playwright install chromium
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000).

`SCRAPER_MODE=live` henter bud via Playwright (fallback hvis scrape fejler). Brug `mock` til hurtig UI-udvikling.

## Scripts

- `npm run dev` — Next.js
- `npm run worker` — Playwright quote-worker
- `npm run build` / `npm start`

## Deploy

Se [DEPLOY.md](./DEPLOY.md). Domæne: **ibud.dk**
