---
paths:
  - "src/routes/**/+page.server.ts"
  - "src/routes/**/+server.ts"
  - "src/routes/**/+page.svelte"
  - "src/lib/server/**/*.ts"
---

# Datas no fuso de Brasília

Carrega ao mexer em rotas e no servidor. Garante que "hoje", semana e mês do usuário sejam os de `America/Sao_Paulo`.

## Convenções
- Data do usuário (hoje, semana, mês, dia da semana) vem de `src/lib/server/date-utils.ts`: `getTodayDateBrazil`, `getWeekDateRangeBrazil`, `getMonthDateRangeBrazil`, `getCurrentWeekDayBrazil`.
- Não calcule "hoje" com `new Date()` nem com `toLocaleDateString('en-CA', { timeZone })` na mão.
- Falta um helper? Crie em `date-utils.ts` e use nos dois lugares, em vez de repetir o cálculo na rota.
- Datas de negócio são texto `YYYY-MM-DD`. A semana começa na segunda (0 = segunda, 6 = domingo).
- Ao editar um trecho que calcula o fuso inline, migre para o helper no mesmo PR.
- Carimbo técnico (`deletedAt`, `updatedAt`, `expiresAt`) é instante UTC: `new Date().toISOString()` é o certo.

## Exemplos
```typescript
import { getTodayDateBrazil } from '$lib/server/date-utils';

export const load: PageServerLoad = async ({ locals }) => {
	const today = getTodayDateBrazil();
	// ...
};
```

## Armadilhas
- **`new Date()` à noite**: o Worker roda em UTC. Depois das 21h em Brasília já é "amanhã" lá, e diário, hábito ou tarefa cai no dia errado.
- **Componente `.svelte` não importa `$lib/server`**: calcule `today` no `load` e leia por `data.today`, como em `agenda/+page.svelte`.
- **Comparar "amanhã" com `new Date()` do navegador**: usa o fuso do aparelho, não o de Brasília. Derive de `data.today`.
