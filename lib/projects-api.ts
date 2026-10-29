// Tipos e adaptador da API Rust para manter a interface TypeScript independente
// do formato snake_case usado na serialização padrão do backend.
import type { Project } from "@/data/projects";

type ProjectStatus = Project["status"];

type ApiProject = {
  slug: string;
  name: string;
  category: string;
  description: string;
  repository_url: string;
  website_url: string;
  status: ProjectStatus;
  featured: boolean;
};

// Aceita somente links HTTPS válidos para evitar destinos inesperados nos cards.
function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isApiProject(value: unknown): value is ApiProject {
  if (typeof value !== "object" || value === null) return false;
  const project = value as Record<string, unknown>;
  const validStatuses: ProjectStatus[] = [
    "Ativo",
    "Em desenvolvimento",
    "Experimental",
  ];

  let repositoryHostIsValid = false;
  if (isHttpsUrl(project.repository_url)) {
    repositoryHostIsValid = new URL(project.repository_url).hostname === "github.com";
  }

  // Validamos campos, status e destinos antes de renderizar dados recebidos da API.
  return (
    typeof project.slug === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) &&
    typeof project.name === "string" &&
    project.name.trim().length > 0 &&
    typeof project.category === "string" &&
    project.category.trim().length > 0 &&
    typeof project.description === "string" &&
    typeof project.featured === "boolean" &&
    validStatuses.includes(project.status as ProjectStatus) &&
    repositoryHostIsValid &&
    isHttpsUrl(project.website_url)
  );
}

function toProject(project: ApiProject): Project {
  return {
    name: project.name,
    category: project.category,
    description: project.description,
    repositoryUrl: project.repository_url,
    websiteUrl: project.website_url,
    status: project.status,
    featured: project.featured,
  };
}

export async function fetchPublicProjects(): Promise<Project[]> {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_DARK_LEGION_API_URL?.trim();
  if (!configuredBaseUrl) return [];

  // Remove barras finais para compor uma URL consistente sem duplicar separadores.
  const baseUrl = configuredBaseUrl.replace(/\\/+$/, "");
  const response = await fetch(`${baseUrl}/api/v1/projects`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`A API de projetos respondeu com HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isApiProject)) {
    throw new Error("A API retornou um catálogo em formato inesperado.");
  }

  return payload.map(toProject);
}
