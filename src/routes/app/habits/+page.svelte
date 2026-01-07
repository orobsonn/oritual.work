<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let showForm = $state(false);
	let frequencyType = $state<'weekly' | 'monthly'>('weekly');

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
	<title>Hábitos - Ontrack</title>
</svelte:head>

<main>
	<header>
		<a href="/app" class="back">&larr;</a>
		<h1>Hábitos</h1>
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
				<label for="title">Nome do hábito</label>
				<input type="text" id="title" name="title" placeholder="Ex: Meditar" required />
			</div>

			<div class="field">
				<label for="frequencyType">Frequência</label>
				<select id="frequencyType" name="frequencyType" bind:value={frequencyType}>
					<option value="weekly">Semanal</option>
					<option value="monthly">Mensal</option>
				</select>
			</div>

			{#if frequencyType === 'weekly'}
				<div class="field">
					<label>Dias da semana</label>
					<div class="days-grid">
						{#each weekDays as day}
							<label class="day-checkbox">
								<input type="checkbox" name="targetDays" value={day.value} />
								<span>{day.label}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="field">
					<label for="frequencyValue">Vezes por semana</label>
					<input type="number" id="frequencyValue" name="frequencyValue" value="3" min="1" max="7" />
				</div>
			{:else}
				<div class="field">
					<label for="frequencyValue">Vezes por mês</label>
					<input type="number" id="frequencyValue" name="frequencyValue" value="1" min="1" max="31" />
				</div>
			{/if}

			<button type="submit" class="submit-btn">Criar hábito</button>
		</form>
	{/if}

	<section class="habits-list">
		{#if data.habits.length === 0}
			<p class="empty">Nenhum hábito cadastrado ainda.</p>
		{:else}
			<ul>
				{#each data.habits as habit (habit.id)}
					<li class:inactive={habit.active === 0}>
						<div class="habit-info">
							<strong>{habit.title}</strong>
							<span class="meta">
								{#if habit.frequencyType === 'weekly'}
									{formatDays(habit.targetDays)} ({habit.frequencyValue}x/semana)
								{:else}
									{habit.frequencyValue}x/mês
								{/if}
							</span>
						</div>
						<div class="habit-actions">
							<form method="POST" action="?/toggle" use:enhance>
								<input type="hidden" name="habitId" value={habit.id} />
								<input type="hidden" name="active" value={habit.active === 1 ? 'false' : 'true'} />
								<button type="submit" class="toggle-btn" title={habit.active === 1 ? 'Pausar' : 'Ativar'}>
									{habit.active === 1 ? '⏸' : '▶'}
								</button>
							</form>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="habitId" value={habit.id} />
								<button type="submit" class="delete-btn" title="Excluir">×</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
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

	.field input[type='text'],
	.field input[type='number'],
	.field select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	.days-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.day-checkbox {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.day-checkbox input {
		width: auto;
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

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: #fafafa;
		border-radius: 8px;
		margin-bottom: 0.5rem;
	}

	li.inactive {
		opacity: 0.5;
	}

	.habit-info strong {
		display: block;
		margin-bottom: 0.25rem;
	}

	.meta {
		font-size: 0.875rem;
		color: #666;
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

	.delete-btn {
		color: #ccc;
	}

	.delete-btn:hover {
		color: #f00;
	}

	.empty {
		text-align: center;
		color: #999;
		padding: 2rem;
	}
</style>
