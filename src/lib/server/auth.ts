import { Google } from 'arctic';
import { redirect } from '@sveltejs/kit';
import { getGoogleCredentials } from '$lib/server/google-credentials';

// Helper para validar sessão nas actions - lança redirect se não autenticado
export function requireAuth(locals: App.Locals): string {
	if (!locals.user) {
		throw redirect(302, '/login');
	}
	return locals.user.id;
}

export function createGoogleClient(origin: string): Google {
	const redirectUri = `${origin}/login/google/callback`;
	const { clientId, clientSecret } = getGoogleCredentials();
	return new Google(clientId, clientSecret, redirectUri);
}

export function createGoogleCalendarClient(origin: string): Google {
	const redirectUri = `${origin}/app/settings/calendar-callback`;
	const { clientId, clientSecret } = getGoogleCredentials();
	return new Google(clientId, clientSecret, redirectUri);
}

// Gera um ID único para sessões e usuários
export function generateId(): string {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Gera token de sessão
export function generateSessionToken(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
