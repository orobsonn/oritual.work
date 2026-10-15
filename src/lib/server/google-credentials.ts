import { env } from '$env/dynamic/private';

// Lidas em execução (não no build); por isso a leitura fica dentro da função.
export function getGoogleCredentials(): { clientId: string; clientSecret: string } {
	const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret } = env;
	if (!clientId || !clientSecret) {
		throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET não configurados');
	}
	return { clientId, clientSecret };
}
