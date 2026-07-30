# Juridisk gennemgang — checklist før stor trafik

**Dette er en intern checklist — ikke juridisk rådgivning.**

Book 1–2 timer med en dansk advokat med erfaring i IT/forbrugerret. Brug denne liste som agenda.

## Firma og identifikation

- [ ] CVR, firmanavn og adresse er korrekt i footer og privatlivspolitik
- [ ] `COMPANY_CVR` og `COMPANY_ADDRESS` er sat i production-miljø
- [ ] E-handelsidentifikation opfylder krav for erhvervsdrivende online

## Sammenligningstjeneste

- [ ] Positionering som pegepind (ikke køber) er tydelig på site
- [ ] Ingen påstand om officielt partnerskab med buy-back-sider
- [ ] Estimater er tydeligt markeret som vejledende
- [ ] Ingen syntetiske priser i production (SCRAPER_MODE=live)

## Scraping og data

- [ ] Advokat gennemgår Playwright-scraping mod partner-sider
- [ ] robots.txt/ToS-vurdering for hver partner (se partner-tos-review.md)
- [ ] Plan for reaktion ved cease & desist
- [ ] Partner-outreach sendt eller planlagt (se partner-outreach.md)

## GDPR

- [ ] Privatlivspolitik dækker underleverandører (Vercel, Supabase)
- [ ] Retention-perioder er defineret og implementeret
- [ ] Databehandleraftaler med Vercel og Supabase er på plads
- [ ] Proces for indsigt/sletning via info@ibud.dk

## Forbrugerret

- [ ] Markedsføringsloven: ingen vildledende prissammenligning
- [ ] Disclaimers om endelig pris efter inspektion er synlige
- [ ] Cache/freshness vises på resultatsiden

## Anbefalede advokat-specialer

- IT-ret / internetjura
- Forbrugerret og markedsføringsloven
- GDPR/databeskyttelse

## Efter mødet

- [ ] Notér advokatens konklusioner her eller i et separat dokument
- [ ] Implementér eventuelle ændringer inden marketing/paid trafik
- [ ] Sæt dato for næste gennemgang (fx ved nye partnere eller skaleret scraping)
