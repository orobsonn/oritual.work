# Ontrack - Plano do Projeto

## Visão Geral

App de produtividade pessoal focado em **rotina diária como ritual** + **acompanhamento de metas**, com funcionalidade de metas compartilhadas para casais.

**Conceito:** O app é um ritual matinal. A pessoa acorda, faz sua rotina, e antes de começar o dia abre o Ontrack para planejar intencionalmente.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | SvelteKit + PWA |
| Backend | Cloudflare Workers |
| Banco de dados | Cloudflare D1 (SQLite) |
| Autenticação | Google OAuth |
| IA (v2 - futuro) | Workers AI (Whisper + LLM) |
| Jobs agendados | Cron Triggers (UTC-3 Brasília) |

## UI/UX

- **Estilo:** Minimalista autêntico (inspiração bearblog)
- **Gráficos:** Barras CSS puras, sem libs externas
- **Foco:** Funcionalidade > decoração

```
Exemplo de barra de progresso:
████████████████░░░░ 78%  (14/18 tarefas)
```

---

## Funcionalidades v1

### 1. Autenticação
- Login com Google OAuth (zero custo, sem disparo de email)
- Sessão persistente via cookies

### 2. Diário (core do produto)

**Manhã:**
- Gratidão (textarea livre - texto corrido ou bullets)
- Intenção (textarea livre - "O que faria meu dia perfeito?")
- Afirmação diária (configurada uma vez nas settings, exibida automaticamente)

**Tarefas do dia:**
- Duas categorias: Trabalho e Pessoal
- Barra de progresso atualiza em tempo real
- Tarefas não concluídas são "esquecidas" (não arrastam pro próximo dia)

**Hábitos do dia:**
- Separado das tarefas avulsas
- Sistema sugere hábitos baseado nos dias configurados
- Hábitos mensais aparecem como lembrete se ainda não completados no mês

**Noite:**
- Coisas incríveis que aconteceram (textarea)
- O que podia ter feito (textarea)
- O que pretendo fazer amanhã (textarea)

### 3. Metas Pessoais

**Dois tipos:**
- **Progresso:** "Ler 12 livros" → 5/12 concluídos
- **Hábito:** "Treinar 3x/semana" → define dias específicos (weekly) ou apenas frequência (monthly)

**Análises separadas:**
- Índice de completude de tarefas avulsas
- Índice de completude de hábitos/metas

### 4. Metas e Hábitos de Casal

- Vinculação via link/código único
- Metas compartilhadas (progresso)
- Hábitos compartilhados (ex: "Jantar romântico 1x/mês")
- Não há acesso ao diário pessoal do parceiro (privacidade)

### 5. Dashboard/Análise

- % de conclusão de tarefas (semanal e mensal)
- % de aderência aos hábitos
- Progresso das metas
- Tudo com barras CSS simples

---

## Schema do Banco de Dados (D1)

```sql
-- ==================== USUÁRIOS ====================

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  affirmation TEXT,
  -- Stripe
  stripe_customer_id TEXT,
  is_premium INTEGER DEFAULT 0,        -- 0 = free, 1 = premium
  premium_purchased_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

-- ==================== CASAIS ====================

CREATE TABLE couples (
  id TEXT PRIMARY KEY,
  user_id_1 TEXT NOT NULL REFERENCES users(id),
  user_id_2 TEXT NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE TABLE partner_invites (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  from_user_id TEXT NOT NULL REFERENCES users(id),
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,              -- 0 = não usado, 1 = usado
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== DIÁRIO ====================

CREATE TABLE daily_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  gratitude TEXT,
  intention TEXT,
  great_things TEXT,
  could_have_done TEXT,
  tomorrow_plans TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  UNIQUE(user_id, date)
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES daily_entries(id),
  category TEXT NOT NULL CHECK(category IN ('work', 'personal')),
  description TEXT NOT NULL,
  completed INTEGER DEFAULT 0,         -- 0 = pendente, 1 = concluída
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

-- ==================== METAS PESSOAIS (PROGRESSO) ====================

CREATE TABLE personal_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE TABLE goal_progress_log (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES personal_goals(id),
  previous_value INTEGER NOT NULL,
  new_value INTEGER NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== HÁBITOS PESSOAIS ====================

CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  frequency_type TEXT NOT NULL CHECK(frequency_type IN ('weekly', 'monthly')),
  frequency_value INTEGER NOT NULL,
  target_days TEXT,                    -- JSON para weekly: '["mon","wed","fri"]', NULL para monthly
  active INTEGER DEFAULT 1,            -- 0 = inativo, 1 = ativo
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE TABLE habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id),
  date DATE NOT NULL,
  completed INTEGER NOT NULL,          -- 0 = não fez, 1 = fez
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, date)
);

-- ==================== METAS DE CASAL (PROGRESSO) ====================

CREATE TABLE couple_goals (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL REFERENCES couples(id),
  title TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE TABLE couple_goal_progress_log (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES couple_goals(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  previous_value INTEGER NOT NULL,
  new_value INTEGER NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== HÁBITOS DE CASAL ====================

CREATE TABLE couple_habits (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL REFERENCES couples(id),
  title TEXT NOT NULL,
  frequency_type TEXT NOT NULL CHECK(frequency_type IN ('weekly', 'monthly')),
  frequency_value INTEGER NOT NULL,
  target_days TEXT,
  active INTEGER DEFAULT 1,            -- 0 = inativo, 1 = ativo
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE TABLE couple_habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES couple_habits(id),
  date DATE NOT NULL,
  completed INTEGER NOT NULL,          -- 0 = não fez, 1 = fez
  marked_by_user_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, date)
);
```

---

## Estrutura de Pastas (SvelteKit)

```
ontrack/
├── docs/
│   └── plano.md                      # Este documento
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Landing page (público)
│   │   ├── +layout.svelte            # Layout global
│   │   ├── app/
│   │   │   ├── +page.svelte          # Dashboard
│   │   │   ├── +layout.svelte        # Layout autenticado
│   │   │   ├── today/
│   │   │   │   └── +page.svelte      # Diário do dia
│   │   │   ├── goals/
│   │   │   │   └── +page.svelte      # Metas pessoais
│   │   │   ├── habits/
│   │   │   │   └── +page.svelte      # Hábitos pessoais
│   │   │   ├── couple/
│   │   │   │   ├── +page.svelte      # Área do casal
│   │   │   │   └── invite/+page.svelte
│   │   │   └── settings/
│   │   │       └── +page.svelte      # Configurações
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── google/+server.ts
│   │       │   └── callback/+server.ts
│   │       ├── entries/+server.ts
│   │       ├── tasks/+server.ts
│   │       ├── goals/+server.ts
│   │       ├── habits/+server.ts
│   │       ├── couple/+server.ts
│   │       └── stripe/
│   │           ├── checkout/+server.ts    # Criar sessão de pagamento
│   │           └── webhook/+server.ts     # Receber eventos do Stripe
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ProgressBar.svelte
│   │   │   ├── TaskItem.svelte
│   │   │   ├── HabitItem.svelte
│   │   │   ├── GoalCard.svelte
│   │   │   └── TextArea.svelte
│   │   ├── server/
│   │   │   ├── db.ts
│   │   │   ├── auth.ts
│   │   │   └── stripe.ts                  # Helper Stripe
│   │   └── stores/
│   │       └── user.ts
│   └── app.html
├── static/
│   ├── manifest.json
│   └── icons/
├── wrangler.toml
└── package.json
```

**Nota sobre estrutura futura:**
Se precisar de site institucional separado ou outras aplicações, pode migrar para monorepo:
```
ontrack/
├── apps/
│   ├── web/        # App principal (atual)
│   └── landing/    # Site institucional
├── packages/
│   └── shared/     # Código compartilhado
└── docs/
```

---

## Ordem de Implementação

### Fase 1: Fundação
1. Setup SvelteKit + adapter Cloudflare
2. Configurar Cloudflare D1 + criar tabelas
3. Implementar Google OAuth
4. PWA básico (manifest + service worker)

### Fase 2: Diário (core)
5. Tela "today" - estrutura manhã/tarefas/noite
6. CRUD de tarefas com categorias (work/personal)
7. Barra de progresso do dia
8. Salvamento automático dos campos de texto

### Fase 3: Hábitos Pessoais
9. CRUD de hábitos (weekly e monthly)
10. Lógica de sugestão no dia (weekly por target_days, monthly por lembrete)
11. Registro de completude
12. Cron job para marcar como `completed: false` hábitos não feitos

### Fase 4: Metas Pessoais
13. CRUD de metas de progresso
14. Log de progresso com histórico
15. Visualização de evolução

### Fase 5: Dashboard
16. % conclusão de tarefas (semanal/mensal)
17. % aderência aos hábitos
18. Progresso das metas

### Fase 6: Casal
19. Sistema de convites (gerar código/link)
20. Vinculação de contas (tabela couples)
21. Metas de casal
22. Hábitos de casal

### Fase 7 (v2 - futuro): IA
23. Integração Whisper para transcrição de áudio
24. LLM para categorizar tarefas automaticamente
25. Análises inteligentes com IA

**Nota:** IA será implementada primeiro como feature pessoal para teste. Se viável, entra como premium mensal (R$ 9,70/mês).

---

## Cron Job: Marcar hábitos não completados

**Quando:** 3h UTC (meia-noite em Brasília)

**Lógica:**
1. Para cada hábito ativo onde `frequency_type = 'weekly'`:
   - Verificar se ontem era um `target_day`
   - Se sim e não existe `habit_completion` para ontem → criar com `completed: false`
2. Para hábitos mensais, não precisa de cron (é apenas lembrete visual)

---

## Integração Stripe (Pagamentos)

**Modelo:** Pagamento único (one-time), não assinatura.

**Fluxo:**
1. Usuário clica em "Desbloquear Premium"
2. Frontend chama `/api/stripe/checkout` → cria Checkout Session
3. Usuário é redirecionado para página do Stripe
4. Após pagamento, Stripe chama `/api/stripe/webhook`
5. Webhook atualiza `users.is_premium = true`

**Endpoints:**
- `POST /api/stripe/checkout` - Cria sessão de checkout
- `POST /api/stripe/webhook` - Recebe eventos do Stripe (payment_intent.succeeded)

**Variáveis de ambiente (wrangler.toml secrets):**
```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
```

**O que premium desbloqueia:**
- Metas e hábitos de casal

---

## Considerações de Monetização

**Modelo definido:**
- **Gratuito:** Diário + metas/hábitos pessoais
- **Premium único (R$ 47):** Metas e hábitos de casal
- **Premium mensal (R$ 9,70/mês) - futuro v2:** IA (áudio para criar tarefas + análises inteligentes)

---

## Próximos Passos

1. ~~Criar pasta `docs/` e salvar este plano como `docs/plano.md`~~
2. `npm create svelte@latest .` (na raiz do projeto)
3. Configurar `wrangler.toml` para D1
4. Criar tabelas no D1
5. Implementar Google OAuth
6. Começar pela tela do diário
