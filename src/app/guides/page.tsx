import type { Metadata } from "next";
import Link from "next/link";
import { GuideCta } from "@/components/SeoContent";
import { GUIDES } from "@/lib/seo/guides";

export const metadata: Metadata = {
  title: "Guides — sælg iPhone",
  description:
    "Korte guides om at sælge iPhone i Danmark: værdi, stand, privat vs. professionel køber, og hvordan du forbereder telefonen.",
};

export default function GuidesIndexPage() {
  return (
    <article className="content-page">
      <header className="content-hero">
        <p className="eyebrow">Guides</p>
        <h1>Før du sælger din iPhone</h1>
        <p className="lede">
          Korte, konkrete guides — så du forstår prisen, standen og processen.
          Når du er klar, finder du buddet på iBud.
        </p>
      </header>

      <ul className="guide-card-list guide-card-list-lg">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`}>
              <span className="guide-card-title">{guide.title}</span>
              <span className="guide-card-desc">{guide.lede}</span>
              <span className="guide-card-meta">{guide.minutes} min læsning</span>
            </Link>
          </li>
        ))}
      </ul>

      <GuideCta />
    </article>
  );
}
