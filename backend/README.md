# Dark Legion API

API pública somente leitura em Rust, Axum e Tokio. O catálogo versionado inclui apenas repositórios públicos; URLs de sites só são expostas quando estão marcadas como verificadas na fonte central.

## Executar

```bash
cd backend
cargo run
```

Por padrão, escuta em `0.0.0.0:8080`. Para desenvolvimento local, defina `HOST=127.0.0.1`. Configure `FRONTEND_ORIGIN` com a origem exata do frontend.

## Endpoints

- `GET /health`
- `GET /api/v1/projects`
- `GET /api/v1/projects/{slug}`
- Filtros opcionais: `?q=nexora`, `?category=Web%20%26%20SaaS`, `?featured=true`

## Qualidade

```bash
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
```

O catálogo é embutido no binário por `include_str!`; não há banco de dados nem escrita de dados nesta versão. Atualizações do catálogo devem passar por revisão de código e manter o filtro de repositórios públicos.
