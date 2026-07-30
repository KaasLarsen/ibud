import type { Metadata } from "next";
import { company, companyIdentification } from "@/lib/site/company";

export const metadata: Metadata = {
  title: "Privatlivspolitik",
  description: "Privatlivspolitik for iBud.dk.",
};

export default function PrivacyPage() {
  return (
    <article className="content-page">
      <header className="content-hero">
        <p className="eyebrow">Juridisk</p>
        <h1>Privatlivspolitik</h1>
        <p className="lede">
          Vi behandler så lidt data som muligt for at levere tjenesten.
        </p>
      </header>

      <section className="content-block">
        <h2>Dataansvarlig</h2>
        <p>{companyIdentification()}</p>
        <p>
          E-mail: <a href={`mailto:${company.email}`}>{company.email}</a>
        </p>
      </section>

      <section className="content-block">
        <h2>Hvilke data?</h2>
        <ul className="plain-list">
          <li>
            Oplysninger du indtaster om din iPhone (model, lager, stand) for at
            hente bud.
          </li>
          <li>
            Tekniske data som IP-adresse og browseroplysninger i serverlogs
            (sikkerhed, fejlfinding og rate limiting).
          </li>
          <li>
            E-mail og indhold, hvis du skriver til os på {company.email}.
          </li>
        </ul>
        <p>
          Vi indsamler ikke navn, adresse eller betalingsoplysninger. Salget af
          din telefon sker direkte med det sted, du klikker videre til.
        </p>
      </section>

      <section className="content-block">
        <h2>Formål</h2>
        <p>
          At vise dig rangerede bud, forbedre tjenesten og svare på
          henvendelser. Vi sælger ikke personoplysninger.
        </p>
      </section>

      <section className="content-block">
        <h2>Underleverandører</h2>
        <p>
          Vi bruger følgende tjenester til hosting og drift. De kan behandle
          tekniske data på vores vegne:
        </p>
        <ul className="plain-list">
          <li>
            <strong>Vercel</strong> — hosting af websitet og API (USA/EU,
            databehandleraftale).
          </li>
          <li>
            <strong>Supabase</strong> — cache af bud og anonyme søgelogs (EU/US,
            databehandleraftale).
          </li>
        </ul>
        <p>
          Partner-sider du klikker videre til (Swappie, Green, GreenMind osv.)
          behandler data under deres egne vilkår.
        </p>
      </section>

      <section className="content-block">
        <h2>Opbevaring</h2>
        <ul className="plain-list">
          <li>
            Søgeresultater gemmes midlertidigt i din browser (sessionStorage) og
            slettes, når du lukker fanen.
          </li>
          <li>
            Cache af bud hos os opbevares i op til 8 timer for at undgå
            unødige gentagne kald til partner-sider.
          </li>
          <li>
            Anonyme søgelogs (model, stand, resultater) slettes automatisk
            efter 90 dage.
          </li>
          <li>
            Serverlogs (IP, fejl) slettes efter 30 dage.
          </li>
          <li>Kontaktmails slettes, når de ikke længere er relevante.</li>
        </ul>
      </section>

      <section className="content-block">
        <h2>Dine rettigheder</h2>
        <p>
          Du kan bede om indsigt, rettelse eller sletning af data, vi måtte have
          om dig. Kontakt{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a>. Du kan også
          klage til Datatilsynet (datatilsynet.dk).
        </p>
      </section>
    </article>
  );
}
