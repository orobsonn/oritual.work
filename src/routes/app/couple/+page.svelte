<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let showGoalForm = $state(false);
	let showHabitForm = $state(false);
	let inviteCode = $state('');
</script>

<svelte:head>
	<title>Casal - Ontrack</title>
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

			{#if data.pendingInvite}
				<div class="invite-code">
					<p>Compartilhe este código:</p>
					<strong class="code">{data.pendingInvite.code}</strong>
					<p class="hint">Válido por 7 dias</p>
				</div>
			{:else}
				<form method="POST" action="?/generateInvite" use:enhance>
					<button type="submit" class="generate-btn">Gerar código de convite</button>
				</form>
			{/if}

			<div class="divider">ou</div>

			<form
				method="POST"
				action="?/useInvite"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							await update();
						}
					};
				}}
			>
				<div class="use-invite">
					<input
						type="text"
						name="code"
						placeholder="Código do parceiro"
						bind:value={inviteCode}
						maxlength="6"
					/>
					<button type="submit">Conectar</button>
				</div>
			</form>
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
					class="inline-form"
					method="POST"
					action="?/createHabit"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							showHabitForm = false;
						};
					}}
				>
					<input type="text" name="title" placeholder="Ex: Jantar romântico" required />
					<select name="frequencyType">
						<option value="monthly">Mensal</option>
						<option value="weekly">Semanal</option>
					</select>
					<input type="number" name="frequencyValue" value="1" min="1" />
					<button type="submit">Criar</button>
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
							<span>{habit.title}</span>
							<span class="freq">
								{habit.frequencyValue}x/{habit.frequencyType === 'weekly' ? 'sem' : 'mês'}
							</span>
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
		font-family: system-ui, -apple-system, sans-serif;
	}

	header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.back {
		font-size: 1.5rem;
		text-decoration: none;
		color: #333;
	}

	h1 {
		font-size: 1.25rem;
		margin: 0;
	}

	h2 {
		font-size: 1rem;
		margin: 0;
		color: #666;
	}

	/* Connect Section */
	.connect-section {
		text-align: center;
		padding: 2rem;
		background: #fafafa;
		border-radius: 8px;
	}

	.connect-section h2 {
		margin-bottom: 1.5rem;
		color: #333;
	}

	.invite-code {
		margin-bottom: 1.5rem;
	}

	.code {
		display: block;
		font-size: 2rem;
		letter-spacing: 0.25em;
		margin: 0.5rem 0;
		color: #333;
	}

	.hint {
		font-size: 0.875rem;
		color: #999;
	}

	.generate-btn {
		padding: 0.75rem 1.5rem;
		background: #333;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}

	.divider {
		margin: 1.5rem 0;
		color: #999;
		font-size: 0.875rem;
	}

	.use-invite {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.use-invite input {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		text-transform: uppercase;
		width: 120px;
		text-align: center;
		letter-spacing: 0.1em;
	}

	.use-invite button {
		padding: 0.5rem 1rem;
		background: #333;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	/* Partner Section */
	.partner-section {
		background: #f0fdf4;
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
		color: #666;
	}

	/* Sections */
	.section {
		background: #fafafa;
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
		background: #333;
		color: #fff;
		border: none;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		font-size: 1rem;
		cursor: pointer;
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
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.inline-form input[type='number'] {
		width: 60px;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.inline-form select {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.inline-form button {
		padding: 0.5rem 1rem;
		background: #333;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.goals-list li {
		padding: 0.75rem 0;
		border-bottom: 1px solid #eee;
	}

	.goals-list li:last-child {
		border-bottom: none;
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
		background: #e0e0e0;
		border-radius: 2px;
		overflow: hidden;
	}

	.mini-fill {
		height: 100%;
		background: #333;
	}

	.mini-progress span {
		font-size: 0.75rem;
		color: #999;
	}

	.habits-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #eee;
	}

	.habits-list li:last-child {
		border-bottom: none;
	}

	.habits-list li.completed span {
		text-decoration: line-through;
		color: #999;
	}

	.checkbox {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0;
	}

	.habits-list li span {
		flex: 1;
	}

	.freq {
		font-size: 0.75rem;
		color: #999;
		flex: none !important;
	}

	.empty {
		color: #999;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem;
	}
</style>
