# Deploy — Dark Legion

## Visão geral

- Frontend Next.js: Vercel (detecção automática de Next.js).
- API Rust/Axum: Render por Blueprint (render.yaml).
- Catálogo: arquivo versionado data/public-projects.json; nenhum banco é necessário nesta fase.

## 1. Frontend na Vercel

1. Importe Lucas-Belucci-Bellini/Dark-Legion na Vercel.
2. Selecione a branch revisada que contém esta configuração.
3. Framework: Next.js; diretório raiz: ./; use os comandos padrão do Next.js.
4. Configure:
   - NEXT_PUBLIC_SITE_URL: domínio HTTPS real atribuído ao projeto.
   - NEXT_PUBLIC_DARK_LEGION_API_URL: URL HTTPS pública da API Rust.
5. Faça o deploy e confirme a página inicial, uma página /projects/{slug}, /robots.txt e /sitemap.xml.

Não configure um domínio presumido: use a URL efetivamente exibida no painel da Vercel.

## 2. API Rust no Render

1. No Render, escolha New → Blueprint e conecte o repositório.
2. Selecione a branch revisada e o arquivo render.yaml.
3. Crie o serviço dark-legion-api.
4. Após o Render atribuir a URL pública HTTPS, configure FRONTEND_ORIGIN com a origem exata da Vercel (sem caminho).
5. Confirme o health check em /health e a resposta de /api/v1/projects.

O Blueprint deixa FRONTEND_ORIGIN como valor manual porque o domínio final depende da criação do serviço na Vercel. Não há credenciais ou segredos no repositório.

## 3. Testes pós-deploy

- GET /health deve retornar HTTP 200.
- GET /api/v1/projects deve retornar o catálogo público.
- GET /api/v1/projects/nexora deve retornar o detalhe do projeto, se mantido no catálogo.
- A origem Vercel deve conseguir consultar a API; origens diferentes devem ser bloqueadas pelo CORS.
- Se a API estiver indisponível, o frontend permanece funcional usando o catálogo local.

## 4. Limites atuais

- A API é somente leitura.
- O catálogo é atualizado por commit e revisão; não há painel administrativo.
- A integração remota é opcional até as duas URLs de produção existirem.
- Deploy não é executado automaticamente por esta documentação; é necessário conectar e aprovar os serviços nos respectivos painéis.
