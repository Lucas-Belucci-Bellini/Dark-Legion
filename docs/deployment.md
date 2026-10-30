# Deploy — Dark Legion

## Arquitetura de produção

- **Frontend:** Next.js + TypeScript, hospedado na Vercel.
- **API:** Rust, publicada como Vercel Function nativa em `/api/catalog`.
- **Banco:** PostgreSQL, conectado pela variável privada `DATABASE_URL`.
- **Catálogo de fallback:** `data/public-projects.json`, versionado no repositório.
- **Sincronização:** GitHub Actions gera o snapshot SQL às 14h e à meia-noite (horário de Brasília) e aplica o SQL quando o secret `DATABASE_URL` estiver configurado.

O projeto não depende do Render. O frontend e a Function Rust ficam no projeto Vercel `dark-legion`.

## 1. Configuração da Vercel

Confirme que o projeto está conectado ao repositório `Lucas-Belucci-Bellini/Dark-Legion`, com:
- Framework: Next.js.
- Diretório raiz: `./`.
- Build command: padrão do Next.js.
- Node.js: versão compatível com a configuração atual do projeto.

Configure `DATABASE_URL` como variável de ambiente privada no projeto Vercel (Production e Preview, conforme o ambiente desejado). Nunca grave o valor no Git ou em mensagens.

A Function Rust consulta PostgreSQL quando `DATABASE_URL` existe. Sem essa variável, ela responde com o catálogo JSON versionado, mantendo o site funcional.

## 2. Configuração do GitHub Actions

Adicione o secret `DATABASE_URL` no repositório GitHub com a mesma conexão PostgreSQL usada pela Vercel. O valor deve ser cadastrado diretamente nas configurações de Secrets; não o envie em Issues, commits ou conversas.

As duas Actions:
- 14:00 BRT — cron UTC `0 17 * * *`.
- 00:00 BRT — cron UTC `0 3 * * *`.

Sem o secret, as Actions ainda validam o catálogo e geram o snapshot SQL, mas não conseguem atualizar um banco remoto.

## 3. Verificação pós-deploy

- `GET /api/catalog` deve responder HTTP 200 e JSON com `data` e `meta`.
- `meta.source` deve ser `postgresql` quando o banco estiver conectado ou `bundled-json` no fallback.
- O catálogo da página inicial deve indicar **API Rust** quando a Function estiver respondendo.
- O frontend usa `cache: no-store`, para não manter uma cópia antiga do catálogo no navegador.
- A API é somente leitura; as atualizações são aplicadas pelas Actions, não por endpoints públicos de escrita.

## 4. Limites e segurança

- Não exponha projetos privados, credenciais ou metadados internos.
- Não publique `DATABASE_URL` no repositório.
- O banco precisa aceitar conexões de saída da infraestrutura Vercel e do runner GitHub Actions, conforme a política de rede do provedor.
- A disponibilidade do PostgreSQL e a configuração dos dois secrets são pré-requisitos para sincronização remota real.
