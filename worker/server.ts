import { createServer } from "http";
import {
  fetchAllQuotes,
  fetchPartnerQuoteLive,
  mockQuote,
} from "../src/lib/adapters";
import { isMockMode } from "../src/lib/adapters/scraper-config";
import { PARTNER_IDS } from "../src/lib/quotes/catalog";
import { quoteRequestSchema } from "../src/lib/quotes/schema";
import type { PartnerId, QuoteResult } from "../src/lib/quotes/types";

const port = Number(process.env.PORT ?? 8787);
const secret = process.env.WORKER_SECRET;

const server = createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "POST" && req.url === "/quote") {
    if (secret) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${secret}`) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }

    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    const raw = body as { partnerId?: string };
    const parsed = quoteRequestSchema.safeParse(body);
    if (!parsed.success) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid request" }));
      return;
    }

    const partnerId = raw.partnerId as PartnerId | undefined;
    if (partnerId && !PARTNER_IDS.includes(partnerId)) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Unknown partner" }));
      return;
    }

    try {
      let quotes: QuoteResult[];

      if (partnerId) {
        const quote = isMockMode()
          ? mockQuote(partnerId, parsed.data)
          : await fetchPartnerQuoteLive(partnerId, parsed.data);
        quotes = [quote];
      } else {
        quotes = await fetchAllQuotes(parsed.data);
      }

      res.writeHead(200);
      res.end(JSON.stringify({ quotes }));
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: "Scrape failed" }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`Quote worker listening on :${port}`);
});
