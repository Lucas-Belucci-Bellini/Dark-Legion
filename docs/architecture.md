# Arquitetura — Dark Legion

## Produção na Vercel

- **Frontend:** Next.js App Router, React e TypeScript.
- **API serverless:** Rust com `vercel_runtime`, compilado a partir de `api/`.
- **Catálogo:** `data/public-projects.json`, versionado e validado pelo CI.
- **Banco opcional:** PostgreSQL acessado por SQLx quando `DATABASE_URL` está configurada.
- **Hospedagem:** Vercel; não há serviço Render neste projeto.

### Endpoints de produção

- `GET /api/catalog` — catálogo público completo e metadados da fonte.
- `GET /api/health` — estado da API, fonte ativa e quantidade de registros.

As respostas dessas rotas não são armazenadas em cache, para que alterações no banco sejam refletidas na próxima consulta.

## Desenvolvimento local

O servidor Axum em `backend/` permanece disponível para desenvolvimento local:

- `GET /health` and `GET /api/health` — same health contract as production.
- `GET /api/catalog` — same `{ data, meta }` response consumed by the frontend.
- `GET /api/v1/projects?q=&category=&featured=` — filtered local API endpoint.
- `GET /api/v1/projects/{slug}`

Execute com `cd backend && cargo run`. Sem banco, usa o JSON versionado. Com `DATABASE_URL`, usa PostgreSQL.

## Atualização do catálogo

1. As Actions executam às 14:00 e 00:00 (horário de Brasília).
2. O script consulta somente repositórios públicos pertencentes ao perfil configurado.
3. Novos projetos são incluídos; metadados editoriais revisados são preservados.
4. Repositórios próprios que deixaram de estar públicos são removidos do JSON.
5. O gerador produz SQL transacional com upsert e exclusão de linhas obsoletas.
6. Se `DATABASE_URL` existir nos GitHub Actions Secrets, o SQL é aplicado ao PostgreSQL.
7. O frontend consulta `/api/catalog` com `cache: no-store`.

### Modos de operação

- **PostgreSQL conectado:** a Function Rust consulta o banco em tempo de execução. A atualização SQL fica visível sem rebuild do frontend.
- **Sem PostgreSQL:** a Function Rust usa o JSON incorporado no deployment. Quando o JSON muda e é enviado ao `main`, a integração Git da Vercel precisa concluir um novo deployment para publicar o catálogo atualizado.

## Segurança

- Nenhum repositório privado é enumerado ou publicado.
- A API de produção é somente leitura.
- `DATABASE_URL` nunca deve ser colocada em commits, Issues ou mensagens.
- Em produção, prefira a URL de conexão com pooler fornecida pelo provedor PostgreSQL.
- O endpoint de saúde informa apenas a fonte ativa e a contagem; nunca expõe credenciais ou detalhes de conexão.
- URLs externas só são aceitas como HTTPS.
