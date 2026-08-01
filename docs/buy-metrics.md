# Køb-flade — succesmål (MVP)

Målet med `/koeb-iphone` er **henvisning + provision**, ikke at iBud bliver en shop.

## Primære KPI’er (Partner-Ads)

Følg i Partner-Ads for Green (partnerid `57214`, shop-banner/feed):

| Metrik | Hvor | Succes (første 4–6 uger) |
|--------|------|---------------------------|
| Klik til Green fra køb-fladen | Partner-Ads + GA `buy_outbound_click` | Stabil ugentlig volumen |
| Tilskrevne køb / omsætning | Partner-Ads salgsrapport | > 0 tilskrevne ordrer |
| Provision (8 %) | Partner-Ads | Dækker mere end “sælg-klik uden køb” |

Sælg-flow alene giver typisk **ingen** Green-provision — kun hvis brugeren senere køber i shoppen inden for cookie-vinduet.

## Sekundære KPI’er (produkt)

| Metrik | Hvor | Formål |
|--------|------|--------|
| `buy_outbound_click` (GA4) | Google Analytics | Klikkvalitet på kataloget |
| Sidevisninger `/koeb-iphone` | GA4 | Om SEO/nav finder siden |
| Bounce / tid på siden | GA4 | Om filtrene er brugbare |

Event sendes fra [`BuyCatalog`](../src/components/BuyCatalog.tsx) som `buy_outbound_click` med `partner`, `product_id`, `model`, `storage`, `value`.

## Guardrail: sælg må ikke lide

Hold øje med, at køb-CTA’er ikke kannibaliserer kerneflowet:

| Metrik | Forventning |
|--------|-------------|
| Wizard-starts / `/` og `/saelg-iphone` | Stabil eller op |
| Klik “Gå til partner” på `/resultat` | Ikke markant fald efter launch |
| Andel der går `/resultat` → `/koeb-iphone` | OK hvis lille; skadeligt hvis sælg-klik falder meget |

Hvis sælg-konvertering falder markant, skru ned for synlighed (fjern nav midlertidigt, behold kun resultat-CTA).

## Beslutningsregel

- **Fortsæt / udvid** (flere partnere, model-landings): hvis der er tilskrevne køb og sælg-KPI’er er stabile.
- **Pause / justér**: hvis mange klik men 0 salg (feed/links/cookie), eller hvis sælg falder.
