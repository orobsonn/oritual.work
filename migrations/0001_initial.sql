-- ==================== USUÁRIOS ====================

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  affirmation TEXT,
  stripe_customer_id TEXT,
  is_premium INTEGER DEFAULT 0,
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
  used INTEGER DEFAULT 0,
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
  completed INTEGER DEFAULT 0,
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
  target_days TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE TABLE habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id),
  date DATE NOT NULL,
  completed INTEGER NOT NULL,
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
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE TABLE couple_habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES couple_habits(id),
  date DATE NOT NULL,
  completed INTEGER NOT NULL,
  marked_by_user_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, date)
);

-- ==================== ÍNDICES ====================

CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, date);
CREATE INDEX idx_tasks_entry ON tasks(entry_id);
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(habit_id, date);
CREATE INDEX idx_personal_goals_user ON personal_goals(user_id);
