import { SellWizard } from "@/components/SellWizard";

export default function HomePage() {
  return (
    <section className="hero hero-top">
      <div className="hero-copy">
        <p className="brand hero-brand">
          i<span>Bud</span>
        </p>
        <h1>Hvor får du mest for din iPhone?</h1>
        <p className="lede">
          Søg din model. Vi finder buddene og viser det bedste først.
        </p>
      </div>

      <SellWizard />
    </section>
  );
}
