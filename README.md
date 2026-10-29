# Dark Legion

Portal público de projetos: **Next.js + TypeScript** no frontend e **Rust + Axum** na API.

- Diretório pesquisável de repositórios públicos.
- Links de sites exibidos somente quando verificados.
- API somente leitura com busca, filtros e detalhes.
- Catálogo local como fallback; projetos privados são excluídos.

## Executar

```bash
npm install
npm run dev
```

Frontend: http://localhost:3000

```bash
cd backend
cargo run
```

API: http://localhost:8080/health

Configure `NEXT_PUBLIC_DARK_LEGION_API_URL` no frontend e `FRONTEND_ORIGIN` no backend para integrar os serviços. Veja [docs/architecture.md](docs/architecture.md) e [backend/README.md](backend/README.md).
