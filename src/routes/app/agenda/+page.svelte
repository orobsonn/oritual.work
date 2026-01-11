<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let newTaskDescription = $state('');
	let newTaskNotes = $state('');
	let newTaskCategory = $state<'work' | 'personal'>('personal');
	let newTaskDate = $state('');
	let newTaskTime = $state('');
	let newTaskDuration = $state(60);
	let addToCalendar = $state(false);

	let loadingTaskIds = $state<Set<string>>(new Set());
	let deletingTaskIds = $state<Set<string>>(new Set());
	let isSubmitting = $state(false);

	// Estado local para controle de tasks completadas
	let localTaskCompletions = $state<Record<string, number>>({});

	// Inicializar estados locais a partir dos dados do servidor
	$effect(() => {
		const taskMap: Record<string, number> = {};
		for (const task of data.scheduledTasks) {
			taskMap[task.id] = task.completed ?? 0;
		}
		localTaskCompletions = taskMap;
	});

	function isTaskCompleted(taskId: string): boolean {
		return (localTaskCompletions[taskId] ?? 0) === 1;
	}

	// Agrupar tasks por data
	const tasksByDate = $derived(() => {
		const grouped: Record<string, typeof data.scheduledTasks> = {};
		for (const task of data.scheduledTasks) {
			if (!grouped[task.scheduledDate]) {
				grouped[task.scheduledDate] = [];
			}
			grouped[task.scheduledDate].push(task);
		}
		return grouped;
	});

	// Formatar data para exibição
	function formatDate(dateStr: string): string {
		const [year, month, day] = dateStr.split('-').map(Number);
		const date = new Date(year, month - 1, day);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const isToday = dateStr === data.today;
		const isTomorrow = date.toDateString() === tomorrow.toDateString();

		if (isToday) return 'Hoje';
		if (isTomorrow) return 'Amanhã';

		return date.toLocaleDateString('pt-BR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	}

	// Formatar horário para exibição
	function formatTime(time: string | null): string {
		if (!time) return '';
		return time;
	}
</script>

<svelte:head>
	<title>Agenda - Ritual</title>
</svelte:head>

<header>
	<div class="header-content">
		<a href="/app" class="back">&larr;</a>
		<h1>Agenda</h1>
	</div>
</header>

<main>
	<!-- Adicionar task agendada -->
	<section class="section add-section">
		<h2>Nova task agendada</h2>
		<form method="POST" action="?/addScheduledTask" use:enhance={() => {
			isSubmitting = true;

			return async ({ result, update }) => {
				isSubmitting = false;

				if (result.type === 'success') {
					newTaskDescription = '';
					newTaskNotes = '';
					newTaskTime = '';
					newTaskDuration = 60;
					addToCalendar = false;
					await update();
				}
			};
		}}>
			<div class="form-row">
				<input
					type="text"
					name="description"
					placeholder="Título da tarefa..."
					bind:value={newTaskDescription}
					required
				/>
			</div>

			<div class="form-row">
				<textarea
					name="notes"
					placeholder="Notas ou detalhes (opcional)"
					bind:value={newTaskNotes}
					rows="2"
				></textarea>
			</div>

			<div class="form-row two-cols">
				<div class="form-field">
					<label for="scheduledDate">Data</label>
					<input
						type="date"
						id="scheduledDate"
						name="scheduledDate"
						bind:value={newTaskDate}
						min={data.today}
						required
					/>
				</div>
				<div class="form-field">
					<label for="scheduledTime">Horário</label>
					<input
						type="time"
						id="scheduledTime"
						name="scheduledTime"
						bind:value={newTaskTime}
					/>
				</div>
			</div>

			{#if newTaskTime}
				<div class="form-row">
					<div class="form-field">
						<label for="duration">Duração</label>
						<select id="duration" name="duration" bind:value={newTaskDuration}>
							<option value={15}>15 min</option>
							<option value={30}>30 min</option>
							<option value={45}>45 min</option>
							<option value={60}>1 hora</option>
							<option value={90}>1h 30min</option>
							<option value={120}>2 horas</option>
							<option value={180}>3 horas</option>
						</select>
					</div>
				</div>
			{/if}

			<div class="form-row">
				<input type="hidden" name="category" value={newTaskCategory} />
				<div class="category-toggle">
					<button
						type="button"
						class="toggle-btn"
						class:active={newTaskCategory === 'work'}
						onclick={() => newTaskCategory = 'work'}
					>
						💼 Trabalho
					</button>
					<button
						type="button"
						class="toggle-btn"
						class:active={newTaskCategory === 'personal'}
						onclick={() => newTaskCategory = 'personal'}
					>
						🏠 Pessoal
					</button>
				</div>
			</div>

			{#if data.hasCalendarConnected && newTaskTime}
				<div class="form-row">
					<button
						type="button"
						class="calendar-btn"
						class:active={addToCalendar}
						onclick={() => addToCalendar = !addToCalendar}
					>
						<span class="calendar-icon">📅</span>
						<span class="calendar-text">
							{addToCalendar ? 'Sincronizar com Google Calendar' : 'Adicionar ao Google Calendar'}
						</span>
						{#if addToCalendar}
							<span class="calendar-check">✓</span>
						{/if}
					</button>
					<input type="hidden" name="addToCalendar" value={addToCalendar ? 'true' : 'false'} />
				</div>
			{/if}

			<button type="submit" class="submit-btn" disabled={isSubmitting}>
			{isSubmitting ? 'Agendando...' : 'Agendar'}
		</button>
		</form>
	</section>

	<!-- Lista de tasks agendadas -->
	<section class="section tasks-section">
		<h2>Próximas tarefas</h2>

		{#if data.scheduledTasks.length === 0}
			<p class="empty">Nenhuma tarefa agendada. Crie sua primeira tarefa acima.</p>
		{:else}
			{#each Object.entries(tasksByDate()) as [date, tasks]}
				<div class="date-group">
					<h3 class="date-header">{formatDate(date)}</h3>
					<ul>
						{#each tasks as task (task.id)}
							{@const completed = isTaskCompleted(task.id)}
							{@const isLoading = loadingTaskIds.has(task.id)}
							<li class:completed={completed} class:deleting={deletingTaskIds.has(task.id)}>
								<form method="POST" action="?/toggleScheduledTask" use:enhance={() => {
									const newCompleted = !completed;
									loadingTaskIds = new Set([...loadingTaskIds, task.id]);
									return async ({ result }) => {
										loadingTaskIds = new Set([...loadingTaskIds].filter(id => id !== task.id));
										if (result.type === 'success') {
											localTaskCompletions = { ...localTaskCompletions, [task.id]: newCompleted ? 1 : 0 };
										}
									};
								}}>
									<input type="hidden" name="taskId" value={task.id} />
									<input type="hidden" name="completed" value={completed ? 'false' : 'true'} />
									<button type="submit" class="checkbox" disabled={isLoading || deletingTaskIds.has(task.id)}>
										{#if isLoading}
											<span class="spinner"></span>
										{:else}
											{completed ? '✓' : '○'}
										{/if}
									</button>
								</form>
								<div class="task-content">
									<span class="task-description">{task.description}</span>
									{#if task.notes}
										<span class="task-notes">{task.notes}</span>
									{/if}
									<div class="task-meta">
										{#if task.scheduledTime}
											<span class="time">{formatTime(task.scheduledTime)}</span>
											{#if task.duration && task.duration !== 60}
												<span class="duration">({task.duration}min)</span>
											{/if}
										{/if}
										<span class="category" class:work={task.category === 'work'}>
											{task.category === 'work' ? '💼' : '🏠'}
										</span>
										{#if task.googleCalendarEventId}
											<span class="calendar-badge">📅</span>
										{/if}
									</div>
								</div>
								<form method="POST" action="?/deleteScheduledTask" use:enhance={() => {
									deletingTaskIds = new Set([...deletingTaskIds, task.id]);
									return async ({ update }) => {
										await update();
										deletingTaskIds = new Set([...deletingTaskIds].filter(id => id !== task.id));
									};
								}}>
									<input type="hidden" name="taskId" value={task.id} />
									<button type="submit" class="delete" disabled={deletingTaskIds.has(task.id)}>
										{deletingTaskIds.has(task.id) ? '...' : '×'}
									</button>
								</form>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		{/if}
	</section>

	{#if !data.hasCalendarConnected}
		<section class="section calendar-cta">
			<p>Conecte seu Google Calendar nas <a href="/app/settings">configurações</a> para sincronizar suas tarefas e receber notificações.</p>
		</section>
	{/if}
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
		padding-top: 5rem;
	}

	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: rgba(13, 27, 42, 0.85);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(45, 74, 94, 0.5);
		z-index: 100;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
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

	h2 {
		font-size: 1rem;
		margin: 0 0 1rem 0;
		color: #88c0d0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.section {
		margin-bottom: 1rem;
		padding: 1rem;
		background: #1b2838;
		border-radius: 8px;
	}

	/* Form styles */
	.form-row {
		margin-bottom: 1rem;
	}

	.form-row:last-of-type {
		margin-bottom: 1rem;
	}

	.form-row.two-cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	@media (max-width: 480px) {
		.form-row.two-cols {
			grid-template-columns: 1fr;
		}
	}

	.form-field label {
		display: block;
		font-size: 0.875rem;
		color: #8899a6;
		margin-bottom: 0.25rem;
	}

	input[type="text"],
	input[type="date"],
	input[type="time"],
	textarea,
	select {
		width: 100%;
		padding: 0.75rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 6px;
		font-size: 1rem;
		color: #e0e0e0;
		box-sizing: border-box;
		font-family: inherit;
	}

	textarea {
		resize: vertical;
		min-height: 60px;
	}

	select {
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238899a6' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		padding-right: 2.5rem;
	}

	input[type="text"]:focus,
	input[type="date"]:focus,
	input[type="time"]:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: #88c0d0;
	}

	/* Ícone do calendário e relógio em tema escuro */
	input[type="date"]::-webkit-calendar-picker-indicator,
	input[type="time"]::-webkit-calendar-picker-indicator {
		filter: invert(1);
		cursor: pointer;
	}

	.category-toggle {
		display: flex;
		gap: 0.5rem;
	}

	.toggle-btn {
		flex: 1;
		padding: 0.75rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 6px;
		color: #8899a6;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.toggle-btn:hover {
		background: rgba(136, 192, 208, 0.1);
	}

	.toggle-btn.active {
		background: rgba(136, 192, 208, 0.15);
		border-color: #88c0d0;
		color: #e0e0e0;
	}

	.calendar-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.875rem 1rem;
		background: #0d1b2a;
		border: 1px dashed #2d4a5e;
		border-radius: 6px;
		color: #8899a6;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.calendar-btn:hover {
		border-color: #88c0d0;
		background: rgba(136, 192, 208, 0.05);
	}

	.calendar-btn.active {
		border-style: solid;
		border-color: #88c0d0;
		background: rgba(136, 192, 208, 0.1);
		color: #e0e0e0;
	}

	.calendar-icon {
		font-size: 1.1rem;
	}

	.calendar-text {
		flex: 1;
		text-align: left;
	}

	.calendar-check {
		color: #88c0d0;
		font-weight: bold;
	}

	.submit-btn {
		width: 100%;
		padding: 0.875rem;
		background: #88c0d0;
		color: #0d1b2a;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
	}

	.submit-btn:hover:not(:disabled) {
		background: #9dd0e0;
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	/* Task list styles */
	.date-group {
		margin-bottom: 1.5rem;
	}

	.date-group:last-child {
		margin-bottom: 0;
	}

	.date-header {
		font-size: 0.875rem;
		color: #88c0d0;
		margin: 0 0 0.5rem 0;
		text-transform: capitalize;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid #2d4a5e;
	}

	li:last-child {
		border-bottom: none;
	}

	li.completed .task-description {
		text-decoration: line-through;
		color: #5a6a7a;
	}

	li.deleting {
		opacity: 0.5;
		pointer-events: none;
	}

	.checkbox {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0;
		width: 24px;
		color: #88c0d0;
	}

	.checkbox:disabled {
		cursor: wait;
		opacity: 0.7;
	}

	.task-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.task-description {
		color: #e0e0e0;
	}

	.task-notes {
		font-size: 0.85rem;
		color: #8899a6;
		line-height: 1.4;
	}

	li.completed .task-notes {
		text-decoration: line-through;
		color: #5a6a7a;
	}

	.task-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
	}

	.time {
		color: #88c0d0;
	}

	.duration {
		color: #5a6a7a;
		font-weight: 500;
	}

	.category {
		opacity: 0.7;
	}

	.calendar-badge {
		font-size: 0.875rem;
	}

	.delete {
		background: none;
		border: none;
		font-size: 1.25rem;
		color: #5a6a7a;
		cursor: pointer;
		padding: 0;
	}

	.delete:hover {
		color: #e06c75;
	}

	.delete:disabled {
		cursor: wait;
		opacity: 0.7;
	}

	.empty {
		color: #5a6a7a;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem;
	}

	/* Calendar CTA */
	.calendar-cta {
		background: rgba(136, 192, 208, 0.1);
		border: 1px dashed #88c0d0;
	}

	.calendar-cta p {
		margin: 0;
		font-size: 0.875rem;
		color: #8899a6;
		text-align: center;
	}

	.calendar-cta a {
		color: #88c0d0;
	}

	/* Spinner */
	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid #2d4a5e;
		border-top-color: #88c0d0;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
