<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data, form } = $props();

	let showGoalForm = $state(false);
	let showHabitForm = $state(false);
	let habitFrequencyType = $state<'weekly' | 'monthly'>('monthly');
	let selectedDays = $state<string[]>([]);
	let inviteCode = $state('');
	let editingGoal = $state<string | null>(null);

	// Loading states
	let creatingGoal = $state(false);
	let updatingGoalId = $state<string | null>(null);
	let deletingGoalId = $state<string | null>(null);
	let creatingHabit = $state(false);
	let deletingHabitId = $state<string | null>(null);
	let togglingActiveId = $state<string | null>(null);

	// Polling para sincronizar dados do casal a cada 30 segundos
	let pollingInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		if (data.hasCouple) {
			pollingInterval = setInterval(() => {
				invalidateAll();
			}, 30000);
		}
	});

	onDestroy(() => {
		if (pollingInterval) {
			clearInterval(pollingInterval);
		}
	});

	function toggleDay(day: string) {
		if (selectedDays.includes(day)) {
			selectedDays = selectedDays.filter((d) => d !== day);
		} else {
			selectedDays = [...selectedDays, day];
		}
	}

	function resetHabitForm() {
		showHabitForm = false;
		habitFrequencyType = 'monthly';
		selectedDays = [];
	}

	const weekDays = [
		{ value: 'mon', label: 'Seg' },
		{ value: 'tue', label: 'Ter' },
		{ value: 'wed', label: 'Qua' },
		{ value: 'thu', label: 'Qui' },
		{ value: 'fri', label: 'Sex' },
		{ value: 'sat', label: 'Sáb' },
		{ value: 'sun', label: 'Dom' }
	];

	function formatDays(targetDays: string | null): string {
		if (!targetDays) return '';
		const days = JSON.parse(targetDays) as string[];
		return days
			.map((d) => weekDays.find((w) => w.value === d)?.label)
			.filter(Boolean)
			.join(', ');
	}
</script>

<svelte:head>
	<title>Casal - Ritual</title>
</svelte:head>

<main>
	<header>
		<a href="/app" class="back">&larr;</a>
		<h1>Casal</h1>
		<div class="header-spacer"></div>
		<ThemeToggle />
	</header>

	{#if !data.hasCouple}
		<!-- Não tem parceiro ainda -->
		<section class="connect-section">
			<h2>Conecte com seu parceiro(a)</h2>

			{#if data.isPremium}
				<!-- Premium: pode gerar código -->
				{#if data.pendingInvite}
					<div class="invite-code">
						<p>Compartilhe este código com seu parceiro(a):</p>
						<strong class="code">{data.pendingInvite.code}</strong>
						<p class="hint">Válido por 7 dias</p>
					</div>
				{:else}
					<p class="description">Gere um código e envie para seu parceiro(a) se conectar.</p>
					<form method="POST" action="?/generateInvite" use:enhance>
						<button type="submit" class="generate-btn">Gerar código de convite</button>
					</form>
				{/if}
			{:else}
				<!-- Não premium: pode inserir código ou comprar -->
				<p class="description">
					Seu parceiro(a) Premium enviou um código? Insira abaixo para conectar.
				</p>

				<form
					method="POST"
					action="?/useInvite"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
						};
					}}
				>
					<div class="use-invite">
						<input
							type="text"
							name="code"
							placeholder="CÓDIGO"
							bind:value={inviteCode}
							maxlength="6"
							style="text-transform: uppercase"
						/>
						<button type="submit" disabled={inviteCode.length < 4}>Conectar</button>
					</div>
					{#if form?.error}
						<p class="error">{form.error}</p>
					{/if}
				</form>

				<div class="divider">ou</div>

				<div class="upgrade-cta">
					<p>Quer gerar códigos e convidar seu parceiro(a)?</p>
					<a href="/app/upgrade" class="upgrade-btn">Seja Premium</a>
				</div>
			{/if}
		</section>
	{:else}
		<!-- Tem parceiro -->
		<section class="partner-section">
			<div class="partner-info">
				<span class="partner-label">Parceiro(a):</span>
				<strong>{data.partner?.name ?? data.partner?.email}</strong>
			</div>
		</section>

		<!-- Metas do Casal -->
		<section class="section">
			<div class="section-header">
				<h2>Metas do Casal</h2>
				<button class="add-btn" onclick={() => (showGoalForm = !showGoalForm)}>
					{showGoalForm ? '×' : '+'}
				</button>
			</div>

			{#if showGoalForm}
				<form
					class="inline-form"
					method="POST"
					action="?/createGoal"
					use:enhance={() => {
						creatingGoal = true;
						return async ({ update }) => {
							await update();
							creatingGoal = false;
							showGoalForm = false;
						};
					}}
				>
					<input type="text" name="title" placeholder="Ex: Viajar para 5 lugares" required disabled={creatingGoal} />
					<input type="number" name="targetValue" value="5" min="1" disabled={creatingGoal} />
					<button type="submit" disabled={creatingGoal}>
						{creatingGoal ? 'Criando...' : 'Criar'}
					</button>
				</form>
			{/if}

			{#if data.goals.length === 0}
				<p class="empty">Nenhuma meta ainda.</p>
			{:else}
				<div class="goals-cards">
					{#each data.goals as goal (goal.id)}
						{@const current = goal.currentValue ?? 0}
						{@const target = goal.targetValue}
						{@const percent = Math.min(100, Math.round((current / target) * 100))}

						<div class="goal-card" class:loading={deletingGoalId === goal.id}>
							<div class="goal-header">
								<strong>{goal.title}</strong>
								<form method="POST" action="?/deleteGoal" use:enhance={() => {
									deletingGoalId = goal.id;
									return async ({ update }) => {
										await update();
										deletingGoalId = null;
									};
								}}>
									<input type="hidden" name="goalId" value={goal.id} />
									<button type="submit" class="delete-btn" title="Excluir" disabled={deletingGoalId === goal.id}>
										{deletingGoalId === goal.id ? '...' : '×'}
									</button>
								</form>
							</div>

							<div class="progress-container">
								<div class="progress-bar">
									<div class="progress-fill" style="width: {percent}%"></div>
								</div>
								<span class="progress-text">{current}/{target} ({percent}%)</span>
							</div>

							{#if editingGoal === goal.id}
								<form
									class="update-form"
									method="POST"
									action="?/updateGoalProgress"
									use:enhance={() => {
										updatingGoalId = goal.id;
										return async ({ update }) => {
											await update();
											updatingGoalId = null;
											editingGoal = null;
										};
									}}
								>
									<input type="hidden" name="goalId" value={goal.id} />
									<div class="update-row">
										<input
											type="number"
											name="newValue"
											value={current}
											min="0"
											max={target}
											class="value-input"
											disabled={updatingGoalId === goal.id}
										/>
										<button type="submit" class="update-btn" disabled={updatingGoalId === goal.id}>
											{updatingGoalId === goal.id ? 'Salvando...' : 'Salvar'}
										</button>
										<button type="button" class="cancel-btn" onclick={() => (editingGoal = null)} disabled={updatingGoalId === goal.id}>
											Cancelar
										</button>
									</div>
								</form>
							{:else}
								<button class="edit-progress-btn" onclick={() => (editingGoal = goal.id)}>
									Atualizar progresso
								</button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Hábitos do Casal -->
		<section class="section">
			<div class="section-header">
				<h2>Hábitos do Casal</h2>
				<button class="add-btn" onclick={() => (showHabitForm = !showHabitForm)}>
					{showHabitForm ? '×' : '+'}
				</button>
			</div>

			{#if showHabitForm}
				<form
					class="habit-form"
					method="POST"
					action="?/createHabit"
					use:enhance={() => {
						creatingHabit = true;
						return async ({ update }) => {
							await update();
							creatingHabit = false;
							resetHabitForm();
						};
					}}
				>
					<input type="text" name="title" placeholder="Ex: Jantar romântico" required disabled={creatingHabit} />

					<div class="form-row">
						<select name="frequencyType" bind:value={habitFrequencyType} disabled={creatingHabit}>
							<option value="monthly">Mensal</option>
							<option value="weekly">Semanal</option>
						</select>

						{#if habitFrequencyType === 'monthly'}
							<input type="number" name="frequencyValue" value="1" min="1" disabled={creatingHabit} />
							<span class="freq-label">x/mês</span>
						{/if}
					</div>

					{#if habitFrequencyType === 'weekly'}
						<div class="days-selection">
							<p class="days-label">Em quais dias?</p>
							<div class="days-grid">
								{#each weekDays as day}
									<button
										type="button"
										class="day-chip"
										class:selected={selectedDays.includes(day.value)}
										onclick={() => toggleDay(day.value)}
										disabled={creatingHabit}
									>
										{day.label}
									</button>
								{/each}
							</div>
							<input type="hidden" name="targetDays" value={JSON.stringify(selectedDays)} />
							<input type="hidden" name="frequencyValue" value="0" />
						</div>
					{/if}

					<button type="submit" class="submit-btn" disabled={creatingHabit}>
						{creatingHabit ? 'Criando...' : 'Criar'}
					</button>
				</form>
			{/if}

			{#if data.habits.length === 0}
				<p class="empty">Nenhum hábito ainda.</p>
			{:else}
				<ul class="habits-list">
					{#each data.habits as habit (habit.id)}
						<li class:inactive={habit.active === 0}>
							<div class="habit-info">
								<strong>{habit.title}</strong>
								<span class="habit-meta">
									{#if habit.frequencyType === 'weekly' && habit.targetDays}
										{formatDays(habit.targetDays)}
									{:else}
										{habit.frequencyValue}x/mês
									{/if}
								</span>
							</div>
							<div class="habit-actions">
								<form method="POST" action="?/toggleHabitActive" use:enhance={() => {
									togglingActiveId = habit.id;
									return async ({ update }) => {
										await update();
										togglingActiveId = null;
									};
								}}>
									<input type="hidden" name="habitId" value={habit.id} />
									<input type="hidden" name="active" value={habit.active === 1 ? 'false' : 'true'} />
									<button
										type="submit"
										class="toggle-btn"
										class:pause={habit.active === 1}
										class:play={habit.active === 0}
										title={habit.active === 1 ? 'Pausar' : 'Retomar'}
										disabled={togglingActiveId === habit.id}
									>
										{togglingActiveId === habit.id ? '...' : habit.active === 1 ? '⏸' : '▶'}
									</button>
								</form>
								<form method="POST" action="?/deleteHabit" use:enhance={() => {
									deletingHabitId = habit.id;
									return async ({ update }) => {
										await update();
										deletingHabitId = null;
									};
								}}>
									<input type="hidden" name="habitId" value={habit.id} />
									<button type="submit" class="delete-btn" title="Excluir" disabled={deletingHabitId === habit.id}>
										{deletingHabitId === habit.id ? '...' : '×'}
									</button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
		padding-top: 6rem;
	}

	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: color-mix(in srgb, var(--color-bg-primary) 85%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
		z-index: 100;
		max-width: 600px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.back {
		font-size: 1.5rem;
		text-decoration: none;
		color: var(--color-accent);
	}

	h1 {
		font-size: 1.25rem;
		margin: 0;
		color: var(--color-text-primary);
	}

	.header-spacer {
		flex: 1;
	}

	h2 {
		font-size: 1rem;
		margin: 0;
		color: var(--color-couple);
	}

	/* Connect Section */
	.connect-section {
		text-align: center;
		padding: 2rem;
		background: var(--color-bg-secondary);
		border-radius: 8px;
	}

	.connect-section h2 {
		margin-bottom: 1rem;
		color: var(--color-text-primary);
	}

	.description {
		color: var(--color-text-secondary);
		margin: 0 0 1.5rem 0;
		font-size: 0.9375rem;
	}

	.error {
		color: var(--color-error);
		font-size: 0.875rem;
		margin: 0.5rem 0 0 0;
	}

	.upgrade-cta {
		margin-top: 0.5rem;
	}

	.upgrade-cta p {
		color: var(--color-text-secondary);
		margin: 0 0 0.75rem 0;
		font-size: 0.9375rem;
	}

	.upgrade-btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--color-success);
		color: var(--color-bg-primary);
		text-decoration: none;
		border-radius: 4px;
		font-weight: 600;
	}

	.upgrade-btn:hover {
		filter: brightness(1.1);
	}

	.use-invite button:disabled {
		background: var(--color-border);
		color: var(--color-text-muted);
		cursor: not-allowed;
	}

	.invite-code {
		margin-bottom: 1.5rem;
	}

	.invite-code p {
		color: var(--color-text-secondary);
	}

	.code {
		display: block;
		font-size: 2rem;
		letter-spacing: 0.25em;
		margin: 0.5rem 0;
		color: var(--color-couple);
	}

	.hint {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.generate-btn {
		padding: 0.75rem 1.5rem;
		background: var(--color-couple);
		color: var(--color-bg-primary);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
	}

	.generate-btn:hover {
		filter: brightness(1.1);
	}

	.divider {
		margin: 1.5rem 0;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.use-invite {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.use-invite input {
		padding: 0.5rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 1rem;
		text-transform: uppercase;
		width: 120px;
		text-align: center;
		letter-spacing: 0.1em;
		color: var(--color-text-primary);
	}

	.use-invite input:focus {
		outline: none;
		border-color: var(--color-couple);
	}

	.use-invite button {
		padding: 0.5rem 1rem;
		background: var(--color-couple);
		color: var(--color-bg-primary);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
	}

	/* Partner Section */
	.partner-section {
		background: color-mix(in srgb, var(--color-success) 15%, var(--color-bg-secondary));
		border: 1px solid color-mix(in srgb, var(--color-success) 30%, var(--color-border));
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.partner-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.partner-label {
		color: var(--color-text-secondary);
	}

	.partner-info strong {
		color: var(--color-success);
	}

	/* Sections */
	.section {
		background: var(--color-bg-secondary);
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.add-btn {
		background: var(--color-couple);
		color: var(--color-bg-primary);
		border: none;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 600;
	}

	.inline-form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.inline-form input[type='text'] {
		flex: 1;
		min-width: 150px;
		padding: 0.5rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-primary);
	}

	.inline-form input[type='number'] {
		width: 60px;
		padding: 0.5rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-primary);
	}

	.inline-form select {
		padding: 0.5rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-primary);
	}

	.inline-form button {
		padding: 0.5rem 1rem;
		background: var(--color-couple);
		color: var(--color-bg-primary);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
	}

	/* Habit form with days selection */
	.habit-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.habit-form input[type='text'] {
		padding: 0.5rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-primary);
	}

	.form-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.form-row select {
		padding: 0.5rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-primary);
	}

	.form-row input[type='number'] {
		width: 60px;
		padding: 0.5rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-primary);
	}

	.freq-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.days-selection {
		margin-top: 0.25rem;
	}

	.days-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin: 0 0 0.5rem 0;
	}

	.days-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.day-chip {
		padding: 0.4rem 0.6rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 16px;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--color-text-secondary);
	}

	.day-chip:hover {
		border-color: var(--color-couple);
	}

	.day-chip.selected {
		background: var(--color-couple);
		color: var(--color-bg-primary);
		border-color: var(--color-couple);
	}

	.habit-form .submit-btn {
		padding: 0.5rem 1rem;
		background: var(--color-couple);
		color: var(--color-bg-primary);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
	}

	.habit-form .submit-btn:hover {
		filter: brightness(1.1);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/* Goal Cards */
	.goals-cards {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.goal-card {
		background: var(--color-bg-primary);
		padding: 1rem;
		border-radius: 8px;
	}

	.goal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.goal-header strong {
		font-size: 1rem;
		color: var(--color-text-primary);
	}

	.delete-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.delete-btn:hover {
		color: var(--color-error);
	}

	.progress-container {
		margin-bottom: 0.75rem;
	}

	.progress-bar {
		height: 8px;
		background: var(--color-bg-secondary);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.25rem;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-couple);
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.edit-progress-btn {
		width: 100%;
		padding: 0.5rem;
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		cursor: pointer;
		color: var(--color-text-secondary);
	}

	.edit-progress-btn:hover {
		background: var(--color-bg-secondary);
	}

	.update-form {
		margin-top: 0.5rem;
	}

	.update-row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.value-input {
		width: 80px;
		padding: 0.5rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-primary);
	}

	.update-btn {
		padding: 0.5rem 1rem;
		background: var(--color-couple);
		color: var(--color-bg-primary);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
	}

	.cancel-btn {
		padding: 0.5rem 1rem;
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		cursor: pointer;
		color: var(--color-text-secondary);
	}

	.habits-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: var(--color-bg-primary);
		border-radius: 8px;
		margin-bottom: 0.5rem;
	}

	.habits-list li.inactive {
		opacity: 0.5;
	}

	.habit-info {
		flex: 1;
	}

	.habit-info strong {
		display: block;
		margin-bottom: 0.25rem;
		color: var(--color-text-primary);
	}

	.habit-meta {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.habit-actions {
		display: flex;
		gap: 0.5rem;
	}

	.toggle-btn,
	.delete-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
	}

	.toggle-btn:disabled,
	.delete-btn:disabled {
		cursor: wait;
		opacity: 0.7;
	}

	.toggle-btn.pause {
		color: var(--color-warning);
	}

	.toggle-btn.pause:hover {
		color: var(--color-error);
	}

	.toggle-btn.play {
		color: var(--color-success);
	}

	.toggle-btn.play:hover {
		color: var(--color-success);
	}

	.delete-btn {
		color: var(--color-text-muted);
	}

	.delete-btn:hover {
		color: var(--color-error);
	}

	.goal-card.loading {
		opacity: 0.6;
		pointer-events: none;
	}

	.empty {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem;
	}
</style>
