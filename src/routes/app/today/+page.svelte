<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let newTaskDescription = $state('');
	let newTaskCategory = $state<'work' | 'personal'>('work');

	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let saving = $state(false);

	function scheduleAutoSave(event: Event) {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			// Encontrar o form pai do elemento que disparou o evento
			const target = event.target as HTMLElement;
			const form = target.closest('form') as HTMLFormElement;
			if (form) {
				saving = true;
				form.requestSubmit();
			}
		}, 1000);
	}

	// Calcular progresso das tarefas
	const workTasks = $derived(data.tasks.filter((t) => t.category === 'work'));
	const personalTasks = $derived(data.tasks.filter((t) => t.category === 'personal'));
	const completedTasks = $derived(data.tasks.filter((t) => t.completed === 1).length);
	const totalTasks = $derived(data.tasks.length);
	const progressPercent = $derived(totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
</script>

<svelte:head>
	<title>Hoje - Ontrack</title>
</svelte:head>

<main>
	<header>
		<a href="/app" class="back">&larr;</a>
		<h1>{data.today}</h1>
	</header>

	<!-- Barra de Progresso Geral -->
	{#if totalTasks > 0}
		<section class="progress-section">
			<div class="progress-bar">
				<div class="progress-fill" style="width: {progressPercent}%"></div>
			</div>
			<span class="progress-text">{progressPercent}% ({completedTasks}/{totalTasks})</span>
		</section>
	{/if}

	<!-- Seção Manhã -->
	<section class="section morning">
		<h2>Manhã</h2>

		{#if data.affirmation}
			<div class="affirmation">
				<p>"{data.affirmation}"</p>
			</div>
		{/if}

		<form id="entry-form" method="POST" action="?/saveEntry" use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
				saving = false;
			};
		}}>
			<div class="field">
				<label for="gratitude">Gratidão</label>
				<textarea
					id="gratitude"
					name="gratitude"
					placeholder="Pelo que você é grato hoje?"
					value={data.entry.gratitude ?? ''}
					oninput={scheduleAutoSave}
				></textarea>
			</div>

			<div class="field">
				<label for="intention">Intenção</label>
				<textarea
					id="intention"
					name="intention"
					placeholder="O que faria seu dia perfeito?"
					value={data.entry.intention ?? ''}
					oninput={scheduleAutoSave}
				></textarea>
			</div>
		</form>

		{#if saving}
			<p class="saving-indicator">Salvando...</p>
		{/if}
	</section>

	<!-- Seção Tarefas -->
	<section class="section tasks">
		<h2>Tarefas</h2>

		<!-- Adicionar tarefa -->
		<form method="POST" action="?/addTask" use:enhance={() => {
			return async ({ update }) => {
				await update();
				newTaskDescription = '';
			};
		}}>
			<div class="add-task">
				<input
					type="text"
					name="description"
					placeholder="Nova tarefa..."
					bind:value={newTaskDescription}
					required
				/>
				<select name="category" bind:value={newTaskCategory}>
					<option value="work">Trabalho</option>
					<option value="personal">Pessoal</option>
				</select>
				<button type="submit">+</button>
			</div>
		</form>

		<!-- Tarefas de Trabalho -->
		{#if workTasks.length > 0}
			<div class="task-group">
				<h3>Trabalho</h3>
				<ul>
					{#each workTasks as task (task.id)}
						<li class:completed={task.completed === 1}>
							<form method="POST" action="?/toggleTask" use:enhance>
								<input type="hidden" name="taskId" value={task.id} />
								<input type="hidden" name="completed" value={task.completed === 1 ? 'false' : 'true'} />
								<button type="submit" class="checkbox">
									{task.completed === 1 ? '✓' : '○'}
								</button>
							</form>
							<span>{task.description}</span>
							<form method="POST" action="?/deleteTask" use:enhance>
								<input type="hidden" name="taskId" value={task.id} />
								<button type="submit" class="delete">×</button>
							</form>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Tarefas Pessoais -->
		{#if personalTasks.length > 0}
			<div class="task-group">
				<h3>Pessoal</h3>
				<ul>
					{#each personalTasks as task (task.id)}
						<li class:completed={task.completed === 1}>
							<form method="POST" action="?/toggleTask" use:enhance>
								<input type="hidden" name="taskId" value={task.id} />
								<input type="hidden" name="completed" value={task.completed === 1 ? 'false' : 'true'} />
								<button type="submit" class="checkbox">
									{task.completed === 1 ? '✓' : '○'}
								</button>
							</form>
							<span>{task.description}</span>
							<form method="POST" action="?/deleteTask" use:enhance>
								<input type="hidden" name="taskId" value={task.id} />
								<button type="submit" class="delete">×</button>
							</form>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if data.tasks.length === 0}
			<p class="empty">Nenhuma tarefa ainda. Adicione sua primeira tarefa acima.</p>
		{/if}
	</section>

	<!-- Seção Hábitos -->
	{#if data.habits.length > 0}
		<section class="section habits">
			<h2>Hábitos de hoje</h2>
			<ul>
				{#each data.habits as habit (habit.id)}
					<li class:completed={habit.completedToday}>
						<form method="POST" action="?/toggleHabit" use:enhance>
							<input type="hidden" name="habitId" value={habit.id} />
							<input type="hidden" name="completed" value={habit.completedToday ? 'false' : 'true'} />
							<button type="submit" class="checkbox">
								{habit.completedToday ? '✓' : '○'}
							</button>
						</form>
						<span>{habit.title}</span>
						{#if habit.frequencyType === 'monthly'}
							<span class="badge">mensal</span>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Seção Noite -->
	<section class="section evening">
		<h2>Noite</h2>

		<form id="evening-form" method="POST" action="?/saveEntry" use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
				saving = false;
			};
		}}>
			<div class="field">
				<label for="greatThings">Coisas incríveis que aconteceram</label>
				<textarea
					id="greatThings"
					name="greatThings"
					placeholder="O que de bom aconteceu hoje?"
					value={data.entry.greatThings ?? ''}
					oninput={scheduleAutoSave}
				></textarea>
			</div>

			<div class="field">
				<label for="couldHaveDone">O que podia ter feito</label>
				<textarea
					id="couldHaveDone"
					name="couldHaveDone"
					placeholder="O que você poderia ter feito melhor?"
					value={data.entry.couldHaveDone ?? ''}
					oninput={scheduleAutoSave}
				></textarea>
			</div>

			<div class="field">
				<label for="tomorrowPlans">Planos para amanhã</label>
				<textarea
					id="tomorrowPlans"
					name="tomorrowPlans"
					placeholder="O que pretende fazer amanhã?"
					value={data.entry.tomorrowPlans ?? ''}
					oninput={scheduleAutoSave}
				></textarea>
			</div>
		</form>
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
		font-size: 1.25rem;
		margin: 0;
		color: #333;
	}

	h2 {
		font-size: 1rem;
		margin: 0 0 1rem 0;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	h3 {
		font-size: 0.875rem;
		margin: 0 0 0.5rem 0;
		color: #888;
	}

	.section {
		margin-bottom: 2rem;
		padding: 1rem;
		background: #fafafa;
		border-radius: 8px;
	}

	/* Progress */
	.progress-section {
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.progress-bar {
		height: 8px;
		background: #e0e0e0;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
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

	/* Fields */
	.field {
		margin-bottom: 1rem;
	}

	.field:last-child {
		margin-bottom: 0;
	}

	label {
		display: block;
		font-size: 0.875rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	textarea {
		width: 100%;
		min-height: 80px;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-family: inherit;
		font-size: 1rem;
		resize: vertical;
		box-sizing: border-box;
	}

	textarea:focus {
		outline: none;
		border-color: #333;
	}

	/* Affirmation */
	.affirmation {
		background: #fff;
		padding: 1rem;
		border-left: 3px solid #333;
		margin-bottom: 1rem;
		font-style: italic;
		color: #555;
	}

	.affirmation p {
		margin: 0;
	}

	/* Tasks */
	.add-task {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.add-task input[type="text"] {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	.add-task select {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: #fff;
	}

	.add-task button {
		padding: 0.5rem 1rem;
		background: #333;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1.25rem;
	}

	.task-group {
		margin-bottom: 1rem;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #eee;
	}

	li:last-child {
		border-bottom: none;
	}

	li.completed span {
		text-decoration: line-through;
		color: #999;
	}

	.checkbox {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0;
		width: 24px;
		color: #333;
	}

	li span {
		flex: 1;
	}

	.delete {
		background: none;
		border: none;
		font-size: 1.25rem;
		color: #ccc;
		cursor: pointer;
		padding: 0;
	}

	.delete:hover {
		color: #f00;
	}

	.badge {
		font-size: 0.75rem;
		background: #eee;
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
		color: #666;
	}

	.empty {
		color: #999;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem;
	}

	.saving-indicator {
		font-size: 0.75rem;
		color: #999;
		text-align: right;
		margin-top: 0.5rem;
	}
</style>
