# Análise automática do catálogo público

As duas Actions consultam a API pública do GitHub para descobrir os repositórios públicos pertencentes a `Lucas-Belucci-Bellini`. A consulta usa a API pública sem token e não enumera nem exporta repositórios privados.

## Execução

- 14:00 BRT — cron UTC `0 17 * * *`.
- 00:00 BRT — cron UTC `0 3 * * *`.
- Também podem ser iniciadas manualmente por `workflow_dispatch`.

## Pipeline de cada execução

1. Consulta todas as páginas de repositórios públicos do perfil.
2. Confirma que cada item pertence ao proprietário esperado e que `private=false`.
3. Remove do catálogo registros próprios que deixaram de estar públicos.
4. Adiciona novos repositórios públicos sem substituir descrições, categorias, destaques ou prioridades já revisados manualmente.
5. Aproveita o campo `homepage` do GitHub somente quando é uma URL HTTPS.
6. Valida o catálogo e gera `data/public-projects.sql`, incluindo a remoção transacional de linhas que não constam mais no catálogo público.
7. Aplica o SQL ao PostgreSQL quando `DATABASE_URL` está configurada.
8. Comita o JSON e o SQL quando houver alterações.

## API de produção na Vercel\n\n- `GET /api/catalog` retorna os projetos e informa a fonte em `meta.source` (`postgresql` ou `bundled-json`).\n- `GET /api/health` retorna `status`, `catalog_source` e `catalog_count`, sem expor credenciais.\n- As duas rotas usam `Cache-Control: no-store` para evitar catálogo antigo no CDN.\n\n## Como o site recebe as mudanças

- Com PostgreSQL conectado e populado, a Function Rust consulta o banco e o frontend usa `cache: no-store`; as mudanças aparecem sem rebuild do frontend.
- Sem `DATABASE_URL`, o JSON versionado é a fonte normal da Function Rust. O commit do JSON dispara um novo deploy da Vercel, que incorpora o catálogo atualizado.
- Se PostgreSQL estiver indisponível, falhar na consulta ou ainda estiver vazio, a API serve o JSON versionado como contingência e marca a resposta/health check como `degraded`. Isso mantém o catálogo visível sem esconder que o banco precisa de atenção.
- Se a API pública do GitHub estiver indisponível ou atingir rate limit, a descoberta falha sem sobrescrever o catálogo; a execução não publica dados parciais.

## Configuração

Para habilitar a fonte PostgreSQL, cadastrar o mesmo segredo privado `DATABASE_URL`:
- no projeto Vercel `dark-legion`;
- nos GitHub Actions Secrets do repositório.

O valor nunca deve ser enviado em Issues, commits ou mensagens. Prefira a URL de conexão com pooler do provedor PostgreSQL para reduzir conexões serverless. Sem `DATABASE_URL` na Vercel, a Function informa `bundled-json` e usa o catálogo versionado. Nenhum Personal Access Token é necessário para a leitura dos repositórios públicos.

## Limites de segurança

- A fonte de descoberta é o endpoint público `/users/{username}/repos`.
- Repositórios privados, de outros proprietários e metadados privados não são adicionados.
- Registros próprios removidos ou tornados privados deixam de constar no JSON e são excluídos do PostgreSQL na próxima execução bem-sucedida.
- Dados editoriais já curados manualmente são preservados.
- As APIs de catálogo permanecem somente leitura; as atualizações são feitas pelas Actions.
