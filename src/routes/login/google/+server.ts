import { redirect } from '@sveltejs/kit';
import { generateState, generateCodeVerifier } from 'arctic';
import { createGoogleClient } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const google = createGoogleClient(url.origin);
	const authUrl = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

	const isProduction = url.origin.includes('workers.dev') || url.origin.includes('oritual.work');

	cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutos
		sameSite: 'lax',
		secure: isProduction
	});

	cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
		secure: isProduction
	});

	redirect(302, authUrl.toString());
};
