---
name: schema-e-migrations-andam-juntos
description: O banco é definido em dois lugares (migrations e schema.ts do Drizzle)
---

**Por quê:** o D1 é criado pelas migrations em `migrations/`, mas o código tipa as consultas pelo `src/lib/server/db/schema.ts`. Se um mudar sem o outro, o erro só aparece em execução.

**Como aplicar:** coluna ou tabela nova = migration `NNNN_descricao.sql` nova (sem editar as antigas) + ajuste no `schema.ts`. Teste local com `wrangler d1 migrations apply ontrack-db --local`.
