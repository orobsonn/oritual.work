import { Google } from 'arctic';
import { redirect } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';

// Helper para validar sessão nas actions - lança redirect se não autenticado
export function requireAuth(locals: App.Locals): string {
	if (!locals.user) {
		throw redirect(302, '/login');
	}
	return locals.user.id;
}

export function createGoogleClient(origin: string): Google {
	const redirectUri = `${origin}/login/google/callback`;
	return new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
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
