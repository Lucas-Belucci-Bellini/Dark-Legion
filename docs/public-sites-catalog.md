# Catálogo público de sites

Este documento registra a origem dos links exibidos no portal Dark Legion.

## Fonte de dados

A lista foi extraída de `docs/project-catalog.json` do repositório
`Lucas-Belucci-Bellini/Lucas-Belucci-Bellini`, usando somente entradas que
atendem simultaneamente a estes critérios:

- `private = false`;
- `website_status = "verified"`;
- campo `website` preenchido.

Não deduzimos domínios pelo nome do repositório. Projetos privados e URLs
marcadas como `unreachable` ficam fora do portal.

## Projetos incluídos

| Projeto | Repositório | Site |
| --- | --- | --- |
| Veritas | [GitHub](https://github.com/Lucas-Belucci-Bellini/Veritas) | [Abrir site](https://veritas-opal-seven.vercel.app) |
| Baluarte Obra Segura | [GitHub](https://github.com/Lucas-Belucci-Bellini/baluarte-obra-segura) | [Abrir site](https://baluarte-obra-segura.vercel.app) |
| Project Vanguard | [GitHub](https://github.com/Lucas-Belucci-Bellini/Project-Vanguard) | [Abrir site](https://project-vanguard-cyan.vercel.app) |
| DailyPlanner | [GitHub](https://github.com/Lucas-Belucci-Bellini/DailyPlanner) | [Abrir site](https://daily-planner-phi-smoky.vercel.app) |
| Baluarte World Game | [GitHub](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte-World-Game) | [Abrir site](https://projeto-baluarte-world-game.vercel.app) |
| CodeVibe Academy | [GitHub](https://github.com/Lucas-Belucci-Bellini/CodeVibe-Academy) | [Abrir site](https://code-vibe-academy.vercel.app) |
| Essence Custom Furniture | [GitHub](https://github.com/Lucas-Belucci-Bellini/Essence-Custom-Furniture) | [Abrir site](https://essence-custom-furniture.vercel.app) |
| LLBR Innovations Constructions | [GitHub](https://github.com/Lucas-Belucci-Bellini/LLBR-Innovations-Constructions) | [Abrir site](https://llbr-innovations-constructions.vercel.app) |
| NEXORA | [GitHub](https://github.com/Lucas-Belucci-Bellini/NEXORA) | [Abrir site](https://web-2qfw.vercel.app) |
| Portfólio Baluarte | [GitHub](https://github.com/Lucas-Belucci-Bellini/Portifolio-Baluarte-Lucas-Belucci-Bellini-) | [Abrir site](https://portifolio-baluarte-lucas-belucci-b.vercel.app) |
| Hydra Launcher | [GitHub](https://github.com/Lucas-Belucci-Bellini/hydra) | [Abrir site](https://hydralauncher.gg) |
| REA | [GitHub](https://github.com/Lucas-Belucci-Bellini/rea) | [Abrir site](https://rea.tools) |

## Manutenção

Quando um site mudar, atualize primeiro o catálogo central do perfil e execute
a verificação de sites daquele repositório. Depois sincronize os dados locais e
a lista da API Rust. Nunca publique URLs privadas, inferidas ou não verificadas.
