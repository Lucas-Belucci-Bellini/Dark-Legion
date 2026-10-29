import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  let sitemap: string | undefined;

  if (configuredSiteUrl) {
    try {
      const parsed = new URL(configuredSiteUrl);
      if (parsed.protocol === "https:" || parsed.hostname === "localhost") {
        sitemap = `${parsed.toString().replace(/\/$/, "")}/sitemap.xml`;
      }
    } catch {
      sitemap = undefined;
    }
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ...(sitemap ? { sitemap } : {}),
  };
}
