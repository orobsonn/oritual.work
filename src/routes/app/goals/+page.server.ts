import { personalGoals, goalProgressLog } from '$lib/server/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { generateId, requireAuth } from '$lib/server/auth';
import { getTodayDateBrazil } from '$lib/server/date-utils';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = requireAuth(locals);

	const goals = await locals.db
		.select()
		.from(personalGoals)
		.where(and(eq(personalGoals.userId, userId), isNull(personalGoals.deletedAt)))
		.orderBy(desc(personalGoals.createdAt));

	return { goals };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();

		const title = formData.get('title') as string;
		const targetValue = parseInt(formData.get('targetValue') as string) || 1;

		await locals.db.insert(personalGoals).values({
			id: generateId(),
			userId,
			title,
			targetValue,
			currentValue: 0
		});

		return { success: true };
	},

	updateProgress: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();

		const goalId = formData.get('goalId') as string;
		const newValue = parseInt(formData.get('newValue') as string);
		const note = formData.get('note') as string | null;

		// Buscar valor atual e verificar propriedade
		const goal = await locals.db
			.select()
			.from(personalGoals)
			.where(and(eq(personalGoals.id, goalId), eq(personalGoals.userId, userId)))
			.get();

		if (!goal) return { error: 'Goal not found or unauthorized' };

		const previousValue = goal.currentValue ?? 0;

		// Atualizar meta
		await locals.db
			.update(personalGoals)
			.set({ currentValue: newValue })
			.where(eq(personalGoals.id, goalId));

		// Registrar log
		await locals.db.insert(goalProgressLog).values({
			id: generateId(),
			goalId,
			previousValue,
			newValue,
			note,
			date: getTodayDateBrazil()
		});

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();
		const goalId = formData.get('goalId') as string;

		// Verificar se a meta pertence ao usuário
		const goal = await locals.db
			.select({ odUserId: personalGoals.userId })
			.from(personalGoals)
			.where(eq(personalGoals.id, goalId))
			.get();

		if (!goal || goal.odUserId !== userId) {
			return { error: 'Unauthorized' };
		}

		await locals.db
			.update(personalGoals)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(personalGoals.id, goalId));

		return { success: true };
	}
};
