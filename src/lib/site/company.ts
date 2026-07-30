/**
 * Virksomhedsidentifikation (e-handelsloven / GDPR).
 * Sæt via miljøvariabler i production — se .env.example.
 */
export const company = {
  legalName: process.env.COMPANY_LEGAL_NAME ?? "iBud ApS",
  cvr: process.env.COMPANY_CVR ?? "",
  address: process.env.COMPANY_ADDRESS ?? "",
  email: "info@ibud.dk",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibud.dk",
};

export function companyIdentification(): string {
  const parts = [company.legalName];
  if (company.cvr) parts.push(`CVR ${company.cvr}`);
  if (company.address) parts.push(company.address);
  return parts.join(" · ");
}
