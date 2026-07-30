import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Om os",
  description:
    "iBud hjælper dig med at finde det bedste bud, når du skal sælge din brugte iPhone i Danmark.",
};

export default function AboutPage() {
  return (
    <article className="content-page">
      <header className="content-hero">
        <p className="eyebrow">Om os</p>
        <h1>Vi pejer dig det rigtige sted hen</h1>
        <p className="lede">
          iBud er lavet til én ting: at gøre det nemt at sælge din brugte iPhone
          dér, hvor du får mest.
        </p>
      </header>

      <section className="content-block">
        <h2>Hvorfor iBud?</h2>
        <p>
          Der findes masser af steder online, hvor du kan sælge din iPhone. Som
          sælger skal du normalt tjekke dem én for én og huske, hvem der bød
          højest. Det er tidskrævende — og nemt at overse et bedre bud.
        </p>
        <p>
          Vi samler estimaterne, rangerer dem og sender dig videre med et klart
          svar. Du handler stadig direkte med stedet. Vi står midt imellem som
          pegepind — ikke som køber.
        </p>
      </section>

      <section className="content-block">
        <h2>Hvad vi ikke er</h2>
        <ul className="plain-list">
          <li>Vi køber ikke din telefon.</li>
          <li>Vi er ikke en markedsplads mellem private.</li>
          <li>
            Vi garanterer ikke den endelige udbetaling — det gør stedet, du
            sælger til.
          </li>
        </ul>
      </section>

      <section className="content-block">
        <h2>Kontakt</h2>
        <p>
          Spørgsmål, feedback eller pressen? Skriv til{" "}
          <a href="mailto:info@ibud.dk">info@ibud.dk</a>.
        </p>
        <Link href="/kontakt" className="text-link">
          Gå til kontaktsiden →
        </Link>
      </section>
    </article>
  );
}
