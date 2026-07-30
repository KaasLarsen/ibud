import type { Metadata } from "next";
import Link from "next/link";
import { SellWizard } from "@/components/SellWizard";
import { FaqSection } from "@/components/SeoContent";
import {
  getModelById,
  IPHONE_MODELS,
  POPULAR_MODELS,
} from "@/lib/quotes/catalog";
import { GUIDES } from "@/lib/seo/guides";
import { groupModelsByGeneration } from "@/lib/seo/model-content";

export const metadata: Metadata = {
  title: "Sælg iPhone — sammenlign bud",
  description:
    "Sælg din brugte iPhone i Danmark. iBud sammenligner bud fra flere købere og viser det bedste først — du handler direkte med stedet.",
};

const hubFaqs = [
  {
    question: "Hvor kan jeg sælge min iPhone?",
    answer:
      "Du kan sælge privat, bytte i butik eller sælge til en professionel køber. På iBud sammenligner du estimater fra flere steder og vælger det bud, der passer dig.",
  },
  {
    question: "Køber iBud min iPhone?",
    answer:
      "Nej. iBud køber ikke din telefon. Vi pejer dig videre til det sted, der byder højest på dit estimat.",
  },
  {
    question: "Er buddene bindende?",
    answer:
      "Nej. Buddene er estimater. Den endelige pris aftales typisk efter, at stedet har inspiceret telefonen.",
  },
];

export default function SaelgIphoneHubPage() {
  const popular = POPULAR_MODELS.map((id) => getModelById(id)!).filter(Boolean);
  const groups = groupModelsByGeneration(IPHONE_MODELS);

  return (
    <div className="how-page">
      <section className="hero hero-top how-hero">
        <div className="hero-copy">
          <p className="eyebrow">Sælg iPhone</p>
          <h1>Sælg din iPhone — se bud lige nu</h1>
          <p className="lede">
            Søg din model. Vi finder buddene fra flere danske købere og viser
            det bedste først.
          </p>
        </div>
        <SellWizard />
      </section>

      <article className="content-page how-rest">
        <section className="content-block">
          <h2>Populære modeller</h2>
          <p>
            Gå direkte til din model, eller søg ovenfor. Hver side har wizard
            klar med modellen valgt.
          </p>
          <ul className="model-chip-grid">
            {popular.map((model) => (
              <li key={model.id}>
                <Link href={`/saelg-iphone/${model.id}`}>{model.name}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="content-block">
          <h2>Alle modeller</h2>
          <p>
            Vælg din iPhone nedenfor. Vi understøtter modeller fra SE til de
            nyeste Pro Max-varianter.
          </p>
          <div className="model-groups">
            {groups.map((group) => (
              <div key={group.title} className="model-group">
                <h3>{group.title}</h3>
                <ul className="model-link-list">
                  {group.models.map((model) => (
                    <li key={model.id}>
                      <Link href={`/saelg-iphone/${model.id}`}>
                        Sælg {model.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="content-block">
          <h2>Guides før du sælger</h2>
          <p>
            Kort og konkret — så du ved, hvad der påvirker prisen, og hvordan
            handlen foregår.
          </p>
          <ul className="guide-card-list">
            {GUIDES.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`}>
                  <span className="guide-card-title">{guide.title}</span>
                  <span className="guide-card-meta">{guide.minutes} min</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <FaqSection items={hubFaqs} />
      </article>
    </div>
  );
}
