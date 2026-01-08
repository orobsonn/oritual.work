import { redirect } from '@sveltejs/kit';
import {
	users,
	couples,
	partnerInvites,
	coupleGoals,
	coupleHabits,
	coupleHabitCompletions
} from '$lib/server/db/schema';
import { eq, and, isNull, or, desc } from 'drizzle-orm';
import { generateId } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

function getTodayDate(): string {
	return new Date().toISOString().split('T')[0];
}

function generateInviteCode(): string {
	return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	// Verificar se é premium
	const user = await locals.db.select().from(users).where(eq(users.id, userId)).get();

	// Verificar se já tem parceiro
	const couple = await locals.db
		.select()
		.from(couples)
		.where(
			and(or(eq(couples.userId1, userId), eq(couples.userId2, userId)), isNull(couples.deletedAt))
		)
		.get();

	const isPremium = user?.isPremium === 1;

	let partner = null;
	let goals: typeof coupleGoals.$inferSelect[] = [];
	let habits: (typeof coupleHabits.$inferSelect & { completedToday: boolean })[] = [];

	if (couple) {
		// Buscar dados do parceiro
		const partnerId = couple.userId1 === userId ? couple.userId2 : couple.userId1;
		partner = await locals.db.select().from(users).where(eq(users.id, partnerId)).get();

		// Buscar metas do casal
		goals = await locals.db
			.select()
			.from(coupleGoals)
			.where(and(eq(coupleGoals.coupleId, couple.id), isNull(coupleGoals.deletedAt)));

		// Buscar hábitos do casal
		const coupleHabitsList = await locals.db
			.select()
			.from(coupleHabits)
			.where(and(eq(coupleHabits.coupleId, couple.id), isNull(coupleHabits.deletedAt)));

		// Verificar completude de hoje
		const today = getTodayDate();
		habits = await Promise.all(
			coupleHabitsList.map(async (habit) => {
				const completion = await locals.db
					.select()
					.from(coupleHabitCompletions)
					.where(
						and(eq(coupleHabitCompletions.habitId, habit.id), eq(coupleHabitCompletions.date, today))
					)
					.get();

				return {
					...habit,
					completedToday: completion?.completed === 1
				};
			})
		);
	}

	// Verificar convites pendentes enviados
	const pendingInvite = await locals.db
		.select()
		.from(partnerInvites)
		.where(and(eq(partnerInvites.fromUserId, userId), eq(partnerInvites.used, 0)))
		.get();

	return {
		isPremium,
		hasCouple: !!couple,
		partner: partner ? { name: partner.name, email: partner.email } : null,
		goals,
		habits,
		pendingInvite: pendingInvite ? { code: pendingInvite.code } : null
	};
};

export const actions: Actions = {
	// Gerar convite
	generateInvite: async ({ locals }) => {
		const userId = locals.user!.id;

		// Verificar se já tem convite ativo
		const existing = await locals.db
			.select()
			.from(partnerInvites)
			.where(and(eq(partnerInvites.fromUserId, userId), eq(partnerInvites.used, 0)))
			.get();

		if (existing) {
			return { code: existing.code };
		}

		const code = generateInviteCode();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		await locals.db.insert(partnerInvites).values({
			id: generateId(),
			code,
			fromUserId: userId,
			expiresAt: expiresAt.toISOString()
		});

		return { code };
	},

	// Usar convite
	useInvite: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const formData = await request.formData();
		const code = (formData.get('code') as string).toUpperCase();

		// Buscar convite
		const invite = await locals.db
			.select()
			.from(partnerInvites)
			.where(and(eq(partnerInvites.code, code), eq(partnerInvites.used, 0)))
			.get();

		if (!invite) {
			return { error: 'Código inválido ou expirado' };
		}

		if (invite.fromUserId === userId) {
			return { error: 'Você não pode usar seu próprio código' };
		}

		// Verificar se expirou
		if (new Date(invite.expiresAt) < new Date()) {
			return { error: 'Código expirado' };
		}

		// Criar casal
		await locals.db.insert(couples).values({
			id: generateId(),
			userId1: invite.fromUserId,
			userId2: userId
		});

		// Marcar convite como usado
		await locals.db.update(partnerInvites).set({ used: 1 }).where(eq(partnerInvites.id, invite.id));

		return { success: true };
	},

	// Criar meta de casal
	createGoal: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const formData = await request.formData();

		const couple = await locals.db
			.select()
			.from(couples)
			.where(
				and(
					or(eq(couples.userId1, userId), eq(couples.userId2, userId)),
					isNull(couples.deletedAt)
				)
			)
			.get();

		if (!couple) return { error: 'Casal não encontrado' };

		const title = formData.get('title') as string;
		const targetValue = parseInt(formData.get('targetValue') as string) || 1;

		await locals.db.insert(coupleGoals).values({
			id: generateId(),
			coupleId: couple.id,
			title,
			targetValue,
			currentValue: 0
		});

		return { success: true };
	},

	// Criar hábito de casal
	createHabit: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const formData = await request.formData();

		const couple = await locals.db
			.select()
			.from(couples)
			.where(
				and(
					or(eq(couples.userId1, userId), eq(couples.userId2, userId)),
					isNull(couples.deletedAt)
				)
			)
			.get();

		if (!couple) return { error: 'Casal não encontrado' };

		const title = formData.get('title') as string;
		const frequencyType = formData.get('frequencyType') as 'weekly' | 'monthly';
		const frequencyValue = parseInt(formData.get('frequencyValue') as string) || 1;

		await locals.db.insert(coupleHabits).values({
			id: generateId(),
			coupleId: couple.id,
			title,
			frequencyType,
			frequencyValue
		});

		return { success: true };
	},

	// Toggle hábito de casal
	toggleHabit: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const formData = await request.formData();
		const habitId = formData.get('habitId') as string;
		const completed = formData.get('completed') === 'true' ? 1 : 0;
		const today = getTodayDate();

		const existing = await locals.db
			.select()
			.from(coupleHabitCompletions)
			.where(
				and(eq(coupleHabitCompletions.habitId, habitId), eq(coupleHabitCompletions.date, today))
			)
			.get();

		if (existing) {
			await locals.db
				.update(coupleHabitCompletions)
				.set({ completed, markedByUserId: userId })
				.where(eq(coupleHabitCompletions.id, existing.id));
		} else {
			await locals.db.insert(coupleHabitCompletions).values({
				id: generateId(),
				habitId,
				date: today,
				completed,
				markedByUserId: userId
			});
		}

		return { success: true };
	}
};
