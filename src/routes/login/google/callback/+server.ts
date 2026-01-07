import { redirect, error } from '@sveltejs/kit';
import { decodeIdToken } from 'arctic';
import { createGoogleClient, generateId, generateSessionToken } from '$lib/server/auth';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('google_oauth_state');
	const codeVerifier = cookies.get('google_code_verifier');

	// Validar state e code
	if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
		error(400, 'Invalid OAuth state');
	}

	let userId: string;
	let isNewUser = false;
	let onboardingCompleted = false;

	const google = createGoogleClient(url.origin);

	try {
		// Trocar code por tokens
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		const idToken = tokens.idToken();

		// Decodificar ID token para pegar informações do usuário
		const claims = decodeIdToken(idToken) as {
			sub: string;
			email: string;
			name?: string;
		};

		const googleId = claims.sub;
		const email = claims.email;
		const name = claims.name ?? null;

		// Verificar se usuário já existe
		const existingUser = await locals.db
			.select()
			.from(users)
			.where(eq(users.googleId, googleId))
			.get();

		if (existingUser) {
			userId = existingUser.id;
			onboardingCompleted = existingUser.onboardingCompleted === 1;
		} else {
			// Criar novo usuário
			userId = generateId();
			isNewUser = true;
			await locals.db.insert(users).values({
				id: userId,
				googleId,
				email,
				name
			});
		}

		// Criar sessão (usando cookie simples por enquanto)
		const sessionToken = generateSessionToken();
		const isProduction = url.origin.includes('workers.dev') || url.origin.includes('oritual.work');

		cookies.set('session', `${userId}:${sessionToken}`, {
			path: '/',
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 30, // 30 dias
			sameSite: 'lax',
			secure: isProduction
		});

		// Limpar cookies OAuth
		cookies.delete('google_oauth_state', { path: '/' });
		cookies.delete('google_code_verifier', { path: '/' });
	} catch (e) {
		console.error('OAuth error:', e);
		const errorMessage = e instanceof Error ? e.message : 'Unknown error';
		error(400, `Failed to authenticate with Google: ${errorMessage}`);
	}

	// Redirecionar novos usuários ou usuários sem onboarding para o onboarding
	if (isNewUser || !onboardingCompleted) {
		redirect(302, '/onboarding');
	}

	redirect(302, '/app');
};
