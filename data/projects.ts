// Catálogo público sincronizado com docs/project-catalog.json do perfil.
// Só entram repositórios públicos com site marcado como verificado no catálogo central.
export type Project = {
  name: string;
  category: string;
  description: string;
  repositoryUrl: string;
  websiteUrl: string;
  status: "Ativo" | "Em desenvolvimento" | "Experimental";
  featured?: boolean;
};

export const projects: Project[] = [
  {
    name: "Veritas",
    category: "Hardware e simulação",
    description: "Projeto de hardware e simulação digital.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/Veritas",
    websiteUrl: "https://veritas-opal-seven.vercel.app",
    status: "Ativo",
    featured: true,
  },
  {
    name: "Baluarte Obra Segura",
    category: "Web e SaaS",
    description: "Hub de engenharia para gestão de obras, projetos elétricos, cálculos de materiais e documentação técnica.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/baluarte-obra-segura",
    websiteUrl: "https://baluarte-obra-segura.vercel.app",
    status: "Em desenvolvimento",
    featured: true,
  },
  {
    name: "Project Vanguard",
    category: "Web e SaaS",
    description: "Projeto de software independente em desenvolvimento.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/Project-Vanguard",
    websiteUrl: "https://project-vanguard-cyan.vercel.app",
    status: "Ativo",
    featured: true,
  },
  {
    name: "DailyPlanner",
    category: "IA e produtividade",
    description: "Aplicação de planejamento diário e organização de tarefas.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/DailyPlanner",
    websiteUrl: "https://daily-planner-phi-smoky.vercel.app",
    status: "Ativo",
    featured: true,
  },
  {
    name: "Baluarte World Game",
    category: "Web e SaaS",
    description: "Projeto de jogo associado ao universo Baluarte.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte-World-Game",
    websiteUrl: "https://projeto-baluarte-world-game.vercel.app",
    status: "Em desenvolvimento",
    featured: true,
  },
  {
    name: "CodeVibe Academy",
    category: "Web e SaaS",
    description: "Plataforma web voltada ao conteúdo e aprendizado de programação.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/CodeVibe-Academy",
    websiteUrl: "https://code-vibe-academy.vercel.app",
    status: "Em desenvolvimento",
    featured: false,
  },
  {
    name: "Essence Custom Furniture",
    category: "Web e SaaS",
    description: "Projeto digital para móveis planejados e personalizados.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/Essence-Custom-Furniture",
    websiteUrl: "https://essence-custom-furniture.vercel.app",
    status: "Em desenvolvimento",
    featured: false,
  },
  {
    name: "LLBR Innovations Constructions",
    category: "Web e SaaS",
    description: "Site institucional de construção, reformas e manutenção.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/LLBR-Innovations-Constructions",
    websiteUrl: "https://llbr-innovations-constructions.vercel.app",
    status: "Em desenvolvimento",
    featured: false,
  },
  {
    name: "NEXORA",
    category: "Web e SaaS",
    description: "Projeto experimental de engine e ecossistema de desenvolvimento de jogos.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/NEXORA",
    websiteUrl: "https://web-2qfw.vercel.app",
    status: "Ativo",
    featured: false,
  },
  {
    name: "Portfólio Baluarte",
    category: "Web e SaaS",
    description: "Portfólio de projetos do ecossistema Baluarte.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/Portifolio-Baluarte-Lucas-Belucci-Bellini-",
    websiteUrl: "https://portifolio-baluarte-lucas-belucci-b.vercel.app",
    status: "Ativo",
    featured: false,
  },
  {
    name: "Hydra Launcher",
    category: "Web e SaaS",
    description: "Launcher de jogos de código aberto, com gestão de biblioteca e recursos para jogadores.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/hydra",
    websiteUrl: "https://hydralauncher.gg",
    status: "Ativo",
    featured: false,
  },
  {
    name: "REA — Reverse Engineering Agent",
    category: "Web e SaaS",
    description: "Ferramentas de engenharia reversa para ajudar agentes de programação a inspecionar software.",
    repositoryUrl: "https://github.com/Lucas-Belucci-Bellini/rea",
    websiteUrl: "https://rea.tools",
    status: "Ativo",
    featured: false,
  }
];

// A busca e os filtros da interface usam este catálogo como fallback local.
