"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/data/projects";
import { fetchPublicProjects } from "@/lib/projects-api";

type ProjectDetailsProps = {
  slug: string;
  initialProject: Project | null;
};

export default function ProjectDetails({ slug, initialProject }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(initialProject);
  const [loading, setLoading] = useState(true);
  const [requestFailed, setRequestFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPublicProjects()
      .then((catalog) => {
        if (!active) return;
        setProject(catalog.find((item) => item.slug === slug) ?? initialProject);
        setRequestFailed(false);
      })
      .catch(() => {
        if (active) setRequestFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialProject, slug]);

  if (!project && loading) {
    return (
      <main className="detail-page">
        <div className="detail-shell">
          <p className="eyebrow">DARK LEGION / CATÁLOGO</p>
          <h1>Carregando projeto...</h1>
          <p className="detail-description">Consultando o catálogo público atualizado.</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="detail-page">
        <div className="detail-shell">
          <Link className="back-link" href="/#projetos">← Voltar ao diretório</Link>
          <article className="detail-card">
            <p className="eyebrow">DARK LEGION / CATÁLOGO</p>
            <h1>{requestFailed ? "Catálogo indisponível" : "Projeto não encontrado"}</h1>
            <p className="detail-description">
              {requestFailed
                ? "Não foi possível consultar a API agora. Tente novamente em instantes."
                : "Este projeto não está no catálogo público atual."}
            </p>
          </article>
        </div>
      </main>
    );
  }

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
