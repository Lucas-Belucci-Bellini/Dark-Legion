# Dark Legion

Portal público para apresentar a organização e seus projetos com **repositório público + site associado**.

## Stack inicial

- Next.js App Router
- React
- TypeScript em modo estrito
- CSS responsivo próprio, sem biblioteca de componentes adicional

## Rodar localmente

Requer Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. O portal funciona com o catálogo local sem configuração adicional.

Para testar a integração com a API Rust, copie `.env.example` para `.env.local` e defina `NEXT_PUBLIC_DARK_LEGION_API_URL=http://127.0.0.1:8080`. Reinicie o servidor Next.js depois de alterar variáveis `NEXT_PUBLIC_*`.

Validar a versão de produção:

```bash
npm run build
npm start
```

## Organização

- `app/page.tsx`: página inicial, navegação, busca e filtro.
- `app/globals.css`: identidade visual e layout responsivo.
- `app/layout.tsx`: metadados e estrutura HTML.
- `data/projects.ts`: catálogo editorial tipado usado como fallback.
- `lib/projects-api.ts`: cliente tipado para a API Rust, com validação da resposta.

## Regras do catálogo público

1. Incluir apenas projetos cujo repositório seja público.
2. Incluir apenas projetos com um endereço de site associado.
3. Não divulgar repositórios privados, segredos, tokens, arquivos de ambiente ou detalhes internos.
4. Tratar links e descrições como dados editoriais: conferir disponibilidade e atualizar quando houver mudanças.
5. Não afirmar que um site está online em tempo real sem monitoramento que confirme isso.

## Integração com a API Rust

- O frontend consulta `GET /api/v1/projects` quando `NEXT_PUBLIC_DARK_LEGION_API_URL` está configurada.
- O cliente converte o JSON `snake_case` do Rust para o modelo TypeScript usado nos cards.
- Se a API estiver indisponível ou responder com formato inválido, a página mantém o catálogo local; não há escrita de dados.
- Configure `FRONTEND_ORIGIN` no backend com a origem real do frontend para liberar CORS.

## Validação automatizada do frontend

O workflow `Frontend` executa instalação de dependências, ESLint e build de produção em alterações relevantes. Como ainda não há `package-lock.json`, o CI usa `npm install`; a próxima melhoria é versionar o lockfile e migrar para `npm ci`.

## Próximos passos sugeridos

- Revisar manualmente todos os links do catálogo.
- Adicionar favicon e imagem Open Graph originais.
- Implementar testes automatizados para busca e filtragem.
- Configurar deploy após validar o build e revisar a lista pública.
