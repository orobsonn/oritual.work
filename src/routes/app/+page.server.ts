import { dailyEntries, tasks, users, couples } from '$lib/server/db/schema';
import { eq, desc, and, isNull, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

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

	return {
		recentDays: entriesWithStats,
		isPremium: user?.isPremium === 1,
		hasCouple: !!couple
	};
};
