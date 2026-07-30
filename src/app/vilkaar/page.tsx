import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilkår",
  description: "Brugsvilkår for iBud.dk.",
};

export default function TermsPage() {
  return (
    <article className="content-page">
      <header className="content-hero">
        <p className="eyebrow">Juridisk</p>
        <h1>Vilkår</h1>
        <p className="lede">
          Ved at bruge iBud accepterer du disse enkle vilkår.
        </p>
      </header>

      <section className="content-block">
        <h2>Tjenesten</h2>
        <p>
          iBud hjælper dig med at finde og sammenligne estimerede bud på brugte
          iPhones. Vi køber ikke selv din telefon og indgår ikke købsaftale med
          dig.
        </p>
      </section>

      <section className="content-block">
        <h2>Estimater</h2>
        <p>
          Beløb på iBud er vejledende og hentes fra tredjeparts sites, når det
          er teknisk muligt. Vi viser ikke opdigtede priser — hvis et bud ikke
          kan hentes, viser vi kun et link videre til partneren. Den endelige
          pris aftales mellem dig og stedet, du sælger til, efter deres
          vurdering. iBud er ikke ansvarlig for ændrede priser, afviste enheder
          eller udbetalingsvilkår hos dem.
        </p>
      </section>

      <section className="content-block">
        <h2>Links videre</h2>
        <p>
          Når du klikker videre, gælder stedets egne vilkår, privatlivspolitik
          og cookies. Læs dem, før du sender din telefon.
        </p>
      </section>

      <section className="content-block">
        <h2>Kontakt</h2>
        <p>
          <a href="mailto:info@ibud.dk">info@ibud.dk</a>
        </p>
      </section>
    </article>
  );
}
