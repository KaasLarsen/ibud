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
  return (
    <span
      className="partner-logo"
      style={{
        width: size,
        height: size,
        background: partner.accent,
        fontSize: size * 0.34,
      }}
      aria-hidden
    >
      {partner.logoText}
    </span>
  );
}
