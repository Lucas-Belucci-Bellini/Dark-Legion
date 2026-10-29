// Catálogo editorial inicial. Só entram projetos com repositório público e site listado
// no catálogo público do perfil. Revise disponibilidade e descrição antes de ampliar a lista.
export type Project = {
  name: string;
  category: string;
  description: string;
  repositoryUrl: string;
  websiteUrl: string;
  status: "Em desenvolvimento" | "Experimental";
  featured?: boolean;
};

export const projects: Project[] = [
  {
    name: "NEXORA",
    category: "Engine e jogos",
    description:
      "Projeto de engine e ecossistema de desenvolvimento de jogos, com foco em tecnologia própria e experimentação.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/NEXORA",
    websiteUrl: "https://web-2qfw.vercel.app",
    status: "Em desenvolvimento",
    featured: true,
  },
  {
    name: "Project Vanguard",
    category: "Ecossistema de software",
    description:
      "Projeto de software do ecossistema Baluarte, apresentado aqui como uma iniciativa independente em evolução.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/Project-Vanguard",
    websiteUrl: "https://project-vanguard-cyan.vercel.app",
    status: "Em desenvolvimento",
    featured: true,
  },
  {
    name: "CodeVibe Academy",
    category: "Educação e web",
    description:
      "Experiência web voltada a conteúdo e aprendizado de programação.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/CodeVibe-Academy",
    websiteUrl: "https://code-vibe-academy.vercel.app",
    status: "Em desenvolvimento",
  },
  {
    name: "DailyPlanner",
    category: "Produtividade",
    description:
      "Aplicação de planejamento diário para organizar tarefas e atividades.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/DailyPlanner",
    websiteUrl: "https://daily-planner-phi-smoky.vercel.app",
    status: "Em desenvolvimento",
  },
  {
    name: "Veritas",
    category: "Ferramentas e hardware",
    description:
      "Projeto experimental de software e ferramentas técnicas.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/Veritas",
    websiteUrl: "https://veritas-opal-seven.vercel.app",
    status: "Experimental",
  },
  {
    name: "Baluarte Obra Segura",
    category: "Construção e segurança",
    description:
      "Projeto web do ecossistema Baluarte relacionado a processos e segurança em obras.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/baluarte-obra-segura",
    websiteUrl: "https://baluarte-obra-segura.vercel.app",
    status: "Em desenvolvimento",
  },
  {
    name: "LLBR Innovations Constructions",
    category: "Construção e web",
    description:
      "Presença digital para uma iniciativa de construção e inovação.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/LLBR-Innovations-Constructions",
    websiteUrl: "https://llbr-innovations-constructions.vercel.app",
    status: "Em desenvolvimento",
  },
  {
    name: "Portfólio Baluarte",
    category: "Ecossistema Baluarte",
    description:
      "Site de apresentação de projetos associados ao ecossistema Baluarte.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/Portifolio-Baluarte-Lucas-Belucci-Bellini-",
    websiteUrl: "https://portifolio-baluarte-lucas-belucci-b.vercel.app",
    status: "Em desenvolvimento",
  },
  {
    name: "Baluarte World Game",
    category: "Jogos",
    description:
      "Projeto de jogo ligado ao universo de projetos Baluarte.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte-World-Game",
    websiteUrl: "https://projeto-baluarte-world-game.vercel.app",
    status: "Em desenvolvimento",
  },
];

// A pesquisa e os filtros da interface usam este catálogo tipado como fonte única.
