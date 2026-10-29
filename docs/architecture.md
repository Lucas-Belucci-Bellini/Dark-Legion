# Arquitetura — Dark Legion

## Componentes

- **Frontend:** Next.js App Router, React e TypeScript.
- **API:** Rust, Axum, Tokio e Serde.
- **Catálogo:** `data/public-projects.json`, fonte versionada compartilhada entre frontend e backend.
- **Persistência:** catálogo estático nesta versão; PostgreSQL/SQLx fica para uma etapa separada quando houver necessidade de edição dinâmica.

## Fluxo

1. A fonte central do perfil fornece os metadados dos projetos.
2. O catálogo deste repositório inclui somente entradas com `private=false` e visibilidade pública.
3. Um site só é publicado quando `website_status=verified`; links não verificados são omitidos.
4. O frontend usa o JSON local como fallback e consulta a API Rust quando configurada.
5. A API oferece listagem, busca, filtro por categoria, filtro de destaque e detalhe por slug.

## Contrato HTTP

- `GET /health`
- `GET /api/v1/projects?q=&category=&featured=`
- `GET /api/v1/projects/{slug}`

## Segurança e limites

- API somente leitura, sem autenticação administrativa nem endpoints de escrita.
- CORS restrito à origem configurada em `FRONTEND_ORIGIN`.
- Nenhum projeto privado é incluído no JSON público.
- Ausência de `website_url` significa que não há site atualmente verificado; a interface não inventa um domínio.
- O catálogo não representa monitoramento em tempo real de disponibilidade.
- O banco de dados não foi integrado nesta versão.
