import type { Metadata } from "next";
import { company, companyIdentification } from "@/lib/site/company";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontakt iBud — skriv til info@ibud.dk.",
};

export default function ContactPage() {
  return (
    <article className="content-page">
      <header className="content-hero">
        <p className="eyebrow">Kontakt</p>
        <h1>Skriv til os</h1>
        <p className="lede">
          Feedback, fejl i et bud, partnerskaber eller bare et spørgsmål — vi
          svarer så hurtigt vi kan.
        </p>
      </header>

      <section className="content-block contact-card">
        <h2>E-mail</h2>
        <a className="contact-mail" href={`mailto:${company.email}`}>
          {company.email}
        </a>
        <p className="muted">
          Fortæl gerne hvilken iPhone-model det drejer sig om, hvis dit
          spørgsmål handler om et konkret bud.
        </p>
      </section>

      <section className="content-block">
        <h2>Virksomhed</h2>
        <p>{companyIdentification()}</p>
      </section>

      <section className="content-block">
        <h2>Svartid</h2>
        <p>
          Vi sigter efter svar inden for 1–2 hverdage. I travle perioder kan det
          tage lidt længere.
        </p>
      </section>
    </article>
  );
}
