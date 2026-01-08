import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = requireAuth(locals);
	const user = await locals.db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.get();

	return {
		affirmation: user?.affirmation ?? '',
		isPremium: user?.isPremium === 1
	};
};

export const actions: Actions = {
	saveAffirmation: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();
		const affirmation = formData.get('affirmation') as string;

		await locals.db
			.update(users)
			.set({ affirmation })
			.where(eq(users.id, userId));

		return { success: true };
	}
};
