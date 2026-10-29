import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dark-legion.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, "");
  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/projects/${project.slug}`,
    changeFrequency: "monthly",
    priority: project.featured ? 0.75 : 0.55,
  }));

  return [
    {
      url: base,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projectEntries,
  ];
}
