import { googleCalendarTokens } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getGoogleCredentials } from '$lib/server/google-credentials';

interface CalendarEvent {
	summary: string;
	description?: string;
	start: {
		dateTime: string;
		timeZone: string;
	};
	end: {
		dateTime: string;
		timeZone: string;
	};
	reminders?: {
		useDefault: boolean;
		overrides?: Array<{ method: string; minutes: number }>;
	};
}

interface TokenData {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
}

// Renovar access token se expirado
async function refreshAccessToken(
	db: App.Locals['db'],
	userId: string,
	tokenData: TokenData
): Promise<string> {
	const now = Math.floor(Date.now() / 1000);

	// Se o token ainda é válido (com 5 min de margem), retorna o atual
	if (tokenData.expiresAt > now + 300) {
		return tokenData.accessToken;
	}

	// Renovar token usando refresh_token
	const { clientId, clientSecret } = getGoogleCredentials();
	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			refresh_token: tokenData.refreshToken,
			grant_type: 'refresh_token'
		})
	});

	if (!response.ok) {
		throw new Error('Failed to refresh access token');
	}

	const data = await response.json();
	const newAccessToken = data.access_token;
	const newExpiresAt = now + data.expires_in;

	// Atualizar token no banco
	await db
		.update(googleCalendarTokens)
		.set({
			accessToken: newAccessToken,
			expiresAt: newExpiresAt
		})
		.where(eq(googleCalendarTokens.userId, userId));

	return newAccessToken;
}

// Obter tokens do usuário
async function getUserTokens(
	db: App.Locals['db'],
	userId: string
): Promise<TokenData | null> {
	const token = await db
		.select()
		.from(googleCalendarTokens)
		.where(eq(googleCalendarTokens.userId, userId))
		.get();

	if (!token || token.isEnabled !== 1) {
		return null;
	}

	return {
		accessToken: token.accessToken,
		refreshToken: token.refreshToken,
		expiresAt: token.expiresAt
	};
}

// Criar evento no Google Calendar
export async function createCalendarEvent(
	db: App.Locals['db'],
	userId: string,
	task: {
		description: string;
		notes?: string;
		scheduledDate: string; // YYYY-MM-DD
		scheduledTime: string; // HH:MM
		duration?: number; // minutos (padrão 60)
	}
): Promise<string | null> {
	const tokenData = await getUserTokens(db, userId);
	if (!tokenData) {
		return null;
	}

	const accessToken = await refreshAccessToken(db, userId, tokenData);

	// Construir data/hora do evento
	const startDateTime = `${task.scheduledDate}T${task.scheduledTime}:00`;

	// Calcular horário de término baseado na duração
	const durationMinutes = task.duration || 60;
	const [hours, minutes] = task.scheduledTime.split(':').map(Number);
	const totalMinutes = hours * 60 + minutes + durationMinutes;
	const endHours = Math.floor(totalMinutes / 60) % 24;
	const endMinutes = totalMinutes % 60;
	const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
	const endDateTime = `${task.scheduledDate}T${endTime}:00`;

	const event: CalendarEvent = {
		summary: task.description,
		description: task.notes || undefined,
		start: {
			dateTime: startDateTime,
			timeZone: 'America/Sao_Paulo'
		},
		end: {
			dateTime: endDateTime,
			timeZone: 'America/Sao_Paulo'
		},
		reminders: {
			useDefault: false,
			overrides: [
				{ method: 'popup', minutes: 30 },
				{ method: 'popup', minutes: 10 }
			]
		}
	};

	const response = await fetch(
		'https://www.googleapis.com/calendar/v3/calendars/primary/events',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(event)
		}
	);

	if (!response.ok) {
		console.error('Failed to create calendar event:', await response.text());
		return null;
	}

	const createdEvent = await response.json();
	return createdEvent.id;
}

// Atualizar evento no Google Calendar
export async function updateCalendarEvent(
	db: App.Locals['db'],
	userId: string,
	eventId: string,
	task: {
		description: string;
		scheduledDate: string;
		scheduledTime: string;
	}
): Promise<boolean> {
	const tokenData = await getUserTokens(db, userId);
	if (!tokenData) {
		return false;
	}

	const accessToken = await refreshAccessToken(db, userId, tokenData);

	const startDateTime = `${task.scheduledDate}T${task.scheduledTime}:00`;
	const [hours, minutes] = task.scheduledTime.split(':').map(Number);
	const endHours = hours + 1;
	const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
	const endDateTime = `${task.scheduledDate}T${endTime}:00`;

	const event: CalendarEvent = {
		summary: task.description,
		start: {
			dateTime: startDateTime,
			timeZone: 'America/Sao_Paulo'
		},
		end: {
			dateTime: endDateTime,
			timeZone: 'America/Sao_Paulo'
		}
	};

	const response = await fetch(
		`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
		{
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(event)
		}
	);

	return response.ok;
}

// Deletar evento do Google Calendar
export async function deleteCalendarEvent(
	db: App.Locals['db'],
	userId: string,
	eventId: string
): Promise<boolean> {
	const tokenData = await getUserTokens(db, userId);
	if (!tokenData) {
		return false;
	}

	const accessToken = await refreshAccessToken(db, userId, tokenData);

	const response = await fetch(
		`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
		{
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		}
	);

	return response.ok || response.status === 404; // 404 = já deletado
}

// Verificar se o usuário tem Calendar conectado e habilitado
export async function hasCalendarConnected(
	db: App.Locals['db'],
	userId: string
): Promise<boolean> {
	const token = await db
		.select()
		.from(googleCalendarTokens)
		.where(eq(googleCalendarTokens.userId, userId))
		.get();

	return !!token && token.isEnabled === 1;
}

// Desconectar Google Calendar (soft delete - mantém registro mas desabilita)
export async function disconnectCalendar(
	db: App.Locals['db'],
	userId: string
): Promise<void> {
	await db
		.update(googleCalendarTokens)
		.set({ isEnabled: 0 })
		.where(eq(googleCalendarTokens.userId, userId));
}
