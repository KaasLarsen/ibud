import type { Metadata } from "next";
import Link from "next/link";
import { BuyCatalog } from "@/components/BuyCatalog";
import { FaqSection } from "@/components/SeoContent";
import { getGreenIphoneCatalog } from "@/lib/partners/green";

export const metadata: Metadata = {
  title: "Køb brugt iPhone",
  description:
    "Find brugte og refurbished iPhones hos Green. iBud viser lageret med priser — du køber direkte hos partneren. Vi kan få provision ved køb via vores links.",
};

export const revalidate = 3600;

const faqs = [
  {
    question: "Sælger iBud telefoner?",
    answer:
      "Nej. iBud viser telefoner til salg hos vores partner Green. Du køber direkte hos dem — vi pejer dig videre.",
  },
  {
    question: "Hvor kommer priserne fra?",
    answer:
      "Priserne kommer fra Greens produktkatalog (refurbished). Den endelige pris, stand og lager bekræftes på Green.dk. Vi viser typisk den laveste pris for model, lager og farve.",
  },
  {
    question: "Får iBud penge, når jeg køber?",
    answer:
      "Ja, muligvis. Når du klikker videre via vores links, kan vi få provision (affiliate), hvis du køber hos Green. Det påvirker ikke prisen for dig.",
  },
];

export default async function KoebIphonePage() {
  let listings: Awaited<ReturnType<typeof getGreenIphoneCatalog>>["listings"] =
    [];
  let fetchedAt = new Date().toISOString();
  let loadError = false;

  try {
    const catalog = await getGreenIphoneCatalog();
    listings = catalog.listings;
    fetchedAt = catalog.fetchedAt;
  } catch {
    loadError = true;
  }

  return (
    <div className="how-page">
      <section className="hero how-hero buy-hero">
        <div className="hero-copy">
          <p className="eyebrow">Køb brugt iPhone</p>
          <h1>Find en brugt iPhone hos Green</h1>
          <p className="lede">
            Gennemtestede telefoner med pris og lager fra Green. Du handler
            direkte hos dem — iBud sælger ikke selv.
          </p>
        </div>
      </section>

      <article className="content-page how-rest buy-page">
        {loadError ? (
          <section className="content-block">
            <p>
              Vi kunne ikke hente kataloget lige nu. Prøv igen om lidt, eller gå
              direkte til{" "}
              <a
                href="https://green.dk"
                target="_blank"
                rel="noopener noreferrer sponsored"
              >
                Green.dk
              </a>
              .
            </p>
          </section>
        ) : (
          <BuyCatalog listings={listings} fetchedAt={fetchedAt} />
        )}

        <p className="disclaimer buy-disclaimer">
          iBud sælger ikke telefoner. Priser og lager er fra Green og kan ændre
          sig. Når du klikker videre, gælder Greens vilkår — og vi kan få
          provision ved køb via linket.
        </p>

        <section className="content-block buy-cross">
          <h2>Vil du hellere sælge?</h2>
          <p>
            Sammenlign bud fra flere danske købere og se, hvor du får mest for
            din iPhone.
          </p>
          <Link href="/saelg-iphone" className="cta">
            Sælg din iPhone
          </Link>
        </section>

        <FaqSection items={faqs} />
      </article>
    </div>
  );
}
