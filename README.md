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

Abra http://localhost:3000.

Validar a versão de produção:

```bash
npm run build
npm start
```

## Organização

- `app/page.tsx`: página inicial, navegação, busca e filtro.
- `app/globals.css`: identidade visual e layout responsivo.
- `app/layout.tsx`: metadados e estrutura HTML.
- `data/projects.ts`: catálogo editorial tipado de projetos.

## Regras do catálogo público

1. Incluir apenas projetos cujo repositório seja público.
2. Incluir apenas projetos com um endereço de site associado.
3. Não divulgar repositórios privados, segredos, tokens, arquivos de ambiente ou detalhes internos.
4. Tratar links e descrições como dados editoriais: conferir disponibilidade e atualizar quando houver mudanças.
5. Não afirmar que um site está online em tempo real sem monitoramento que confirme isso.

## Próximos passos sugeridos

- Revisar manualmente todos os links do catálogo.
- Adicionar favicon e imagem Open Graph originais.
- Implementar testes automatizados para busca e filtragem.
- Configurar deploy após validar o build e revisar a lista pública.
