import type { Metadata } from "next";
import Link from "next/link";
import { SellWizard } from "@/components/SellWizard";

export const metadata: Metadata = {
  title: "Sådan virker det",
  description:
    "Søg din iPhone og se det bedste bud først. iBud pejer dig det rigtige sted hen.",
};

const steps = [
  {
    n: "01",
    title: "Søg din model",
    text: "Skriv fx “15 Pro”. Vi foreslår modeller undervejs.",
  },
  {
    n: "02",
    title: "Lager og stand",
    text: "Vælg lager og beskriv standen ærligt.",
  },
  {
    n: "03",
    title: "Vi finder budene",
    text: "Vi henter aktuelle estimater for dig.",
  },
  {
    n: "04",
    title: "Bedste bud først",
    text: "Du ser dem, der betaler mest — med link videre.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="how-page">
      <section className="hero hero-top how-hero">
        <div className="hero-copy">
          <p className="eyebrow">Sådan virker det</p>
          <h1>Søg. Få det bedste bud.</h1>
          <p className="lede">Start her — vi pejer dig det rigtige sted hen.</p>
        </div>
        <SellWizard />
      </section>

      <article className="content-page how-rest">
        <section className="steps-grid">
          {steps.map((step) => (
            <div key={step.n} className="step-card">
              <span className="step-n">{step.n}</span>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </div>
          ))}
        </section>

        <section className="content-block note-block">
          <h2>Godt at vide</h2>
          <ul className="plain-list">
            <li>Budene er estimater. Endelig pris aftales efter inspektion.</li>
            <li>iBud køber ikke selv din iPhone.</li>
          </ul>
        </section>

        <div className="content-cta-row">
          <Link href="/kontakt" className="text-link">
            Spørgsmål? info@ibud.dk
          </Link>
        </div>
      </article>
    </div>
  );
}
