# Partner-outreach — skabeloner

Brug disse skabeloner når du kontakter buy-back-partnere. Tilpas med dit firmanavn og CVR.

---

## E-mail-skabelon (dansk)

**Emne:** iBud.dk — sammenligningstjeneste der sender sælgere til dig

Hej,

Jeg hedder [navn] og driver iBud.dk — en dansk sammenligningstjeneste, hvor folk kan se estimerede bud på deres brugte iPhone fra flere indkøbere, rangeret efter beløb.

Vi køber ikke telefoner selv. Brugeren klikker videre til jeres salg-flow og handler direkte med dig.

**Hvorfor jeg skriver:**
Vi henter i dag estimerede bud automatisk fra jeres offentlige salg-side for at vise dem i sammenligningen. Jeg vil gerne afklare, om det er OK for jer — eller om I foretrækker en anden måde (API, datafeed, affiliate-link).

**Hvad vi kan tilbyde:**
- Gratis henvisning af sælgere til jeres indkøbsflow
- Tydelig markering som tredjepart (ikke partnerskab/endorsement)
- Mulighed for at stoppe scraping med det, hvis I ønsker det

**Spørgsmål:**
1. Er det OK at vise jeres estimerede bud på iBud.dk?
2. Har I et API eller feed vi kan bruge i stedet for automatisk indlæsning?
3. Har I et affiliate- eller henvisningsprogram vi kan tilknytte?

Med venlig hilsen
[navn]
[Firmanavn] · CVR [nummer]
info@ibud.dk · https://ibud.dk

---

## Kontaktliste

| Partner | Salg-side | Kontakt (find på deres site) |
|---------|-----------|------------------------------|
| Green | https://green.dk/pages/saelg-iphone | Partner-Ads aktiv (se green-partnership.md) |
| Swappie | https://swappie.com/dk/saelg/iphone/ | partners@swappie.com (tjek site) |
| GreenMind | https://greenmind.dk/saelg-din-enhed | kontakt via site |
| PhoneHero | https://phonehero.dk/saelg-din-gamle-mobil-til-os | kontakt via site |
| Phonetrade | https://phonetrade.dk/pages/saelg-iphone | kontakt via site |
| MiPhone | https://miphone.dk/saelg/ | kontakt via site |

**Tip:** Find korrekte kontakt-e-mails på hver partners kontakt/partnerside før du sender.

---

## Efter svar

| Svar | Handling |
|------|----------|
| Ja / API tilgængeligt | Implementér officiel datakilde, dokumentér aftale |
| Ja til visning, nej til scraping | Skift til manual/API, sæt scrapingPolicy |
| Nej | Sæt `scrapingPolicy: "disabled"`, vis kun deep link |
| Ingen svar (14 dage) | Fortsæt med scraping + dokumenter i partner-tos-review.md |

Log alle svar i denne fil eller et separat spreadsheet.
