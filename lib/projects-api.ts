import type { Project } from "@/data/projects";

type ApiProject = {
  slug: string;
  name: string;
  category: string;
  category_label: string;
  description: string;
  repository_url: string;
  website_url: string | null;
  status: string;
  featured: boolean;
  marketing_priority: number;
};

function isSafeHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function isApiProject(value: unknown): value is ApiProject {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    /^[a-z0-9-]+$/.test(item.slug) &&
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    typeof item.category_label === "string" &&
    typeof item.description === "string" &&
    isSafeHttpsUrl(item.repository_url) &&
    (item.website_url === null || isSafeHttpsUrl(item.website_url)) &&
    typeof item.status === "string" &&
    typeof item.featured === "boolean" &&
    typeof item.marketing_priority === "number" &&
    Number.isInteger(item.marketing_priority) &&
    item.marketing_priority >= 0 &&
    item.marketing_priority <= 100
  );
}

function toProject(item: ApiProject): Project {
  return {
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
  };
}

export async function fetchPublicProjects(): Promise<Project[]> {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_DARK_LEGION_API_URL?.trim();
  if (!configuredBaseUrl) return [];

  let baseUrl: URL;
  try {
    baseUrl = new URL(configuredBaseUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_DARK_LEGION_API_URL não é uma URL válida.");
  }

  if (
    baseUrl.protocol !== "https:" &&
    baseUrl.hostname !== "localhost" &&
    baseUrl.hostname !== "127.0.0.1"
  ) {
    throw new Error("A API pública deve usar HTTPS.");
  }

  const response = await fetch(new URL("/api/v1/projects", baseUrl), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`A API respondeu com HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isApiProject)) {
    throw new Error("A API retornou um catálogo em formato inesperado.");
  }

  return payload.map(toProject);
}
