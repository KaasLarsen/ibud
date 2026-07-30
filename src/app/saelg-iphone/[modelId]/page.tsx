import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SellWizard } from "@/components/SellWizard";
import { FaqSection } from "@/components/SeoContent";
import {
  getModelById,
  IPHONE_MODELS,
  POPULAR_MODELS,
} from "@/lib/quotes/catalog";
import { formatStorage } from "@/lib/quotes/format";
import { modelFaqs, modelPageCopy } from "@/lib/seo/model-content";

type Props = {
  params: Promise<{ modelId: string }>;
};

export function generateStaticParams() {
  return IPHONE_MODELS.map((model) => ({ modelId: model.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modelId } = await params;
  const model = getModelById(modelId);
  if (!model) return { title: "Sælg iPhone" };
  const copy = modelPageCopy(model);
  return {
    title: copy.title,
    description: copy.description,
  };
}

export default async function SaelgIphoneModelPage({ params }: Props) {
  const { modelId } = await params;
  const model = getModelById(modelId);
  if (!model) notFound();

  const copy = modelPageCopy(model);
  const faqs = modelFaqs(model);
  const related = POPULAR_MODELS.map((id) => getModelById(id)!)
    .filter(Boolean)
    .filter((m) => m.id !== model.id)
    .slice(0, 5);

  return (
    <div className="how-page">
      <section className="hero hero-top how-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <Link href="/saelg-iphone" className="crumb-link">
              Sælg iPhone
            </Link>
            {" / "}
            {model.name}
          </p>
          <h1>Sælg {model.name} — se bud lige nu</h1>
          <p className="lede">{copy.lede}</p>
        </div>
        <SellWizard initialModelId={model.id} />
      </section>

      <article className="content-page how-rest">
        <section className="content-block">
          <h2>Hvor får du mest for din {model.name}?</h2>
          <p>{copy.about}</p>
          <p>{copy.storageNote}</p>
        </section>

        <section className="content-block">
          <h2>Lagerstørrelser</h2>
          <ul className="storage-pill-list">
            {model.storageOptions.map((gb) => (
              <li key={gb}>{formatStorage(gb)}</li>
            ))}
          </ul>
          <p>
            Vælg den størrelse, din telefon har, i wizard’en ovenfor — så matcher
            buddene din konkrete model.
          </p>
        </section>

        <section className="content-block note-block">
          <h2>Godt at vide</h2>
          <ul className="plain-list">
            <li>Buddene er estimater. Endelig pris aftales efter inspektion.</li>
            <li>iBud køber ikke selv din iPhone.</li>
            <li>
              Læs mere om{" "}
              <Link href="/guides/stand-ved-salgsvurdering">stand</Link> og{" "}
              <Link href="/guides/hvad-er-min-iphone-vaerd">værdi</Link>.
            </li>
          </ul>
        </section>

        <FaqSection items={faqs} />

        {related.length > 0 && (
          <section className="content-block">
            <h2>Andre populære modeller</h2>
            <ul className="model-chip-grid">
              {related.map((m) => (
                <li key={m.id}>
                  <Link href={`/saelg-iphone/${m.id}`}>{m.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/saelg-iphone">Alle modeller</Link>
              </li>
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
