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
	<title>Hábitos - Rumo</title>
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
					<label>Em quais dias você quer praticar?</label>
					<div class="days-grid">
						{#each weekDays as day}
							<label class="day-chip">
								<input type="checkbox" name="targetDays" value={day.value} />
								<span>{day.label}</span>
							</label>
						{/each}
					</div>
					<p class="hint">Selecione os dias específicos da semana</p>
				</div>
			{:else}
				<div class="field">
					<label for="frequencyValue">Quantas vezes por mês?</label>
					<input type="number" id="frequencyValue" name="frequencyValue" value="1" min="1" max="31" />
					<p class="hint">Ex: 1x/mês para "jantar fora", 4x/mês para "ligar para os pais"</p>
				</div>
			{/if}

			<!-- Campo oculto para frequencyValue quando weekly -->
			{#if frequencyType === 'weekly'}
				<input type="hidden" name="frequencyValue" value="0" />
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
									{formatDays(habit.targetDays)}
								{:else}
									{habit.frequencyValue}x/mês
								{/if}
							</span>
						</div>
						<div class="habit-actions">
							<form method="POST" action="?/toggle" use:enhance>
								<input type="hidden" name="habitId" value={habit.id} />
								<input type="hidden" name="active" value={habit.active === 1 ? 'false' : 'true'} />
								<button type="submit" class="toggle-btn" class:pause={habit.active === 1} class:play={habit.active === 0} title={habit.active === 1 ? 'Pausar' : 'Ativar'}>
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
		flex: 1;
		font-size: 1.25rem;
		margin: 0;
		color: #e0e0e0;
	}

	.add-btn {
		background: #88c0d0;
		color: #0d1b2a;
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		font-size: 1.25rem;
		cursor: pointer;
		font-weight: 600;
	}

	.create-form {
		background: #1b2838;
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
		color: #8899a6;
		margin-bottom: 0.25rem;
	}

	.field input[type='text'],
	.field input[type='number'],
	.field select {
		width: 100%;
		padding: 0.5rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
		color: #e0e0e0;
	}

	.days-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.day-chip {
		cursor: pointer;
	}

	.day-chip input {
		display: none;
	}

	.day-chip span {
		display: block;
		padding: 0.5rem 0.75rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 20px;
		font-size: 0.875rem;
		transition: all 0.2s;
		color: #8899a6;
	}

	.day-chip input:checked + span {
		background: #88c0d0;
		color: #0d1b2a;
		border-color: #88c0d0;
	}

	.hint {
		font-size: 0.75rem;
		color: #5a6a7a;
		margin: 0.25rem 0 0 0;
	}

	.submit-btn {
		width: 100%;
		padding: 0.75rem;
		background: #88c0d0;
		color: #0d1b2a;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 600;
	}

	.submit-btn:hover {
		background: #9dd0e0;
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
		background: #1b2838;
		border-radius: 8px;
		margin-bottom: 0.5rem;
	}

	li.inactive {
		opacity: 0.5;
	}

	.habit-info strong {
		display: block;
		margin-bottom: 0.25rem;
		color: #e0e0e0;
	}

	.meta {
		font-size: 0.875rem;
		color: #8899a6;
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

	.toggle-btn.pause {
		color: #e8a87c;
	}

	.toggle-btn.pause:hover {
		color: #e06c75;
	}

	.toggle-btn.play {
		color: #6ab074;
	}

	.toggle-btn.play:hover {
		color: #98c379;
	}

	.delete-btn {
		color: #5a6a7a;
	}

	.delete-btn:hover {
		color: #e06c75;
	}

	.empty {
		text-align: center;
		color: #5a6a7a;
		padding: 2rem;
	}
</style>
