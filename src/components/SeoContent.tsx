import Link from "next/link";
import { FaqJsonLd } from "@/lib/seo/json-ld";

type FaqItem = { question: string; answer: string };

export function FaqSection({
  items,
  heading = "Ofte stillede spørgsmål",
}: {
  items: FaqItem[];
  heading?: string;
}) {
  return (
    <section className="content-block faq-section">
      <FaqJsonLd items={items} />
      <h2>{heading}</h2>
      <dl className="faq-list">
        {items.map((item) => (
          <div key={item.question} className="faq-item">
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function GuideCta() {
  return (
    <div className="content-cta-row seo-cta">
      <Link href="/" className="cta">
        Find dit bud
      </Link>
      <Link href="/saelg-iphone" className="text-link">
        Se alle modeller →
      </Link>
    </div>
  );
}
