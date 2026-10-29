// Tipos e adaptador da API Rust para manter a interface TypeScript independente
// do formato snake_case usado na serialização padrão do backend.
import type { Project } from "@/data/projects";

type ApiProject = {
  slug: string;
  name: string;
  category: string;
  description: string;
  repository_url: string;
  website_url: string;
  status: string;
  featured: boolean;
};

function isApiProject(value: unknown): value is ApiProject {
  if (typeof value !== "object" || value === null) return false;
  const project = value as Record<string, unknown>;

  // Validamos os campos essenciais para evitar que uma resposta inesperada quebre os cards.
  return (
    typeof project.slug === "string" &&
    typeof project.name === "string" &&
    typeof project.category === "string" &&
    typeof project.description === "string" &&
    typeof project.repository_url === "string" &&
    typeof project.website_url === "string" &&
    typeof project.status === "string" &&
    typeof project.featured === "boolean"
  );
}

function toProject(project: ApiProject): Project {
  return {
    name: project.name,
    category: project.category,
    description: project.description,
    repositoryUrl: project.repository_url,
    websiteUrl: project.website_url,
    status: project.status === "Experimental" ? "Experimental" : project.status === "Ativo" ? "Ativo" : "Em desenvolvimento",
    featured: project.featured,
  };
}

export async function fetchPublicProjects(): Promise<Project[]> {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_DARK_LEGION_API_URL?.trim();
  if (!configuredBaseUrl) return [];

  // Remove barras finais para compor uma URL consistente sem duplicar separadores.
  const baseUrl = configuredBaseUrl.replace(/\/+$/, "");
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
