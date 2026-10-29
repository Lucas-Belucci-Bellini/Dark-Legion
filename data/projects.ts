import catalog from "./public-projects.json";

export type Project = {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  repositoryUrl: string;
  websiteUrl: string | null;
  status: string;
  featured: boolean;
  marketingPriority: number;
};

export const projects: Project[] = catalog.map((item) => ({
  slug: item.slug,
  name: item.name,
  category: item.category,
  categoryLabel: item.category_label,
  description: item.description,
  repositoryUrl: item.repository_url,
  websiteUrl: item.website_url,
  status: item.status,
  featured: item.featured,
  marketingPriority: item.marketing_priority,
}));
