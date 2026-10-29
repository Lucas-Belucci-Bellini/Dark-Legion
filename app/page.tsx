"use client";

import { useEffect, useMemo, useState } from "react";
import { projects as fallbackProjects, type Project } from "@/data/projects";
import { fetchPublicProjects } from "@/lib/projects-api";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [projectCatalog, setProjectCatalog] = useState<Project[]>(fallbackProjects);
  const [catalogSource, setCatalogSource] = useState<"local" | "api">("local");

  useEffect(() => {
    let active = true;
    if (!process.env.NEXT_PUBLIC_DARK_LEGION_API_URL) return;

    fetchPublicProjects()
      .then((remoteProjects) => {
        if (!active || remoteProjects.length === 0) return;
        setProjectCatalog(remoteProjects);
        setCatalogSource("api");
      })
      .catch(() => {
        if (active) setCatalogSource("local");
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(projectCatalog.map((project) => project.categoryLabel))).sort()],
    [projectCatalog],
  );

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return projectCatalog.filter((project) => {
      const matchesCategory = category === "Todos" || project.categoryLabel === category;
      const searchable = [
        project.name,
        project.slug,
        project.category,
        project.categoryLabel,
        project.description,
        project.status,
      ].join(" ").toLocaleLowerCase("pt-BR");
      return matchesCategory && searchable.includes(normalizedQuery);
    });
  }, [category, projectCatalog, query]);

  const verifiedWebsiteCount = projectCatalog.filter((project) => project.websiteUrl).length;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Dark Legion, início">
          <span className="brand-mark" aria-hidden="true">DL</span>
          <span>
            <strong>DARK LEGION</strong>
            <small>Laboratório independente de tecnologia</small>
          </span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#projetos">Projetos</a>
          <a href="#sobre">Sobre</a>
          <a href="https://github.com/Lucas-Belucci-Bellini" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </nav>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow"><span className="status-dot" /> PORTFÓLIO PÚBLICO · 2026</p>
          <h1>Ideias viram<br /><span>sistemas reais.</span></h1>
          <p className="hero-copy">
            Um diretório central para explorar projetos públicos, repositórios,
            aplicações e experiências desenvolvidas no ecossistema de Lucas Belucci Bellini.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#projetos">Explorar projetos <span>↓</span></a>
            <a className="button button-secondary" href="https://github.com/Lucas-Belucci-Bellini/Dark-Legion" target="_blank" rel="noopener noreferrer">
              Ver repositório ↗
            </a>
          </div>
          <div className="hero-meta">
            <div><strong>{projectCatalog.length.toString().padStart(2, "0")}</strong><span>repositórios públicos</span></div>
            <div><strong>{verifiedWebsiteCount.toString().padStart(2, "0")}</strong><span>sites verificados na fonte</span></div>
            <div><strong>TS + RS</strong><span>frontend e API</span></div>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core"><span>DL</span><small>BUILD / EXPLORE</small></div>
          <span className="orbit-label orbit-label-one">ENGINEERING</span>
          <span className="orbit-label orbit-label-two">CREATIVITY</span>
          <span className="orbit-label orbit-label-three">SOFTWARE</span>
        </div>
      </section>

      <section className="projects-section" id="projetos">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / DIRETÓRIO</p>
            <h2>Projetos públicos<span>.</span></h2>
            <p className="section-copy">Pesquise os repositórios públicos. Sites só aparecem quando a URL está verificada no catálogo central.</p>
            <p className="section-copy" aria-live="polite">Fonte ativa: {catalogSource === "api" ? "API Rust" : "catálogo local versionado"}.</p>
          </div>
          <span className="count-pill">{visibleProjects.length.toString().padStart(2, "0")} / {projectCatalog.length.toString().padStart(2, "0")} RESULTADOS</span>
        </div>

        <div className="filters">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Buscar projetos</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar nome, tecnologia, categoria..."
            />
          </label>
          <label className="filter-label">
            <span className="sr-only">Filtrar por categoria</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {visibleProjects.length > 0 ? (
          <div className="project-grid">
            {visibleProjects.map((project, index) => (
              <article className={project.featured ? "project-card featured-card" : "project-card"} key={project.slug}>
                <div className="card-topline">
                  <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="project-status"><span />{project.status}</span>
                </div>
                <p className="project-category">{project.categoryLabel}</p>
                <h3>{project.name}</h3>
                <p className="project-description">{project.description}</p>
                <div className="card-links">
                  {project.websiteUrl ? (
                    <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">Abrir site <span>↗</span></a>
                  ) : (
                    <span className="no-website" title="Nenhum site verificado no catálogo central">Sem site verificado</span>
                  )}
                  <a className="repo-link" href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">Código-fonte <span>↗</span></a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>⌕</span>
            <h3>Nenhum projeto encontrado</h3>
            <p>Tente outro termo ou selecione uma categoria diferente.</p>
            <button className="text-button" onClick={() => { setQuery(""); setCategory("Todos"); }}>
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      <section className="about-section" id="sobre">
        <div className="about-symbol" aria-hidden="true">DL<span>／／</span></div>
        <div>
          <p className="eyebrow">02 / PRINCÍPIOS</p>
          <h2>Construir com intenção.<br /><span>Documentar com clareza.</span></h2>
          <p>
            Este portal concentra projetos que possuem repositórios públicos.
            Endereços de sites são exibidos somente quando constam como verificados
            na fonte central. Projetos privados, credenciais e detalhes internos não são publicados.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <a className="footer-brand" href="#inicio">DARK LEGION <span>®</span></a>
        <p>Um projeto independente de Lucas Belucci Bellini.</p>
        <div>
          <a href="https://github.com/Lucas-Belucci-Bellini/Dark-Legion" target="_blank" rel="noopener noreferrer">Repositório</a>
          <a href="https://github.com/Lucas-Belucci-Bellini" target="_blank" rel="noopener noreferrer">GitHub pessoal</a>
        </div>
        <small>© {new Date().getFullYear()} Dark Legion. Feito para evoluir.</small>
      </footer>
    </main>
  );
}
