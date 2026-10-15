# src/lib/server

- `auth.ts`: `requireAuth`, clientes Google OAuth, geração de IDs e token de sessão.
- `db/`: `createDb` e `schema.ts` (Drizzle). O schema espelha as migrations.
- `date-utils.ts`: datas no fuso de Brasília. Use estes helpers, não `new Date()` direto.
- `google-credentials.ts`: `getGoogleCredentials()`, lê o client id/secret do Google em execução.
- `google-calendar.ts`: sincronização de tarefas agendadas com o Google Calendar do usuário.

Armadilhas:
- A sessão é o cookie `session` no formato `userId:sessionToken`; o `hooks.server.ts` confere os dois contra `users`.
- O `userId` vem sempre de `locals.user`, nunca do que o navegador mandou.
- Segredos Google/Stripe vêm do ambiente; nunca escreva valor no código.
- Segredo lido com `$env/static/private` exige a variável no build e quebra `npm run build`. Use `$env/dynamic/private` (secret do Worker) e leia dentro de função, como em `getGoogleCredentials()`.
