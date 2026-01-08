import { habits } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { generateId, requireAuth } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = requireAuth(locals);

	const userHabits = await locals.db
		.select()
		.from(habits)
		.where(and(eq(habits.userId, userId), isNull(habits.deletedAt)))
		.orderBy(habits.createdAt);

	return { habits: userHabits };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();

		const title = formData.get('title') as string;
		const frequencyType = formData.get('frequencyType') as 'weekly' | 'monthly';
		const frequencyValue = parseInt(formData.get('frequencyValue') as string) || 1;

		let targetDays: string | null = null;
		if (frequencyType === 'weekly') {
			const days = formData.getAll('targetDays') as string[];
			targetDays = JSON.stringify(days);
		}

		await locals.db.insert(habits).values({
			id: generateId(),
			userId,
			title,
			frequencyType,
			frequencyValue,
			targetDays
		});

		return { success: true };
	},

	toggle: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();
		const habitId = formData.get('habitId') as string;
		const active = formData.get('active') === 'true' ? 1 : 0;

		// Verificar se o hábito pertence ao usuário
		const habit = await locals.db
			.select({ odUserId: habits.userId })
			.from(habits)
			.where(eq(habits.id, habitId))
			.get();

		if (!habit || habit.odUserId !== userId) {
			return { error: 'Unauthorized' };
		}

		await locals.db.update(habits).set({ active }).where(eq(habits.id, habitId));

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();
		const habitId = formData.get('habitId') as string;

		// Verificar se o hábito pertence ao usuário
		const habit = await locals.db
			.select({ odUserId: habits.userId })
			.from(habits)
			.where(eq(habits.id, habitId))
			.get();

		if (!habit || habit.odUserId !== userId) {
			return { error: 'Unauthorized' };
		}

		await locals.db
			.update(habits)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(habits.id, habitId));

		return { success: true };
	}
};
