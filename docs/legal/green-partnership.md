# Green.dk via Partner-Ads

Aftale: Partner-Ads-program (partnerid `57214`). Provision: **8 % af salg** (køb i Green-shoppen), ikke for trade-in/opkøb alene.

## Tracking (i brug)

Alle “Gå til Green”-links wraps:

`https://www.partner-ads.com/dk/c/p/57214/b/109463/` + destination  
fx `…/https://green.dk/pages/saelg-iphone-15-pro`

Kode: [`src/lib/partners/green/tracking.ts`](../../src/lib/partners/green/tracking.ts)

Override (valgfri): `GREEN_PARTNER_ADS_PREFIX`

## Product feed (brugt til `/koeb-iphone`)

Feed-URL (shop-katalog / refurbished til salg):

`https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=57214&bannerid=109386&feedid=3564`

Indeholder **salgspriser**, ikke opkøbsbud. iBud parser feedet i
[`src/lib/partners/green/feed.ts`](../../src/lib/partners/green/feed.ts)
og viser iPhones på `/koeb-iphone`. `vareurl` i feedet er allerede
Partner-Ads-tracket (klikbanner) — dobbelt-wrap ikke.

Sælg-sammenligningen (`/`, `/resultat`) bruger stadig scrape/estimat til
opkøbsbud.

## Succesmål

Se [docs/buy-metrics.md](../buy-metrics.md).

## Forventning

Bruger klikker via tracking → sætter cookie → hvis de **køber** noget hos Green inden for cookie-vinduet, krediteres 8 %. Kun “sælg telefon” uden køb = ingen provision.
