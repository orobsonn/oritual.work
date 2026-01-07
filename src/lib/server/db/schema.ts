import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ==================== USUÁRIOS ====================

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	googleId: text('google_id').unique().notNull(),
	email: text('email').notNull(),
	name: text('name'),
	timezone: text('timezone').default('America/Sao_Paulo'),
	affirmation: text('affirmation'),
	onboardingCompleted: integer('onboarding_completed').default(0),
	stripeCustomerId: text('stripe_customer_id'),
	isPremium: integer('is_premium').default(0),
	premiumPurchasedAt: text('premium_purchased_at'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at')
});

// ==================== CASAIS ====================

export const couples = sqliteTable('couples', {
	id: text('id').primaryKey(),
	userId1: text('user_id_1').notNull().references(() => users.id),
	userId2: text('user_id_2').notNull().references(() => users.id),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at')
});

export const partnerInvites = sqliteTable('partner_invites', {
	id: text('id').primaryKey(),
	code: text('code').unique().notNull(),
	fromUserId: text('from_user_id').notNull().references(() => users.id),
	expiresAt: text('expires_at').notNull(),
	used: integer('used').default(0),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ==================== DIÁRIO ====================

export const dailyEntries = sqliteTable('daily_entries', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id),
	date: text('date').notNull(),
	gratitude: text('gratitude'),
	intention: text('intention'),
	greatThings: text('great_things'),
	couldHaveDone: text('could_have_done'),
	tomorrowPlans: text('tomorrow_plans'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at')
});

export const tasks = sqliteTable('tasks', {
	id: text('id').primaryKey(),
	entryId: text('entry_id').notNull().references(() => dailyEntries.id),
	category: text('category').notNull(), // 'work' | 'personal'
	description: text('description').notNull(),
	completed: integer('completed').default(0),
	position: integer('position').default(0),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at')
});

// ==================== METAS PESSOAIS ====================

export const personalGoals = sqliteTable('personal_goals', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id),
	title: text('title').notNull(),
	targetValue: integer('target_value').notNull(),
	currentValue: integer('current_value').default(0),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at')
});

export const goalProgressLog = sqliteTable('goal_progress_log', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').notNull().references(() => personalGoals.id),
	previousValue: integer('previous_value').notNull(),
	newValue: integer('new_value').notNull(),
	note: text('note'),
	date: text('date').notNull(),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ==================== HÁBITOS PESSOAIS ====================

export const habits = sqliteTable('habits', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id),
	title: text('title').notNull(),
	frequencyType: text('frequency_type').notNull(), // 'weekly' | 'monthly'
	frequencyValue: integer('frequency_value').notNull(),
	targetDays: text('target_days'), // JSON: '["mon","wed","fri"]'
	active: integer('active').default(1),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at')
});

export const habitCompletions = sqliteTable('habit_completions', {
	id: text('id').primaryKey(),
	habitId: text('habit_id').notNull().references(() => habits.id),
	date: text('date').notNull(),
	completed: integer('completed').notNull(),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ==================== METAS DE CASAL ====================

export const coupleGoals = sqliteTable('couple_goals', {
	id: text('id').primaryKey(),
	coupleId: text('couple_id').notNull().references(() => couples.id),
	title: text('title').notNull(),
	targetValue: integer('target_value').notNull(),
	currentValue: integer('current_value').default(0),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at')
});

export const coupleGoalProgressLog = sqliteTable('couple_goal_progress_log', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').notNull().references(() => coupleGoals.id),
	userId: text('user_id').notNull().references(() => users.id),
	previousValue: integer('previous_value').notNull(),
	newValue: integer('new_value').notNull(),
	note: text('note'),
	date: text('date').notNull(),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ==================== HÁBITOS DE CASAL ====================

export const coupleHabits = sqliteTable('couple_habits', {
	id: text('id').primaryKey(),
	coupleId: text('couple_id').notNull().references(() => couples.id),
	title: text('title').notNull(),
	frequencyType: text('frequency_type').notNull(), // 'weekly' | 'monthly'
	frequencyValue: integer('frequency_value').notNull(),
	targetDays: text('target_days'),
	active: integer('active').default(1),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at')
});

export const coupleHabitCompletions = sqliteTable('couple_habit_completions', {
	id: text('id').primaryKey(),
	habitId: text('habit_id').notNull().references(() => coupleHabits.id),
	date: text('date').notNull(),
	completed: integer('completed').notNull(),
	markedByUserId: text('marked_by_user_id').references(() => users.id),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});
