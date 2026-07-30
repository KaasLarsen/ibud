import type { MetadataRoute } from "next";
import { company } from "@/lib/site/company";

const base = company.siteUrl.replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/resultat", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
