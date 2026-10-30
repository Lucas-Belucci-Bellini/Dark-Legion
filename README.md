# Dark Legion

Portal público para explorar os projetos e repositórios públicos do ecossistema.

- **Frontend:** Next.js + TypeScript.
- **API de produção:** Rust Functions na Vercel.
- **API local:** Rust + Axum.
- **Dados:** JSON versionado com PostgreSQL/SQLx opcional.
- **Atualização:** GitHub Actions às 14h e 00h (Brasília).

## Desenvolvimento

```bash
npm install
npm run dev
```

API Axum local:

```bash
cd backend
cargo run
```

Arquitetura e configuração: [docs/architecture.md](docs/architecture.md) · [catálogo automático](docs/scheduled-catalog-analysis.md).
