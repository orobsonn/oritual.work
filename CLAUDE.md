# Ontrack

App de produtividade pessoal: **rotina diária como ritual** (diário, tarefas, hábitos) e
**acompanhamento de metas**. Premium (pagamento único) libera metas e hábitos de casal.
Stack: SvelteKit 5 (PWA) em Cloudflare Workers, D1 (SQLite) com Drizzle, login Google (arctic), Stripe.

## Regras da empresa

As rules da Expert em `.claude/rules/` valem para tudo (git, segurança, qualidade, testes).
Resumo do que mais pega aqui: nada de commit direto na `master` (só por PR), segredo só em
variável de ambiente (`wrangler secret put`), entrada externa validada na borda, erro sem
`error.message` cru para o cliente.

## Regras do projeto

- Branch principal é `master` (não `main`).
- Exclusão é lógica: tabelas têm `deleted_at`; toda consulta filtra `deleted_at IS NULL`.
- Datas do usuário seguem o fuso `America/Sao_Paulo`; prefira os helpers de `src/lib/server/date-utils.ts` (alguns trechos ainda calculam na mão).
- Mudou o schema: crie migration nova em `migrations/` **e** atualize `src/lib/server/db/schema.ts`.
- Ações de formulário e páginas da área autenticada usam `requireAuth(locals)` (`src/lib/server/auth.ts`).

## Comandos

| O quê | Comando |
| --- | --- |
| Rodar local | `npm run dev` |
| Checar tipos | `npm run check` |
| Migrations no D1 local | `wrangler d1 migrations apply ontrack-db --local` |
| Publicar | `npm run deploy` (skill `publicando`) |
| Testes | ainda não há suíte (linha de base `sem-testes`) |

## Pastas

| Pasta | O que mora lá | Veja |
| --- | --- | --- |
| `src/routes/app/` | Área autenticada: hoje, agenda, metas, hábitos, casal, configurações, upgrade | `README.md` |
| `src/routes/login/`, `onboarding/` | Entrada com Google e configuração inicial | |
| `src/routes/api/stripe/` | Checkout e webhook do pagamento premium | `src/routes/api/stripe/CLAUDE.md` |
| `src/lib/server/` | Servidor: auth, banco (Drizzle), datas, Google Calendar | `src/lib/server/CLAUDE.md` |
| `src/lib/components/`, `stores/`, `styles/` | Componentes Svelte, tema claro/escuro, CSS | |
| `migrations/` | Migrations do D1, numeradas | `migrations/CLAUDE.md` |
| `docs/` | Plano do produto e, adiante, runbooks e decisões | `docs/plano.md` |
| `.claude/memory/` | Padrões e armadilhas do projeto | `.claude/memory/MEMORY.md` |

Glossário do negócio: `CONTEXT.md`.
