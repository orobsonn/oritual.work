---
name: testes-sem-dependencia
description: como rodar teste de módulo puro do servidor sem Vitest, usando o runner nativo do Node
---

Não há suíte no projeto. Para provar o comportamento de função pura de `src/lib/server/`, use
`node:test` e `node:assert/strict` em `tests/*.test.ts` e rode `node --test tests/<arquivo>.test.ts`
(Node 22.18+ executa TypeScript direto).

**Por quê:** evita adicionar dependência só para um teste pequeno (exemplo: `tests/target-days.test.ts`).

**Como aplicar:** o import do módulo testado usa caminho relativo com extensão `.ts` (o alias `$lib` não
existe fora do Vite) e o módulo não pode importar `$lib` nem `$env`. Passe o arquivo explicitamente:
`node --test tests/` sem arquivo falha. Função que depende de D1 ou do SvelteKit pede Vitest.
