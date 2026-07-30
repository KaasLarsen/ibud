# Partner robots.txt og ToS-gennemgang

Gennemgang udført: juli 2026. Opdater ved ændringer i partner-politikker.

## Oversigt

| Partner | robots.txt | Scraping-policy i kode | Vurdering |
|---------|------------|------------------------|-----------|
| Green | [green.dk/robots.txt](https://green.dk/robots.txt) | `caution` | Shopify-agent-politik advarer mod browser-automation på checkout. Vi henter kun bud fra salg-side (`/pages/saelg-iphone`), ikke checkout. Kontakt anbefales. |
| Swappie | [swappie.com/robots.txt](https://swappie.com/robots.txt) | `allowed` | Ingen eksplicit forbud mod salg-sider. Blokerer wp-admin og filtrerede URL'er. |
| GreenMind | [greenmind.dk/robots.txt](https://greenmind.dk/robots.txt) | `allowed` | Disallow checkout/cart/account — salg-flow er tilladt. |
| PhoneHero | Ingen robots.txt (404) | `caution` | Ukendt — kontakt partner for afklaring. |
| Phonetrade | [phonetrade.dk/robots.txt](https://phonetrade.dk/robots.txt) | `caution` | Samme Shopify-agent-politik som Green. |
| MiPhone | [miphone.dk/robots.txt](https://miphone.dk/robots.txt) | `allowed` | `Disallow:` tom — alt tilladt for crawlers. |

## Tekniske tiltag i iBud

- Identificerbar User-Agent: `iBudBot/1.0 (+https://ibud.dk; info@ibud.dk)`
- Cache TTL: 8 timer (reducerer gentagne kald)
- Rate limiting på API: 30 req/min per IP (batch), 60 req/min (per partner)
- Ingen syntetiske fallback-priser i production (`SCRAPER_MODE=live`)
- Partnere med `scrapingPolicy: disabled` i [catalog.ts](../src/lib/quotes/catalog.ts) springes over

## Shopify-partnere (Green, Phonetrade)

robots.txt indeholder agent-instruktioner:

- Checkout og betaling må ikke automatiseres
- UCP/MCP-endpoints anbefales til agenter
- Kontakt: bots@shopify.com

**Vores brug:** Vi navigerer salg-wizards for at læse estimerede bud — vi gennemfører ikke checkout eller betaling. Dette er en grå zone; partner-outreach anbefales.

## Handling ved partner-reaktion

1. **IP-blokering** — stop scraping den partner, vis kun deep link
2. **Juridisk brev** — stop scraping med det, svar inden 48 timer
3. **Partner siger ja** — dokumentér tilladelse, overvej officielt API/feed

Sæt `scrapingPolicy: "disabled"` i catalog for at deaktivere scraping for en partner.
