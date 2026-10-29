import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return { title: "Projeto não encontrado" };

  return {
    title: project.name,
    description: project.description,
    openGraph: {
      title: `${project.name} | Dark Legion`,
      description: project.description,
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  return (
    <main className="detail-page">
      <div className="detail-shell">
        <Link className="back-link" href="/#projetos">← Voltar ao diretório</Link>
        <article className="detail-card">
          <p className="eyebrow">DARK LEGION / PROJETO</p>
          <p className="project-category">{project.categoryLabel}</p>
          <h1>{project.name}</h1>
          <p className="detail-description">{project.description}</p>
          <div className="detail-meta">
            <span>{project.status}</span>
            {project.featured && <span>★ Projeto em destaque</span>}
            <span>Prioridade {project.marketingPriority}/100</span>
          </div>
          <div className="detail-actions">
            {project.websiteUrl && (
              <a className="button button-primary" href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                Abrir aplicação ↗
              </a>
            )}
            <a className="button button-secondary" href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
              Ver código-fonte ↗
            </a>
          </div>
          <p className="detail-note">
            Este registro pertence ao catálogo público. Um endereço de aplicação só é exibido
            quando sua URL está marcada como verificada na fonte central.
          </p>
        </article>
      </div>
    </main>
  );
}
