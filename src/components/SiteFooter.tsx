import Link from "next/link";
import { company, companyIdentification } from "@/lib/site/company";

const columns = [
  {
    title: "Produkt",
    links: [
      { href: "/saadan-virker-det", label: "Sådan virker det" },
      { href: "/", label: "Find bud" },
    ],
  },
  {
    title: "iBud",
    links: [
      { href: "/om-os", label: "Om os" },
      { href: "/kontakt", label: "Kontakt" },
    ],
  },
  {
    title: "Juridisk",
    links: [
      { href: "/privatliv", label: "Privatlivspolitik" },
      { href: "/cookies", label: "Cookies" },
      { href: "/vilkaar", label: "Vilkår" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="brand footer-logo">
            i<span>Bud</span>
          </Link>
          <p>
            Vi scanner bud og pejer dig det bedste. Vi køber ikke selv
            din telefon.
          </p>
          <a className="footer-mail" href={`mailto:${company.email}`}>
            {company.email}
          </a>
          <p className="footer-legal muted">{companyIdentification()}</p>
        </div>

        <div className="footer-cols">
          {columns.map((col) => (
            <div key={col.title} className="footer-col">
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} iBud.dk</span>
        <span>Kun iPhones · Danmark</span>
      </div>
    </footer>
  );
}
