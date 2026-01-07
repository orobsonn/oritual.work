<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let showForm = $state(false);
	let editingGoal = $state<string | null>(null);
</script>

<svelte:head>
	<title>Metas - Ontrack</title>
</svelte:head>

<main>
	<header>
		<a href="/app" class="back">&larr;</a>
		<h1>Metas</h1>
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
				<label for="title">Nome da meta</label>
				<input type="text" id="title" name="title" placeholder="Ex: Ler 12 livros" required />
			</div>

			<div class="field">
				<label for="targetValue">Objetivo</label>
				<input type="number" id="targetValue" name="targetValue" value="12" min="1" required />
			</div>

			<button type="submit" class="submit-btn">Criar meta</button>
		</form>
	{/if}

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
								<input type="text" name="note" placeholder="Nota (opcional)" class="note-input" />
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
		flex: 1;
		font-size: 1.25rem;
		margin: 0;
	}

	.add-btn {
		background: #333;
		color: #fff;
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		font-size: 1.25rem;
		cursor: pointer;
	}

	.create-form {
		background: #fafafa;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.field {
		margin-bottom: 1rem;
	}

	.field label {
		display: block;
		font-size: 0.875rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	.field input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	.submit-btn {
		width: 100%;
		padding: 0.75rem;
		background: #333;
		color: #fff;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
	}

	.goal-card {
		background: #fafafa;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.goal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.goal-header strong {
		font-size: 1rem;
	}

	.delete-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		color: #ccc;
		cursor: pointer;
	}

	.delete-btn:hover {
		color: #f00;
	}

	.progress-container {
		margin-bottom: 0.75rem;
	}

	.progress-bar {
		height: 8px;
		background: #e0e0e0;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.25rem;
	}

	.progress-fill {
		height: 100%;
		background: #333;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.875rem;
		color: #666;
	}

	.edit-progress-btn {
		width: 100%;
		padding: 0.5rem;
		background: none;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		color: #666;
	}

	.edit-progress-btn:hover {
		background: #fff;
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
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.note-input {
		flex: 1;
		min-width: 100px;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.update-btn {
		padding: 0.5rem 1rem;
		background: #333;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.cancel-btn {
		padding: 0.5rem 1rem;
		background: none;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
	}

	.empty {
		text-align: center;
		color: #999;
		padding: 2rem;
	}
</style>
