# Green.dk via Partner-Ads

Aftale: Partner-Ads-program (partnerid `57214`). Provision: **8 % af salg** (køb i Green-shoppen), ikke for trade-in/opkøb alene.

## Tracking (i brug)

Alle “Gå til Green”-links wraps:

`https://www.partner-ads.com/dk/c/p/57214/b/109463/` + destination  
fx `…/https://green.dk/pages/saelg-iphone-15-pro`

Kode: [`src/lib/partners/green/tracking.ts`](../../src/lib/partners/green/tracking.ts)

Override (valgfri): `GREEN_PARTNER_ADS_PREFIX`

## Product feed (ikke brugt til bud)

Feed-URL (shop-katalog / refurbished til salg):

`https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=57214&bannerid=109386&feedid=3564`

Indeholder **salgspriser**, ikke opkøbsbud. iBud bruger stadig scrape/estimat til “sælg din iPhone”-sammenligning.

## Forventning

Bruger klikker via tracking → sætter cookie → hvis de **køber** noget hos Green inden for cookie-vinduet, krediteres 8 %. Kun “sælg telefon” uden køb = ingen provision.
