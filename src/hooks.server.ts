import type { Handle } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
	// Inicializa o banco de dados
	if (event.platform?.env.DB) {
		event.locals.db = createDb(event.platform.env.DB);
	}

	// Verificar sessão
	const sessionCookie = event.cookies.get('session');

	if (sessionCookie && event.locals.db) {
		const [userId] = sessionCookie.split(':');

		if (userId) {
			try {
				const user = await event.locals.db
					.select({
						id: users.id,
						email: users.email,
						name: users.name
					})
					.from(users)
					.where(eq(users.id, userId))
					.get();

				if (user) {
					event.locals.user = user;
				}
			} catch (e) {
				console.error('Session error:', e);
			}
		}
	}

	if (!event.locals.user) {
		event.locals.user = null;
	}

	return resolve(event);
};
