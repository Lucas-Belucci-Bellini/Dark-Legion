# Arquitetura inicial — Dark Legion

## Camadas

1. **Frontend:** Next.js, React e TypeScript; apresenta o catálogo público e consome a API HTTP.
2. **Backend:** Rust, Axum e Tokio; expõe rotas versionadas, serializa respostas JSON e centraliza comportamento HTTP.
3. **Persistência futura:** PostgreSQL com SQLx e migrações versionadas.
4. **Qualidade:** testes de rota, formatação Rust, Clippy e build de produção do frontend.

## Contrato HTTP inicial

- `GET /health` retorna estado do serviço.
- `GET /api/v1/projects` retorna uma lista de projetos públicos.
- `GET /api/v1/projects/{slug}` retorna um projeto ou HTTP 404.

## Decisões e limites atuais

- O catálogo da API está em memória e é mantido no código. Não existe PostgreSQL conectado nesta etapa.
- A API é somente leitura e não possui autenticação porque não oferece operações administrativas.
- CORS usa uma origem configurável; a origem real do deploy deve ser definida antes da publicação.
- Os links cadastrados precisam de revisão manual; a API não verifica disponibilidade externa.
- O frontend ainda precisa ser adaptado para consumir a API Rust. Não habilitar deploy de produção até integração e validação.
