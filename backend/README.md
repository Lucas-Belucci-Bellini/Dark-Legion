# Dark Legion API

API pública somente leitura em Rust, Axum, Tokio e SQLx. Quando `DATABASE_URL` está configurada, PostgreSQL é a fonte de verdade e cada requisição lê os dados atuais do banco. Sem essa variável, a API usa o JSON público embutido como fallback de desenvolvimento.

## Executar com JSON (sem banco)

```bash
cd backend
cargo run
```

## Executar com PostgreSQL

Crie um banco PostgreSQL e configure:

```bash
DATABASE_URL=postgres://usuario:senha@localhost:5432/dark_legion
FRONTEND_ORIGIN=http://localhost:3000
```

Depois execute `cargo run`. As migrations de `backend/migrations` são aplicadas automaticamente na inicialização. A API lê o catálogo diretamente do PostgreSQL, sem precisar reconstruir o frontend quando os dados mudam.

## Endpoints

- `GET /health` — informa `catalog_source` (`postgresql` ou `bundled-json`).
- `GET /api/v1/projects`
- `GET /api/v1/projects/{slug}`
- Filtros: `?q=nexora`, `?category=Web%20%26%20SaaS`, `?featured=true`.

A API só expõe rotas GET e OPTIONS. O banco recebe atualizações pelo SQL idempotente gerado pelas Actions, não por endpoints públicos de escrita.

## Qualidade

```bash
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
```

Nunca coloque `DATABASE_URL` no repositório. Em produção, configure-a como variável de ambiente privada do serviço Rust e como secret `DATABASE_URL` no repositório GitHub para as Actions.
