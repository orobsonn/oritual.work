// See https://svelte.dev/docs/kit/types#app.d.ts
/// <reference types="./worker-configuration" />
import type { Database } from '$lib/server/db';

// Extensão do Env para incluir variáveis do Stripe
interface ExtendedEnv extends Env {
	STRIPE_SECRET_KEY?: string;
	STRIPE_PRICE_ID?: string;
	STRIPE_ONBOARDING_PRICE_ID?: string;
	STRIPE_WEBHOOK_SECRET?: string;
}

declare global {
	namespace App {
		interface Locals {
			db: Database;
			user: {
				id: string;
				email: string;
				name: string | null;
			} | null;
		}
		interface Platform {
			env: ExtendedEnv;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};