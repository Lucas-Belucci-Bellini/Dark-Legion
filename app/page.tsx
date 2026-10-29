"use client";

import { useEffect, useMemo, useState } from "react";
import { projects as fallbackProjects, type Project } from "@/data/projects";
import { fetchPublicProjects } from "@/lib/projects-api";

// Página inicial responsiva com busca e filtro por categoria, sem dependências extras.
export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  // O catálogo local mantém a página utilizável mesmo sem a API Rust configurada.
  const [projectCatalog, setProjectCatalog] = useState<Project[]>(fallbackProjects);
  const [catalogSource, setCatalogSource] = useState<"local" | "api">("local");

  useEffect(() => {
    let isCurrent = true;

    // Sem URL pública, não tenta buscar a API e usa o catálogo editorial versionado.
    if (!process.env.NEXT_PUBLIC_DARK_LEGION_API_URL) return;

    fetchPublicProjects()
      .then((remoteProjects) => {
        if (!isCurrent || remoteProjects.length === 0) return;
        setProjectCatalog(remoteProjects);
        setCatalogSource("api");
      })
      .catch(() => {
        // Falhas de rede não derrubam o portal; o catálogo local permanece disponível.
        if (isCurrent) setCatalogSource("local");
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(projectCatalog.map((project) => project.category))).sort()],
    [projectCatalog],
  );

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    return projectCatalog.filter((project) => {
      const matchesCategory = category === "Todos" || project.category === category;
      const searchableText =
        `${project.name} ${project.category} ${project.description}`.toLocaleLowerCase("pt-BR");
      return matchesCategory && searchableText.includes(normalizedQuery);
    });
  }, [category, projectCatalog, query]);

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
          <a href="https://github.com/Lucas-Belucci-Bellini" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </nav>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow"><span className="status-dot" /> PORTFÓLIO PÚBLICO · 2026</p>
          <h1>Ideias viram<br /><span>sistemas reais.</span></h1>
          <p className="hero-copy">
            A Dark Legion reúne projetos independentes de software, experiências web,
            ferramentas e jogos. Explore o que já tem repositório e site públicos.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#projetos">Explorar projetos <span>↓</span></a>
            <a className="button button-secondary" href="https://github.com/Lucas-Belucci-Bellini/Dark-Legion" target="_blank" rel="noreferrer">
              Ver repositório ↗
            </a>
          </div>
          <div className="hero-meta">
            <div><strong>{projectCatalog.length.toString().padStart(2, "0")}</strong><span>projetos catalogados</span></div>
            <div><strong>TS</strong><span>frontend TypeScript</span></div>
            <div><strong>PT-BR</strong><span>idioma principal</span></div>
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
            <h2>Projetos em destaque<span>.</span></h2>
            <p className="section-copy">Uma seleção inicial de projetos com código público e uma página web associada.</p>
            <p className="section-copy" aria-live="polite">Fonte do catálogo: {catalogSource === "api" ? "API Rust" : "catálogo local de segurança"}</p>
          </div>
          <span className="count-pill">{visibleProjects.length.toString().padStart(2, "0")} RESULTADOS</span>
        </div>

        <div className="filters">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Buscar projetos</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, categoria..."
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
              <article className={project.featured ? "project-card featured-card" : "project-card"} key={project.name}>
                <div className="card-topline">
                  <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="project-status" data-status={project.status}><span aria-hidden="true" />{project.status}</span>
                </div>
                <p className="project-category">{project.category}</p>
                <h3>{project.name}</h3>
                <p className="project-description">{project.description}</p>
                <div className="card-links">
                  <a href={project.websiteUrl} target="_blank" rel="noreferrer">Abrir site <span>↗</span></a>
                  <a className="repo-link" href={project.repositoryUrl} target="_blank" rel="noreferrer">Código-fonte <span>↗</span></a>
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
            Este portal é uma vitrine pública: apresenta apenas projetos selecionados
            que possuem repositório público e site associado. Projetos privados,
            credenciais, detalhes internos e trabalhos ainda não selecionados ficam de fora.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <a className="footer-brand" href="#inicio">DARK LEGION <span>®</span></a>
        <p>Um projeto independente de Lucas Belucci Bellini.</p>
        <div>
          <a href="https://github.com/Lucas-Belucci-Bellini/Dark-Legion" target="_blank" rel="noreferrer">Repositório</a>
          <a href="https://github.com/Lucas-Belucci-Bellini" target="_blank" rel="noreferrer">GitHub pessoal</a>
        </div>
        <small>© {new Date().getFullYear()} Dark Legion. Feito para evoluir.</small>
      </footer>
    </main>
  );
}