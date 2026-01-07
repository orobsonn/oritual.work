import { redirect } from '@sveltejs/kit';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	// Verificar se já completou onboarding
	const user = await locals.db.select().from(users).where(eq(users.id, locals.user.id)).get();

	if (user?.onboardingCompleted === 1) {
		redirect(302, '/app');
	}

	return {
		user: locals.user
	};
};
