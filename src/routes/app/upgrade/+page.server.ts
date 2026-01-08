import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { users } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const user = await locals.db.query.users.findFirst({
		where: eq(users.id, locals.user.id)
	});

	// If already premium, redirect to couple page
	if (user?.isPremium) {
		throw redirect(302, '/app/couple');
	}

	return {};
};
