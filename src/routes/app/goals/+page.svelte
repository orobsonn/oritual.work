<script lang="ts">
	import { enhance } from '$app/forms';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data } = $props();

	let showForm = $state(false);
	let editingGoal = $state<string | null>(null);
</script>

<svelte:head>
	<title>Metas - Ritual</title>
</svelte:head>

<main>
	<header>
		<a href="/app" class="back">&larr;</a>
		<h1>Metas</h1>
		<div class="header-spacer"></div>
		<ThemeToggle />
		<button class="add-btn" onclick={() => (showForm = !showForm)}>
			{showForm ? '×' : '+'}
		</button>
	</header>

	{#if showForm}
		<form
			class="create-form"
			method="POST"
			action="?/create"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					showForm = false;
				};
			}}
		>
			<div class="field">
				<label for="title">O que você quer conquistar?</label>
				<input type="text" id="title" name="title" placeholder="Ex: Ler livros, Correr km, Economizar R$..." required />
			</div>

			<div class="field">
				<label for="targetValue">Qual o objetivo?</label>
				<div class="target-input">
					<input type="number" id="targetValue" name="targetValue" value="12" min="1" required />
					<span class="target-hint">unidades</span>
				</div>
				<p class="hint">Ex: 12 livros, 100 km, 5000 reais</p>
			</div>

			<button type="submit" class="submit-btn">Criar meta</button>
		</form>
	{/if}

	<p class="description">
		Metas são objetivos maiores com valor alvo que você quer alcançar.
		Acompanhe seu progresso até conquistar cada uma delas.
	</p>

	<section class="goals-list">
		{#if data.goals.length === 0}
			<p class="empty">Nenhuma meta cadastrada ainda.</p>
		{:else}
			{#each data.goals as goal (goal.id)}
				{@const current = goal.currentValue ?? 0}
				{@const target = goal.targetValue}
				{@const percent = Math.min(100, Math.round((current / target) * 100))}

				<div class="goal-card">
					<div class="goal-header">
						<strong>{goal.title}</strong>
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="goalId" value={goal.id} />
							<button type="submit" class="delete-btn" title="Excluir">×</button>
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
							action="?/updateProgress"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
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
								/>
								<button type="submit" class="update-btn">Salvar</button>
								<button type="button" class="cancel-btn" onclick={() => (editingGoal = null)}>
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
		{/if}
	</section>
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
		flex: 1;
		font-size: 1.25rem;
		margin: 0;
		color: var(--color-text-primary);
	}

	.add-btn {
		background: var(--color-accent);
		color: var(--color-accent-text);
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		font-size: 1.25rem;
		cursor: pointer;
		font-weight: 600;
	}

	.create-form {
		background: var(--color-bg-secondary);
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.field {
		margin-bottom: 1rem;
	}

	.field label {
		display: block;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: 0.25rem;
	}

	.field input {
		width: 100%;
		padding: 0.5rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
		color: var(--color-text-primary);
	}

	.target-input {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.target-input input {
		width: 100px;
		flex: none;
	}

	.target-hint {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin: 0.25rem 0 0 0;
	}

	.submit-btn {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-accent);
		color: var(--color-accent-text);
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 600;
	}

	.submit-btn:hover {
		background: var(--color-accent-hover);
	}

	.goal-card {
		background: var(--color-bg-secondary);
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		text-align: center;
		margin: 0 0 1rem 0;
		line-height: 1.5;
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
		background: var(--color-bg-primary);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.25rem;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-accent);
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
		background: var(--color-bg-primary);
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
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-primary);
	}

	.update-btn {
		padding: 0.5rem 1rem;
		background: var(--color-accent);
		color: var(--color-accent-text);
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

	.empty {
		text-align: center;
		color: var(--color-text-muted);
		padding: 2rem;
	}
</style>
