import { redirect } from '@sveltejs/kit';
import { users, habits, personalGoals } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	// Step 1: Salvar afirmação
	saveAffirmation: async ({ request, locals }) => {
		const formData = await request.formData();
		const affirmation = formData.get('affirmation') as string;

		await locals.db
			.update(users)
			.set({ affirmation })
			.where(eq(users.id, locals.user!.id));

		return { step: 2 };
	},

	// Step 2: Criar hábitos iniciais
	saveHabits: async ({ request, locals }) => {
		const formData = await request.formData();
		const habitsData = formData.getAll('habits') as string[];
		const habitDaysData = formData.getAll('habitDays') as string[];

		for (let i = 0; i < habitsData.length; i++) {
			const title = habitsData[i];
			const daysJson = habitDaysData[i] || '[]';
			const days = JSON.parse(daysJson) as string[];

			if (title.trim() && days.length > 0) {
				await locals.db.insert(habits).values({
					id: generateId(),
					userId: locals.user!.id,
					title: title.trim(),
					frequencyType: 'weekly',
					frequencyValue: days.length,
					targetDays: JSON.stringify(days)
				});
			}
		}

		return { step: 3 };
	},

	// Step 3: Criar metas iniciais
	saveGoals: async ({ request, locals }) => {
		const formData = await request.formData();
		const goalsData = formData.getAll('goals') as string[];
		const targetsData = formData.getAll('targets') as string[];

		for (let i = 0; i < goalsData.length; i++) {
			const title = goalsData[i];
			const target = parseInt(targetsData[i]) || 1;

			if (title.trim()) {
				await locals.db.insert(personalGoals).values({
					id: generateId(),
					userId: locals.user!.id,
					title: title.trim(),
					targetValue: target,
					currentValue: 0
				});
			}
		}

		return { step: 4 };
	},

	// Step 4: Finalizar (pergunta sobre casal)
	finish: async ({ request, locals }) => {
		const formData = await request.formData();
		const hasPartner = formData.get('hasPartner') === 'true';
		const wantsPremium = formData.get('wantsPremium') === 'true';

		// Marcar onboarding como completo
		await locals.db
			.update(users)
			.set({ onboardingCompleted: 1 })
			.where(eq(users.id, locals.user!.id));

		if (hasPartner && wantsPremium) {
			// Redirecionar para checkout com desconto
			redirect(302, '/checkout?promo=welcome');
		}

		redirect(302, '/app');
	},

	// Pular onboarding
	skip: async ({ locals }) => {
		await locals.db
			.update(users)
			.set({ onboardingCompleted: 1 })
			.where(eq(users.id, locals.user!.id));

		redirect(302, '/app');
	}
};
