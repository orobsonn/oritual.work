import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Se usuário está logado, redireciona para o app
	if (locals.user) {
		throw redirect(302, '/app');
	}
	// Caso contrário, mostra a landing page
};
