import { PARTNERS, type PartnerMeta } from "@/lib/quotes/catalog";
import type { PartnerId } from "@/lib/quotes/types";

export function PartnerLogo({
  partnerId,
  size = 40,
}: {
  partnerId: PartnerId;
  size?: number;
}) {
  const partner: PartnerMeta = PARTNERS[partnerId];
  const pad = partner.logoFit === "contain" ? Math.round(size * 0.12) : 0;

  return (
    <span
      className="partner-logo"
      style={{
        width: size,
        height: size,
        background: partner.logoBg,
        padding: pad,
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={partner.logoSrc}
        alt=""
        width={size}
        height={size}
        className={`partner-logo-img partner-logo-${partner.logoFit}`}
        draggable={false}
      />
    </span>
  );
}
