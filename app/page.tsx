"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { projects as fallbackProjects, type Project } from "@/data/projects";
import { fetchPublicCatalog, type CatalogSource } from "@/lib/projects-api";

type SortMode = "priority" | "name";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [projectCatalog, setProjectCatalog] = useState<Project[]>(fallbackProjects);
  const [catalogSource, setCatalogSource] = useState<CatalogSource | "local-fallback">("local-fallback");

  useEffect(() => {
    let active = true;
    fetchPublicCatalog()
      .then((catalog) => {
        if (!active) return;
        setProjectCatalog(catalog.projects);
        setCatalogSource(catalog.source);
      })
      .catch(() => {
        if (active) setCatalogSource("local-fallback");
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
    return projectCatalog
      .filter((project) => {
        const matchesCategory = category === "Todos" || project.categoryLabel === category;
        const matchesFeatured = !featuredOnly || project.featured;
        const searchable = [
          project.name,
          project.slug,
          project.category,
          project.categoryLabel,
          project.description,
          project.status,
        ].join(" ").toLocaleLowerCase("pt-BR");
        return matchesCategory && matchesFeatured && searchable.includes(normalizedQuery);
      })
      .sort((a, b) =>
        sortMode === "name"
          ? a.name.localeCompare(b.name, "pt-BR")
          : b.marketingPriority - a.marketingPriority || a.name.localeCompare(b.name, "pt-BR"),
      );
  }, [category, featuredOnly, projectCatalog, query, sortMode]);

  const verifiedWebsiteCount = projectCatalog.filter((project) => project.websiteUrl).length;
  const catalogSourceLabel =
    catalogSource === "postgresql"
      ? "PostgreSQL conectado"
      : catalogSource === "bundled-json"
        ? "JSON versionado (fallback)"
        : catalogSource === "unknown"
          ? "API Rust (fonte não identificada)"
          : "catálogo local (API indisponível)";

  function clearFilters() {
    setQuery("");
    setCategory("Todos");
    setFeaturedOnly(false);
    setSortMode("priority");
  }

  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="#inicio" aria-label="Dark Legion, início">
          <span className="brand-mark" aria-hidden="true">DL</span>
          <span>
            <strong>DARK LEGION</strong>
            <small>Laboratório independente de tecnologia</small>
          </span>
        </Link>
        <nav aria-label="Navegação principal">
          <Link href="#projetos">Projetos</Link>
          <Link href="#sobre">Sobre</Link>
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
            <Link className="button button-primary" href="#projetos">Explorar projetos <span>↓</span></Link>
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
            <p className="section-copy">Explore os repositórios, filtre por área e abra uma página dedicada para cada projeto.</p>
            <p className="section-copy" aria-live="polite">Fonte ativa: <strong>{catalogSourceLabel}</strong>.</p>
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
          <label className="filter-label sort-filter">
            <span className="sr-only">Ordenar projetos</span>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
              <option value="priority">Mais relevantes</option>
              <option value="name">Ordem alfabética</option>
            </select>
          </label>
        </div>

        <div className="filter-actions">
          <button
            className={featuredOnly ? "filter-chip active" : "filter-chip"}
            type="button"
            aria-pressed={featuredOnly}
            onClick={() => setFeaturedOnly((current) => !current)}
          >
            <span aria-hidden="true">★</span> Somente destaques
          </button>
          <button className="text-button compact-button" type="button" onClick={clearFilters}>Limpar filtros</button>
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
                <h3><Link className="project-title-link" href={`/projects/${project.slug}`}>{project.name}</Link></h3>
                <p className="project-description">{project.description}</p>
                <div className="card-links">
                  <Link href={`/projects/${project.slug}`}>Detalhes <span>→</span></Link>
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
            <button className="text-button" onClick={clearFilters}>Limpar filtros</button>
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
        <Link className="footer-brand" href="#inicio">DARK LEGION <span>®</span></Link>
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
