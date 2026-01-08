import {
	users,
	couples,
	partnerInvites,
	coupleGoals,
	coupleGoalProgressLog,
	coupleHabits,
	coupleHabitCompletions
} from '$lib/server/db/schema';
import { eq, and, isNull, or } from 'drizzle-orm';
import { generateId, requireAuth } from '$lib/server/auth';
import { getTodayDateBrazil } from '$lib/server/date-utils';
import type { PageServerLoad, Actions } from './$types';

function generateInviteCode(): string {
	return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = requireAuth(locals);

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
		const today = getTodayDateBrazil();
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
		const userId = requireAuth(locals);

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
		const userId = requireAuth(locals);
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
		const userId = requireAuth(locals);
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
		const userId = requireAuth(locals);
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
		const targetDays = formData.get('targetDays') as string | null;

		await locals.db.insert(coupleHabits).values({
			id: generateId(),
			coupleId: couple.id,
			title,
			frequencyType,
			frequencyValue,
			targetDays
		});

		return { success: true };
	},

	// Toggle hábito de casal
	toggleHabit: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();
		const habitId = formData.get('habitId') as string;
		const completed = formData.get('completed') === 'true' ? 1 : 0;
		const today = getTodayDateBrazil();

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
	},

	// Atualizar progresso de meta de casal
	updateGoalProgress: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();

		const goalId = formData.get('goalId') as string;
		const newValue = parseInt(formData.get('newValue') as string);
		const note = formData.get('note') as string | null;

		// Verificar se usuário faz parte do casal
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

		// Buscar meta e verificar que pertence ao casal
		const goal = await locals.db
			.select()
			.from(coupleGoals)
			.where(
				and(
					eq(coupleGoals.id, goalId),
					eq(coupleGoals.coupleId, couple.id),
					isNull(coupleGoals.deletedAt)
				)
			)
			.get();

		if (!goal) return { error: 'Meta não encontrada' };

		const previousValue = goal.currentValue ?? 0;

		// Atualizar meta
		await locals.db
			.update(coupleGoals)
			.set({ currentValue: newValue })
			.where(eq(coupleGoals.id, goalId));

		// Registrar log
		await locals.db.insert(coupleGoalProgressLog).values({
			id: generateId(),
			goalId,
			userId,
			previousValue,
			newValue,
			note,
			date: getTodayDateBrazil()
		});

		return { success: true };
	},

	// Excluir meta de casal
	deleteGoal: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();
		const goalId = formData.get('goalId') as string;

		// Verificar se usuário faz parte do casal
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

		// Verificar se a meta pertence ao casal
		const goal = await locals.db
			.select()
			.from(coupleGoals)
			.where(and(eq(coupleGoals.id, goalId), eq(coupleGoals.coupleId, couple.id)))
			.get();

		if (!goal) return { error: 'Meta não encontrada' };

		// Soft delete
		await locals.db
			.update(coupleGoals)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(coupleGoals.id, goalId));

		return { success: true };
	},

	// Toggle ativo/pausado de hábito de casal
	toggleHabitActive: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();
		const habitId = formData.get('habitId') as string;
		const active = formData.get('active') === 'true' ? 1 : 0;

		// Verificar se usuário faz parte do casal
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

		// Verificar se o hábito pertence ao casal
		const habit = await locals.db
			.select()
			.from(coupleHabits)
			.where(and(eq(coupleHabits.id, habitId), eq(coupleHabits.coupleId, couple.id)))
			.get();

		if (!habit) return { error: 'Hábito não encontrado' };

		await locals.db
			.update(coupleHabits)
			.set({ active })
			.where(eq(coupleHabits.id, habitId));

		return { success: true };
	},

	// Excluir hábito de casal
	deleteHabit: async ({ request, locals }) => {
		const userId = requireAuth(locals);
		const formData = await request.formData();
		const habitId = formData.get('habitId') as string;

		// Verificar se usuário faz parte do casal
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

		// Verificar se o hábito pertence ao casal
		const habit = await locals.db
			.select()
			.from(coupleHabits)
			.where(and(eq(coupleHabits.id, habitId), eq(coupleHabits.coupleId, couple.id)))
			.get();

		if (!habit) return { error: 'Hábito não encontrado' };

		// Soft delete
		await locals.db
			.update(coupleHabits)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(coupleHabits.id, habitId));

		return { success: true };
	}
};
