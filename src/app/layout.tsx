import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "iBud — Hvor får du mest for din iPhone?",
    template: "%s · iBud",
  },
  description:
    "Søg din iPhone, og se hvor du får det bedste bud. Vi finder buddene for dig — og pejer dig det rigtige sted hen.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  verification: {
    google: "q4j_T5gTl3h-40UuJUgx3YONit0PXSCXGbrnURb_Hso",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className={`${display.variable} ${body.variable} h-full`}>
      <head>
        <meta
          name="google-site-verification"
          content="q4j_T5gTl3h-40UuJUgx3YONit0PXSCXGbrnURb_Hso"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <header className="site-header">
          <Link href="/" className="brand">
            i<span>Bud</span>
          </Link>
          <nav className="site-nav">
            <Link href="/saadan-virker-det" className="nav-link">
              Sådan virker det
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
