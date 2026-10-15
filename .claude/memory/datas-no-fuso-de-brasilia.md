---
name: datas-no-fuso-de-brasilia
description: Datas do usuário seguem America/Sao_Paulo; use os helpers de date-utils.ts
---

**Por quê:** o Worker roda em UTC. À noite no Brasil, `new Date()` já é "amanhã" em UTC e o diário, hábitos e tarefas cairiam no dia errado.

**Como aplicar:** use `getTodayDateBrazil`, `getWeekDateRangeBrazil`, `getMonthDateRangeBrazil` e `getCurrentWeekDayBrazil` de `src/lib/server/date-utils.ts`. A semana começa na segunda. Datas são guardadas como texto `YYYY-MM-DD`.

Hoje alguns trechos (ex.: `routes/app/today/+page.server.ts`) calculam o fuso inline com `toLocaleDateString('en-CA', { timeZone })`; ao mexer neles, migre para os helpers.
