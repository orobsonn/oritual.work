# migrations

- Arquivos `NNNN_descricao.sql`, em ordem; nunca edite uma migration já aplicada, crie a próxima.
- Cada mudança aqui pede o ajuste correspondente em `src/lib/server/db/schema.ts`.
- Aplicar local: `wrangler d1 migrations apply ontrack-db --local`.
