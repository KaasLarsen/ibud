import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Cookiepolitik for iBud.dk.",
};

export default function CookiesPage() {
  return (
    <article className="content-page">
      <header className="content-hero">
        <p className="eyebrow">Juridisk</p>
        <h1>Cookies</h1>
        <p className="lede">
          Kort fortalt: vi bruger det, der er nødvendigt for at sitet virker.
        </p>
      </header>

      <section className="content-block">
        <h2>Hvad er cookies?</h2>
        <p>
          Cookies er små filer, der gemmes i din browser. De kan huske valg,
          holde sessioner kørende eller hjælpe med statistik.
        </p>
      </section>

      <section className="content-block">
        <h2>Hvad bruger iBud?</h2>
        <ul className="plain-list">
          <li>
            <strong>Nødvendige:</strong> så siden fungerer (fx midlertidig lagring
            af dit søgeresultat i sessionen).
          </li>
          <li>
            <strong>Statistik:</strong> Google Analytics (GA4) til anonyme
            målinger af brug, så vi kan forbedre sitet.
          </li>
          <li>
            <strong>Partnere:</strong> når du klikker videre til fx Green via
            Partner-Ads, kan der sættes cookies hos dem til at tilskrive et
            eventuelt køb (affiliate).
          </li>
        </ul>
        <p>
          Vi sælger ikke dine data. De steder, du klikker videre til, har deres
          egne cookiepolitikker.
        </p>
      </section>

      <section className="content-block">
        <h2>Spørgsmål</h2>
        <p>
          Skriv til <a href="mailto:info@ibud.dk">info@ibud.dk</a>.
        </p>
      </section>
    </article>
  );
}
