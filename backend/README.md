# Dark Legion API

API pública inicial em Rust, Axum e Tokio. Esta etapa mantém o catálogo em memória para estabelecer e testar o contrato HTTP antes de adicionar PostgreSQL.

## Requisitos

- Rust stable (edition 2021)
- Cargo

## Executar localmente

Na pasta `backend/`:

```bash
cargo run
```

O servidor usa por padrão `127.0.0.1:8080`. Variáveis disponíveis estão documentadas em `.env.example`; o arquivo é um modelo e não é carregado automaticamente pelo Cargo.

## Endpoints

- `GET /health` — verificação básica de disponibilidade.
- `GET /api/v1/projects` — lista o catálogo público.
- `GET /api/v1/projects/{slug}` — detalhe de um projeto; retorna 404 quando não encontrado.

## Testes

```bash
cargo test
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
```

Os comandos acima são instruções de validação; só considere os testes aprovados depois de executá-los em um ambiente com Rust e acesso às dependências.

## Segurança e próximos passos

- CORS permite apenas a origem definida em `FRONTEND_ORIGIN` (por padrão, localhost:3000).
- Somente GET e OPTIONS são permitidos pelo CORS nesta API pública inicial.
- O catálogo é código versionado, não banco de dados. PostgreSQL e SQLx entram numa etapa posterior.
- Antes do deploy, configure a origem exata do frontend, o bind/porta exigidos pelo provedor e HTTPS no ponto de entrada.
- Revise todos os links do catálogo e não inclua projetos privados ou dados sensíveis.
