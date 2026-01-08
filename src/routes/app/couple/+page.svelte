<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showGoalForm = $state(false);
	let showHabitForm = $state(false);
	let habitFrequencyType = $state<'weekly' | 'monthly'>('monthly');
	let selectedDays = $state<string[]>([]);
	let inviteCode = $state('');

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
						return async ({ update }) => {
							await update();
							showGoalForm = false;
						};
					}}
				>
					<input type="text" name="title" placeholder="Ex: Viajar para 5 lugares" required />
					<input type="number" name="targetValue" value="5" min="1" />
					<button type="submit">Criar</button>
				</form>
			{/if}

			{#if data.goals.length === 0}
				<p class="empty">Nenhuma meta ainda.</p>
			{:else}
				<ul class="goals-list">
					{#each data.goals as goal}
						{@const percent = Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100)}
						<li>
							<strong>{goal.title}</strong>
							<div class="mini-progress">
								<div class="mini-bar">
									<div class="mini-fill" style="width: {percent}%"></div>
								</div>
								<span>{goal.currentValue ?? 0}/{goal.targetValue}</span>
							</div>
						</li>
					{/each}
				</ul>
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
						return async ({ update }) => {
							await update();
							resetHabitForm();
						};
					}}
				>
					<input type="text" name="title" placeholder="Ex: Jantar romântico" required />

					<div class="form-row">
						<select name="frequencyType" bind:value={habitFrequencyType}>
							<option value="monthly">Mensal</option>
							<option value="weekly">Semanal</option>
						</select>

						{#if habitFrequencyType === 'monthly'}
							<input type="number" name="frequencyValue" value="1" min="1" />
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
									>
										{day.label}
									</button>
								{/each}
							</div>
							<input type="hidden" name="targetDays" value={JSON.stringify(selectedDays)} />
							<input type="hidden" name="frequencyValue" value="0" />
						</div>
					{/if}

					<button type="submit" class="submit-btn">Criar</button>
				</form>
			{/if}

			{#if data.habits.length === 0}
				<p class="empty">Nenhum hábito ainda.</p>
			{:else}
				<ul class="habits-list">
					{#each data.habits as habit}
						<li class:completed={habit.completedToday}>
							<form method="POST" action="?/toggleHabit" use:enhance>
								<input type="hidden" name="habitId" value={habit.id} />
								<input
									type="hidden"
									name="completed"
									value={habit.completedToday ? 'false' : 'true'}
								/>
								<button type="submit" class="checkbox">
									{habit.completedToday ? '✓' : '○'}
								</button>
							</form>
							<div class="habit-info">
								<span class="habit-title">{habit.title}</span>
								<span class="habit-meta">
									{#if habit.frequencyType === 'weekly' && habit.targetDays}
										{formatDays(habit.targetDays)}
									{:else}
										{habit.frequencyValue}x/{habit.frequencyType === 'weekly' ? 'sem' : 'mês'}
									{/if}
								</span>
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
		padding-top: 4rem;
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
		background: rgba(13, 27, 42, 0.85);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(45, 74, 94, 0.5);
		z-index: 100;
		max-width: 600px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.back {
		font-size: 1.5rem;
		text-decoration: none;
		color: #88c0d0;
	}

	h1 {
		font-size: 1.25rem;
		margin: 0;
		color: #e0e0e0;
	}

	h2 {
		font-size: 1rem;
		margin: 0;
		color: #88c0d0;
	}

	/* Connect Section */
	.connect-section {
		text-align: center;
		padding: 2rem;
		background: #1b2838;
		border-radius: 8px;
	}

	.connect-section h2 {
		margin-bottom: 1rem;
		color: #e0e0e0;
	}

	.description {
		color: #8899a6;
		margin: 0 0 1.5rem 0;
		font-size: 0.9375rem;
	}

	.error {
		color: #e06c75;
		font-size: 0.875rem;
		margin: 0.5rem 0 0 0;
	}

	.upgrade-cta {
		margin-top: 0.5rem;
	}

	.upgrade-cta p {
		color: #8899a6;
		margin: 0 0 0.75rem 0;
		font-size: 0.9375rem;
	}

	.upgrade-btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #98c379;
		color: #0d1b2a;
		text-decoration: none;
		border-radius: 4px;
		font-weight: 600;
	}

	.upgrade-btn:hover {
		background: #a8d389;
	}

	.use-invite button:disabled {
		background: #2d4a5e;
		color: #5a6a7a;
		cursor: not-allowed;
	}

	.invite-code {
		margin-bottom: 1.5rem;
	}

	.invite-code p {
		color: #8899a6;
	}

	.code {
		display: block;
		font-size: 2rem;
		letter-spacing: 0.25em;
		margin: 0.5rem 0;
		color: #88c0d0;
	}

	.hint {
		font-size: 0.875rem;
		color: #5a6a7a;
	}

	.generate-btn {
		padding: 0.75rem 1.5rem;
		background: #88c0d0;
		color: #0d1b2a;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
	}

	.generate-btn:hover {
		background: #9dd0e0;
	}

	.divider {
		margin: 1.5rem 0;
		color: #5a6a7a;
		font-size: 0.875rem;
	}

	.use-invite {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.use-invite input {
		padding: 0.5rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		font-size: 1rem;
		text-transform: uppercase;
		width: 120px;
		text-align: center;
		letter-spacing: 0.1em;
		color: #e0e0e0;
	}

	.use-invite input:focus {
		outline: none;
		border-color: #88c0d0;
	}

	.use-invite button {
		padding: 0.5rem 1rem;
		background: #88c0d0;
		color: #0d1b2a;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
	}

	/* Partner Section */
	.partner-section {
		background: #1b3830;
		border: 1px solid #2d5a4e;
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
		color: #8899a6;
	}

	.partner-info strong {
		color: #98c379;
	}

	/* Sections */
	.section {
		background: #1b2838;
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
		background: #88c0d0;
		color: #0d1b2a;
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
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		color: #e0e0e0;
	}

	.inline-form input[type='number'] {
		width: 60px;
		padding: 0.5rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		color: #e0e0e0;
	}

	.inline-form select {
		padding: 0.5rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		color: #e0e0e0;
	}

	.inline-form button {
		padding: 0.5rem 1rem;
		background: #88c0d0;
		color: #0d1b2a;
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
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		color: #e0e0e0;
	}

	.form-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.form-row select {
		padding: 0.5rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		color: #e0e0e0;
	}

	.form-row input[type='number'] {
		width: 60px;
		padding: 0.5rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		color: #e0e0e0;
	}

	.freq-label {
		font-size: 0.875rem;
		color: #8899a6;
	}

	.days-selection {
		margin-top: 0.25rem;
	}

	.days-label {
		font-size: 0.875rem;
		color: #8899a6;
		margin: 0 0 0.5rem 0;
	}

	.days-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.day-chip {
		padding: 0.4rem 0.6rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 16px;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
		color: #8899a6;
	}

	.day-chip:hover {
		border-color: #88c0d0;
	}

	.day-chip.selected {
		background: #88c0d0;
		color: #0d1b2a;
		border-color: #88c0d0;
	}

	.habit-form .submit-btn {
		padding: 0.5rem 1rem;
		background: #88c0d0;
		color: #0d1b2a;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
	}

	.habit-form .submit-btn:hover {
		background: #9dd0e0;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.goals-list li {
		padding: 0.75rem 0;
		border-bottom: 1px solid #2d4a5e;
	}

	.goals-list li:last-child {
		border-bottom: none;
	}

	.goals-list li strong {
		color: #e0e0e0;
	}

	.mini-progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.mini-bar {
		flex: 1;
		height: 4px;
		background: #0d1b2a;
		border-radius: 2px;
		overflow: hidden;
	}

	.mini-fill {
		height: 100%;
		background: #88c0d0;
	}

	.mini-progress span {
		font-size: 0.75rem;
		color: #8899a6;
	}

	.habits-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #2d4a5e;
	}

	.habits-list li:last-child {
		border-bottom: none;
	}

	.habits-list li.completed .habit-title {
		text-decoration: line-through;
		color: #5a6a7a;
	}

	.checkbox {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0;
		color: #88c0d0;
	}

	.habit-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.habit-title {
		color: #e0e0e0;
	}

	.habit-meta {
		font-size: 0.75rem;
		color: #5a6a7a;
	}

	.empty {
		color: #5a6a7a;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem;
	}
</style>
