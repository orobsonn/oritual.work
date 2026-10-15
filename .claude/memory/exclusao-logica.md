---
name: exclusao-logica
description: Tabelas usam deleted_at; consulta sem esse filtro mostra dado apagado
---

**Por quê:** usuários, tarefas, metas, hábitos, casais e tarefas agendadas são removidos só marcando `deleted_at`, para preservar histórico.

**Como aplicar:** ao ler essas tabelas, filtre `deleted_at IS NULL`; ao "apagar", faça `update` de `deletedAt`, nunca `delete`.
