# Ontrack

App de produtividade pessoal focado em **rotina diária como ritual** + **acompanhamento de metas**.

## Stack

- **Frontend:** SvelteKit + PWA
- **Backend:** Cloudflare Workers
- **Banco de dados:** Cloudflare D1 (SQLite)
- **ORM:** Drizzle
- **Autenticação:** Google OAuth

## Funcionalidades

### Gratuito
- **Diário diário** - Gratidão, intenção, tarefas, reflexão
- **Hábitos** - Semanais e mensais com tracking
- **Metas** - Progresso com histórico
- **Afirmação diária** - Frase motivacional no ritual matinal

### Premium (R$ 47)
- **Metas de casal** - Compartilhe objetivos com seu parceiro(a)
- **Hábitos de casal** - Acompanhem juntos

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Aplicar migrations no D1 local
wrangler d1 migrations apply ontrack-db --local

# Deploy
npm run deploy
```

## Variáveis de Ambiente

Criar arquivo `.env`:

```
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
```

## Estrutura

```
src/
├── routes/
│   ├── app/           # Área autenticada
│   │   ├── today/     # Diário do dia
│   │   ├── goals/     # Metas pessoais
│   │   ├── habits/    # Hábitos
│   │   ├── couple/    # Área do casal (premium)
│   │   └── settings/  # Configurações
│   ├── login/         # Autenticação
│   └── onboarding/    # Setup inicial
├── lib/
│   └── server/
│       ├── auth.ts    # Google OAuth
│       └── db/        # Schema Drizzle
└── hooks.server.ts    # Middleware de auth
```
