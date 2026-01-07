import { dailyEntries, tasks, habits, habitCompletions, users, couples, coupleHabits, coupleHabitCompletions } from '$lib/server/db/schema';
import { eq, and, isNull, or, gte, lte } from 'drizzle-orm';
import { generateId } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

function getTodayDate(): string {
	const now = new Date();
	return now.toISOString().split('T')[0];
}

function getDayOfWeek(): string {
	const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
	return days[new Date().getDay()];
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
	const today = getTodayDate();
	const dayOfWeek = getDayOfWeek();
	const { start: monthStart, end: monthEnd } = getMonthDateRange();

	// Buscar ou criar entry do dia
	let entry = await locals.db
		.select()
		.from(dailyEntries)
		.where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, today)))
		.get();

	if (!entry) {
		const entryId = generateId();
		await locals.db.insert(dailyEntries).values({
			id: entryId,
			userId,
			date: today
		});
		entry = { id: entryId, userId, date: today, gratitude: null, intention: null, greatThings: null, couldHaveDone: null, tomorrowPlans: null, createdAt: null, updatedAt: null };
	}

	// Buscar tarefas do dia
	const dayTasks = await locals.db
		.select()
		.from(tasks)
		.where(and(eq(tasks.entryId, entry.id), isNull(tasks.deletedAt)))
		.orderBy(tasks.position);

	// Buscar hábitos ativos do usuário
	const userHabits = await locals.db
		.select()
		.from(habits)
		.where(and(eq(habits.userId, userId), eq(habits.active, 1), isNull(habits.deletedAt)));

	// Filtrar hábitos pessoais que devem aparecer hoje
	const todayPersonalHabits = userHabits.filter((habit) => {
		if (habit.frequencyType === 'weekly' && habit.targetDays) {
			const targetDays = JSON.parse(habit.targetDays) as string[];
			return targetDays.includes(dayOfWeek);
		}
		// Hábitos mensais sempre aparecem como lembrete
		return habit.frequencyType === 'monthly';
	});

	// Buscar completude dos hábitos pessoais de hoje
	const personalHabitIds = todayPersonalHabits.map((h) => h.id);
	const todayPersonalCompletions = personalHabitIds.length > 0
		? await locals.db
				.select()
				.from(habitCompletions)
				.where(eq(habitCompletions.date, today))
		: [];

	// Buscar completações do mês para hábitos mensais
	const monthlyPersonalHabitIds = todayPersonalHabits.filter(h => h.frequencyType === 'monthly').map(h => h.id);
	const monthPersonalCompletions = monthlyPersonalHabitIds.length > 0
		? await locals.db
				.select()
				.from(habitCompletions)
				.where(
					and(
						gte(habitCompletions.date, monthStart),
						lte(habitCompletions.date, monthEnd),
						eq(habitCompletions.completed, 1)
					)
				)
		: [];

	const personalHabitsWithStatus = todayPersonalHabits.map((habit) => {
		const completedToday = todayPersonalCompletions.some((c) => c.habitId === habit.id && c.completed === 1);

		// Contar completações do mês para hábitos mensais
		let monthlyCompleted = 0;
		if (habit.frequencyType === 'monthly') {
			monthlyCompleted = monthPersonalCompletions.filter((c) => c.habitId === habit.id).length;
		}

		return {
			...habit,
			completedToday,
			isCouple: false,
			monthlyCompleted,
			monthlyTarget: habit.frequencyType === 'monthly' ? habit.frequencyValue : 0
		};
	});

	// Buscar casal do usuário (se existir)
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

	// Buscar hábitos de casal (se tiver casal)
	let coupleHabitsWithStatus: Array<{
		id: string;
		title: string;
		frequencyType: string;
		frequencyValue: number;
		targetDays: string | null;
		completedToday: boolean;
		isCouple: boolean;
		monthlyCompleted: number;
		monthlyTarget: number;
	}> = [];

	if (couple) {
		const userCoupleHabits = await locals.db
			.select()
			.from(coupleHabits)
			.where(and(eq(coupleHabits.coupleId, couple.id), eq(coupleHabits.active, 1), isNull(coupleHabits.deletedAt)));

		// Filtrar hábitos de casal que devem aparecer hoje
		const todayCoupleHabits = userCoupleHabits.filter((habit) => {
			if (habit.frequencyType === 'weekly' && habit.targetDays) {
				const targetDays = JSON.parse(habit.targetDays) as string[];
				return targetDays.includes(dayOfWeek);
			}
			// Hábitos mensais sempre aparecem como lembrete
			return habit.frequencyType === 'monthly';
		});

		// Buscar completude dos hábitos de casal de hoje
		const coupleHabitIds = todayCoupleHabits.map((h) => h.id);
		const todayCoupleCompletions = coupleHabitIds.length > 0
			? await locals.db
					.select()
					.from(coupleHabitCompletions)
					.where(eq(coupleHabitCompletions.date, today))
			: [];

		// Buscar completações do mês para hábitos de casal mensais
		const monthlyCoupleHabitIds = todayCoupleHabits.filter(h => h.frequencyType === 'monthly').map(h => h.id);
		const monthCoupleCompletions = monthlyCoupleHabitIds.length > 0
			? await locals.db
					.select()
					.from(coupleHabitCompletions)
					.where(
						and(
							gte(coupleHabitCompletions.date, monthStart),
							lte(coupleHabitCompletions.date, monthEnd),
							eq(coupleHabitCompletions.completed, 1)
						)
					)
			: [];

		coupleHabitsWithStatus = todayCoupleHabits.map((habit) => {
			const completedToday = todayCoupleCompletions.some((c) => c.habitId === habit.id && c.completed === 1);

			// Contar completações do mês para hábitos mensais
			let monthlyCompleted = 0;
			if (habit.frequencyType === 'monthly') {
				monthlyCompleted = monthCoupleCompletions.filter((c) => c.habitId === habit.id).length;
			}

			return {
				id: habit.id,
				title: habit.title,
				frequencyType: habit.frequencyType,
				frequencyValue: habit.frequencyValue,
				targetDays: habit.targetDays,
				completedToday,
				isCouple: true,
				monthlyCompleted,
				monthlyTarget: habit.frequencyType === 'monthly' ? habit.frequencyValue : 0
			};
		});
	}

	// Combinar hábitos pessoais e de casal
	const habitsWithStatus = [...personalHabitsWithStatus, ...coupleHabitsWithStatus];

	// Buscar afirmação do usuário
	const user = await locals.db.select().from(users).where(eq(users.id, userId)).get();

	return {
		entry,
		tasks: dayTasks,
		habits: habitsWithStatus,
		affirmation: user?.affirmation ?? null,
		today
	};
};

export const actions: Actions = {
	// Salvar campos de texto do diário (atualiza só os campos enviados)
	saveEntry: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const today = getTodayDate();
		const formData = await request.formData();

		// Construir objeto de update apenas com campos presentes no form
		const updateData: Record<string, string | null> = {
			updatedAt: new Date().toISOString()
		};

		if (formData.has('gratitude')) {
			updateData.gratitude = formData.get('gratitude') as string | null;
		}
		if (formData.has('intention')) {
			updateData.intention = formData.get('intention') as string | null;
		}
		if (formData.has('greatThings')) {
			updateData.greatThings = formData.get('greatThings') as string | null;
		}
		if (formData.has('couldHaveDone')) {
			updateData.couldHaveDone = formData.get('couldHaveDone') as string | null;
		}
		if (formData.has('tomorrowPlans')) {
			updateData.tomorrowPlans = formData.get('tomorrowPlans') as string | null;
		}

		await locals.db
			.update(dailyEntries)
			.set(updateData)
			.where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, today)));

		return { success: true };
	},

	// Adicionar tarefa
	addTask: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const today = getTodayDate();
		const formData = await request.formData();

		const description = formData.get('description') as string;
		const category = formData.get('category') as string;

		const entry = await locals.db
			.select()
			.from(dailyEntries)
			.where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, today)))
			.get();

		if (!entry) return { error: 'Entry not found' };

		// Contar tarefas existentes para posição
		const existingTasks = await locals.db
			.select()
			.from(tasks)
			.where(and(eq(tasks.entryId, entry.id), isNull(tasks.deletedAt)));

		await locals.db.insert(tasks).values({
			id: generateId(),
			entryId: entry.id,
			category,
			description,
			position: existingTasks.length
		});

		return { success: true };
	},

	// Toggle tarefa
	toggleTask: async ({ request, locals }) => {
		const formData = await request.formData();
		const taskId = formData.get('taskId') as string;
		const completed = formData.get('completed') === 'true' ? 1 : 0;

		await locals.db.update(tasks).set({ completed }).where(eq(tasks.id, taskId));

		return { success: true };
	},

	// Deletar tarefa
	deleteTask: async ({ request, locals }) => {
		const formData = await request.formData();
		const taskId = formData.get('taskId') as string;

		await locals.db
			.update(tasks)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(tasks.id, taskId));

		return { success: true };
	},

	// Toggle hábito (pessoal ou de casal)
	toggleHabit: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const today = getTodayDate();
		const formData = await request.formData();
		const habitId = formData.get('habitId') as string;
		const completed = formData.get('completed') === 'true' ? 1 : 0;
		const isCouple = formData.get('isCouple') === 'true';

		if (isCouple) {
			// Toggle hábito de casal
			const existing = await locals.db
				.select()
				.from(coupleHabitCompletions)
				.where(and(eq(coupleHabitCompletions.habitId, habitId), eq(coupleHabitCompletions.date, today)))
				.get();

			if (existing) {
				await locals.db
					.update(coupleHabitCompletions)
					.set({ completed, markedByUserId: userId })
					.where(eq(coupleHabitCompletions.id, existing.id));
			} else {
				await locals.db.insert(coupleHabitCompletions).values({
					id: generateId(),
					habitId,
					date: today,
					completed,
					markedByUserId: userId
				});
			}
		} else {
			// Toggle hábito pessoal
			const existing = await locals.db
				.select()
				.from(habitCompletions)
				.where(and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.date, today)))
				.get();

			if (existing) {
				await locals.db
					.update(habitCompletions)
					.set({ completed })
					.where(eq(habitCompletions.id, existing.id));
			} else {
				await locals.db.insert(habitCompletions).values({
					id: generateId(),
					habitId,
					date: today,
					completed
				});
			}
		}

		return { success: true };
	}
};
