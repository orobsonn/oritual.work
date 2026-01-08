import { dailyEntries, tasks, habitCompletions, habits, users, couples, coupleHabits, coupleHabitCompletions } from '$lib/server/db/schema';
import { eq, and, isNull, or } from 'drizzle-orm';
import { requireAuth } from '$lib/server/auth';
import { getTodayDateBrazil } from '$lib/server/date-utils';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

function getDayOfWeekFromDate(dateStr: string): string {
	const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
	const [year, month, day] = dateStr.split('-').map(Number);
	return days[new Date(year, month - 1, day).getDay()];
}

function formatDateDisplay(dateStr: string): string {
	const [year, month, day] = dateStr.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const userId = requireAuth(locals);
	const today = getTodayDateBrazil();
	const requestedDate = params.date;

	// Validar formato da data (YYYY-MM-DD)
	if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
		throw redirect(302, '/app/today');
	}

	// Se for hoje, redirecionar para a rota principal
	if (requestedDate === today) {
		throw redirect(302, '/app/today');
	}

	// Não permitir datas futuras
	if (requestedDate > today) {
		throw redirect(302, '/app/today');
	}

	const dayOfWeek = getDayOfWeekFromDate(requestedDate);

	// Buscar entry do dia (se existir)
	const entry = await locals.db
		.select()
		.from(dailyEntries)
		.where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, requestedDate)))
		.get();

	// Se não existir entry para o dia, mostrar vazio
	if (!entry) {
		return {
			entry: null,
			tasks: [],
			habits: [],
			affirmation: null,
			date: requestedDate,
			dateDisplay: formatDateDisplay(requestedDate),
			isReadOnly: true
		};
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
		.where(and(eq(habits.userId, userId), isNull(habits.deletedAt)));

	// Filtrar hábitos que deveriam aparecer naquele dia
	const dayPersonalHabits = userHabits.filter((habit) => {
		if (habit.frequencyType === 'weekly' && habit.targetDays) {
			const targetDays = JSON.parse(habit.targetDays) as string[];
			return targetDays.includes(dayOfWeek);
		}
		return habit.frequencyType === 'monthly';
	});

	// Buscar completude dos hábitos pessoais daquele dia
	const personalHabitIds = dayPersonalHabits.map((h) => h.id);
	const dayPersonalCompletions = personalHabitIds.length > 0
		? await locals.db
				.select()
				.from(habitCompletions)
				.where(eq(habitCompletions.date, requestedDate))
		: [];

	const personalHabitsWithStatus = dayPersonalHabits.map((habit) => {
		const completedOnDay = dayPersonalCompletions.some((c) => c.habitId === habit.id && c.completed === 1);
		return {
			...habit,
			completedToday: completedOnDay,
			isCouple: false,
			monthlyCompleted: 0,
			monthlyTarget: 0
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
			.where(and(eq(coupleHabits.coupleId, couple.id), isNull(coupleHabits.deletedAt)));

		// Filtrar hábitos de casal daquele dia
		const dayCoupleHabits = userCoupleHabits.filter((habit) => {
			if (habit.frequencyType === 'weekly' && habit.targetDays) {
				const targetDays = JSON.parse(habit.targetDays) as string[];
				return targetDays.includes(dayOfWeek);
			}
			return habit.frequencyType === 'monthly';
		});

		// Buscar completude dos hábitos de casal daquele dia
		const coupleHabitIds = dayCoupleHabits.map((h) => h.id);
		const dayCoupleCompletions = coupleHabitIds.length > 0
			? await locals.db
					.select()
					.from(coupleHabitCompletions)
					.where(eq(coupleHabitCompletions.date, requestedDate))
			: [];

		coupleHabitsWithStatus = dayCoupleHabits.map((habit) => {
			const completedOnDay = dayCoupleCompletions.some((c) => c.habitId === habit.id && c.completed === 1);
			return {
				id: habit.id,
				title: habit.title,
				frequencyType: habit.frequencyType,
				frequencyValue: habit.frequencyValue,
				targetDays: habit.targetDays,
				completedToday: completedOnDay,
				isCouple: true,
				monthlyCompleted: 0,
				monthlyTarget: 0
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
		date: requestedDate,
		dateDisplay: formatDateDisplay(requestedDate),
		isReadOnly: true
	};
};
