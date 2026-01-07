// See https://svelte.dev/docs/kit/types#app.d.ts
/// <reference types="./worker-configuration" />
import type { Database } from '$lib/server/db';

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
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};