import { dailyEntries, tasks, users, couples, habits, habitCompletions, personalGoals, coupleGoals, coupleHabits, coupleHabitCompletions } from '$lib/server/db/schema';
import { eq, desc, and, isNull, or, gte, lte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

function getWeekDateRange(): { start: string; end: string } {
	const now = new Date();
	const dayOfWeek = now.getDay();
	const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Segunda-feira
	const monday = new Date(now.getFullYear(), now.getMonth(), diff);
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	return {
		start: monday.toISOString().split('T')[0],
		end: sunday.toISOString().split('T')[0]
	};
}

function getMonthDateRange(): { start: string; end: string } {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const start = new Date(year, month, 1).toISOString().split('T')[0];
	const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
	return { start, end };
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;
	const { start: weekStart, end: weekEnd } = getWeekDateRange();
	const { start: monthStart, end: monthEnd } = getMonthDateRange();

	// Buscar dados do usuário para ver se é premium
	const user = await locals.db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.get();

	// Verificar se está em um casal
	const couple = await locals.db
		.select()
		.from(couples)
		.where(
			and(
				or(eq(couples.userId1, userId), eq(couples.userId2, userId)),
				isNull(couples.deletedAt)
			)
		)
		.get();

	// Buscar últimos 7 dias com entradas
	const recentEntries = await locals.db
		.select()
		.from(dailyEntries)
		.where(eq(dailyEntries.userId, userId))
		.orderBy(desc(dailyEntries.date))
		.limit(7);

	// Para cada entry, buscar contagem de tarefas
	const entriesWithStats = await Promise.all(
		recentEntries.map(async (entry) => {
			const entryTasks = await locals.db
				.select()
				.from(tasks)
				.where(and(eq(tasks.entryId, entry.id), isNull(tasks.deletedAt)));

			const total = entryTasks.length;
			const completed = entryTasks.filter((t) => t.completed === 1).length;

			return {
				date: entry.date,
				hasContent: !!(entry.gratitude || entry.intention || entry.greatThings),
				taskStats: {
					total,
					completed,
					percent: total > 0 ? Math.round((completed / total) * 100) : 0
				}
			};
		})
	);

	// === ANÁLISES ===

	// Tarefas da semana
	const weekEntries = await locals.db
		.select()
		.from(dailyEntries)
		.where(
			and(
				eq(dailyEntries.userId, userId),
				gte(dailyEntries.date, weekStart),
				lte(dailyEntries.date, weekEnd)
			)
		);

	let weekTasksTotal = 0;
	let weekTasksCompleted = 0;

	for (const entry of weekEntries) {
		const entryTasks = await locals.db
			.select()
			.from(tasks)
			.where(and(eq(tasks.entryId, entry.id), isNull(tasks.deletedAt)));
		weekTasksTotal += entryTasks.length;
		weekTasksCompleted += entryTasks.filter(t => t.completed === 1).length;
	}

	// Tarefas do mês
	const monthEntries = await locals.db
		.select()
		.from(dailyEntries)
		.where(
			and(
				eq(dailyEntries.userId, userId),
				gte(dailyEntries.date, monthStart),
				lte(dailyEntries.date, monthEnd)
			)
		);

	let monthTasksTotal = 0;
	let monthTasksCompleted = 0;

	for (const entry of monthEntries) {
		const entryTasks = await locals.db
			.select()
			.from(tasks)
			.where(and(eq(tasks.entryId, entry.id), isNull(tasks.deletedAt)));
		monthTasksTotal += entryTasks.length;
		monthTasksCompleted += entryTasks.filter(t => t.completed === 1).length;
	}

	// Hábitos pessoais - aderência da semana e mês
	const userHabits = await locals.db
		.select()
		.from(habits)
		.where(and(eq(habits.userId, userId), eq(habits.active, 1), isNull(habits.deletedAt)));

	// Calcular aderência semanal de hábitos
	let weekHabitExpected = 0;
	let weekHabitCompleted = 0;

	// IDs dos hábitos do usuário para filtrar completações
	const userHabitIds = userHabits.map(h => h.id);

	// Mapear dia da semana para índice (seg=0, dom=6)
	const dayIndexMap: Record<string, number> = {
		'mon': 0, 'tue': 1, 'wed': 2, 'thu': 3, 'fri': 4, 'sat': 5, 'sun': 6
	};

	// Calcular qual dia da semana estamos (0=seg, 6=dom)
	const today = new Date();
	const todayDayOfWeek = today.getDay();
	const currentWeekDayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1; // Converter para seg=0

	if (userHabitIds.length > 0) {
		const weekCompletions = await locals.db
			.select()
			.from(habitCompletions)
			.where(
				and(
					gte(habitCompletions.date, weekStart),
					lte(habitCompletions.date, weekEnd),
					eq(habitCompletions.completed, 1)
				)
			);

		// Filtrar apenas completações dos hábitos do usuário
		const userWeekCompletions = weekCompletions.filter(c => userHabitIds.includes(c.habitId));

		for (const habit of userHabits) {
			if (habit.frequencyType === 'weekly' && habit.targetDays) {
				const targetDays = JSON.parse(habit.targetDays) as string[];
				// Contar apenas dias que já passaram ou são hoje
				const daysUntilToday = targetDays.filter(day => dayIndexMap[day] <= currentWeekDayIndex);
				weekHabitExpected += daysUntilToday.length;
				weekHabitCompleted += userWeekCompletions.filter(c => c.habitId === habit.id).length;
			}
		}
	}

	// Metas pessoais
	const userGoals = await locals.db
		.select()
		.from(personalGoals)
		.where(and(eq(personalGoals.userId, userId), isNull(personalGoals.deletedAt)));

	const goalsStats = userGoals.map(g => ({
		id: g.id,
		title: g.title,
		current: g.currentValue ?? 0,
		target: g.targetValue,
		percent: Math.min(100, Math.round(((g.currentValue ?? 0) / g.targetValue) * 100))
	}));

	// Metas de casal
	let coupleGoalsStats: Array<{
		id: string;
		title: string;
		current: number;
		target: number;
		percent: number;
	}> = [];

	if (couple) {
		const userCoupleGoals = await locals.db
			.select()
			.from(coupleGoals)
			.where(and(eq(coupleGoals.coupleId, couple.id), isNull(coupleGoals.deletedAt)));

		coupleGoalsStats = userCoupleGoals.map(g => ({
			id: g.id,
			title: g.title,
			current: g.currentValue ?? 0,
			target: g.targetValue,
			percent: Math.min(100, Math.round(((g.currentValue ?? 0) / g.targetValue) * 100))
		}));
	}

	return {
		recentDays: entriesWithStats,
		isPremium: user?.isPremium === 1,
		hasCouple: !!couple,
		analytics: {
			tasks: {
				week: {
					total: weekTasksTotal,
					completed: weekTasksCompleted,
					percent: weekTasksTotal > 0 ? Math.round((weekTasksCompleted / weekTasksTotal) * 100) : 0
				},
				month: {
					total: monthTasksTotal,
					completed: monthTasksCompleted,
					percent: monthTasksTotal > 0 ? Math.round((monthTasksCompleted / monthTasksTotal) * 100) : 0
				}
			},
			habits: {
				week: {
					expected: weekHabitExpected,
					completed: weekHabitCompleted,
					percent: weekHabitExpected > 0 ? Math.round((weekHabitCompleted / weekHabitExpected) * 100) : 0
				}
			},
			goals: goalsStats,
			coupleGoals: coupleGoalsStats
		}
	};
};
