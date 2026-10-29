import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredSiteUrl) return [];

  let base: string;
  try {
    const parsed = new URL(configuredSiteUrl);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") return [];
    base = parsed.toString().replace(/\/$/, "");
  } catch {
    return [];
  }

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/projects/${project.slug}`,
    changeFrequency: "monthly",
    priority: project.featured ? 0.75 : 0.55,
  }));

  return [{ url: base, changeFrequency: "weekly", priority: 1 }, ...projectEntries];
}
