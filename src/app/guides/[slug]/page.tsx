import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqSection, GuideCta } from "@/components/SeoContent";
import {
  getGuideBySlug,
  getRelatedGuides,
  GUIDES,
} from "@/lib/seo/guides";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide" };
  return {
    title: guide.title,
    description: guide.description,
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const related = getRelatedGuides(guide);

  return (
    <article className="content-page">
      <header className="content-hero">
        <p className="eyebrow">
          <Link href="/guides" className="crumb-link">
            Guides
          </Link>
          {" · "}
          {guide.minutes} min
        </p>
        <h1>{guide.title}</h1>
        <p className="lede">{guide.lede}</p>
        <GuideCta />
      </header>

      {guide.sections.map((section) => (
        <section key={section.heading} className="content-block">
          <h2>{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
          {section.list && (
            <ul className="plain-list">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <FaqSection items={guide.faqs} />

      {related.length > 0 && (
        <section className="content-block">
          <h2>Læs også</h2>
          <ul className="model-link-list">
            {related.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`}>{g.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="content-block note-block">
        <h2>Klar til at sælge?</h2>
        <p>
          Søg din model og se hvor du får det bedste bud — iBud pejer dig det
          rigtige sted hen.
        </p>
        <GuideCta />
      </section>
    </article>
  );
}
