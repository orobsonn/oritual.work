/**
 * Lê o JSON de `targetDays` de um hábito. Valor corrompido no banco não pode derrubar a página.
 */
export function parseTargetDays(rawTargetDays: string): string[] {
	try {
		const parsed: unknown = JSON.parse(rawTargetDays);
		if (Array.isArray(parsed) && parsed.every((day) => typeof day === 'string')) {
			return parsed;
		}
		return [];
	} catch {
		return [];
	}
}
