<script lang="ts">
	let { data } = $props();

	const workTasks = $derived(data.tasks.filter((t) => t.category === 'work'));
	const personalTasks = $derived(data.tasks.filter((t) => t.category === 'personal'));
</script>

<svelte:head>
	<title>{data.dateDisplay} - Ritual</title>
</svelte:head>

<main>
	<header>
		<div class="header-content">
			<a href="/app" class="back">&larr;</a>
			<h1>{data.dateDisplay}</h1>
			<span class="readonly-badge">Somente leitura</span>
		</div>
	</header>

	<div class="diary-content">
		{#if !data.entry}
			<section class="section empty-day">
				<p>Nenhum registro encontrado para este dia.</p>
				<a href="/app/today" class="back-link">Voltar para hoje</a>
			</section>
		{:else}
			<!-- Seção Manhã -->
			<section class="section morning">
				<h2>Manhã</h2>

				{#if data.affirmation}
					<div class="affirmation">
						<p>{data.affirmation}</p>
					</div>
				{/if}

				<div class="field">
					<label>Sou grato por...</label>
					<div class="readonly-content preserve-whitespace">
						{#if data.entry.gratitude}
							{data.entry.gratitude}
						{:else}
							<span class="empty">Não preenchido</span>
						{/if}
					</div>
				</div>

				<div class="field">
					<label>O que faria o meu dia perfeito?</label>
					<div class="readonly-content preserve-whitespace">
						{#if data.entry.intention}
							{data.entry.intention}
						{:else}
							<span class="empty">Não preenchido</span>
						{/if}
					</div>
				</div>
			</section>

			<!-- Seção Tarefas -->
			<section class="section tasks">
				<h2>Tarefas</h2>

				{#if workTasks.length > 0}
					<div class="task-group">
						<h3>Trabalho</h3>
						<ul>
							{#each workTasks as task (task.id)}
								<li class:completed={task.completed === 1}>
									<span class="checkbox">{task.completed === 1 ? '✓' : '○'}</span>
									<span>{task.description}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if personalTasks.length > 0}
					<div class="task-group">
						<h3>Pessoal</h3>
						<ul>
							{#each personalTasks as task (task.id)}
								<li class:completed={task.completed === 1}>
									<span class="checkbox">{task.completed === 1 ? '✓' : '○'}</span>
									<span>{task.description}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if workTasks.length === 0 && personalTasks.length === 0}
					<p class="empty">Nenhuma tarefa registrada</p>
				{/if}
			</section>

			<!-- Seção Hábitos -->
			{#if data.habits.length > 0}
				<section class="section habits">
					<h2>Hábitos do dia</h2>
					<ul>
						{#each data.habits as habit (habit.id)}
							<li class:completed={habit.completedToday} class:couple-habit={habit.isCouple}>
								<span class="checkbox">{habit.completedToday ? '✓' : '○'}</span>
								<span>{habit.title}</span>
								{#if habit.isCouple}
									<span class="badge couple">casal</span>
								{/if}
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<!-- Seção Noite -->
			<section class="section evening">
				<h2>Noite</h2>

				<div class="field">
					<label>Coisas incríveis que aconteceram</label>
					<div class="readonly-content preserve-whitespace">
						{#if data.entry.greatThings}
							{data.entry.greatThings}
						{:else}
							<span class="empty">Não preenchido</span>
						{/if}
					</div>
				</div>

				<div class="field">
					<label>O que podia ter feito</label>
					<div class="readonly-content preserve-whitespace">
						{#if data.entry.couldHaveDone}
							{data.entry.couldHaveDone}
						{:else}
							<span class="empty">Não preenchido</span>
						{/if}
					</div>
				</div>

				<div class="field">
					<label>Planos para amanhã</label>
					<div class="readonly-content preserve-whitespace">
						{#if data.entry.tomorrowPlans}
							{data.entry.tomorrowPlans}
						{:else}
							<span class="empty">Não preenchido</span>
						{/if}
					</div>
				</div>
			</section>
		{/if}
	</div>

	<div class="navigation">
		<a href="/app/today" class="today-link">Ir para hoje</a>
	</div>
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
		background: color-mix(in srgb, var(--color-bg-primary) 85%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
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
		color: var(--color-accent);
	}

	h1 {
		flex: 1;
		font-size: 1rem;
		margin: 0;
		color: var(--color-text-primary);
		text-transform: capitalize;
	}

	.readonly-badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: color-mix(in srgb, var(--color-accent) 20%, transparent);
		color: var(--color-accent);
		border-radius: 4px;
	}

	h2 {
		font-size: 1rem;
		margin: 0 0 1rem 0;
		color: var(--color-accent);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	h3 {
		font-size: 0.875rem;
		margin: 0 0 0.5rem 0;
		color: var(--color-text-secondary);
	}

	.section {
		margin-bottom: 1rem;
		padding: 1rem;
		background: var(--color-bg-secondary);
		border-radius: 8px;
	}

	.field {
		margin-bottom: 1rem;
	}

	.field:last-child {
		margin-bottom: 0;
	}

	label {
		display: block;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: 0.5rem;
	}

	.readonly-content {
		padding: 0.75rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-primary);
		min-height: 60px;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.preserve-whitespace {
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.readonly-content .empty {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.affirmation {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		border-left: 3px solid var(--color-accent);
		padding: 0.75rem 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.affirmation p {
		margin: 0;
		font-style: italic;
		color: var(--color-text-secondary);
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
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
		color: var(--color-text-primary);
	}

	li:last-child {
		border-bottom: none;
	}

	li.completed span:not(.checkbox):not(.badge) {
		text-decoration: line-through;
		color: var(--color-text-muted);
	}

	.checkbox {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		color: var(--color-text-muted);
	}

	li.completed .checkbox {
		color: var(--color-accent);
	}

	.badge {
		font-size: 0.7rem;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		text-transform: uppercase;
	}

	.badge.couple {
		background: color-mix(in srgb, var(--color-couple) 20%, transparent);
		color: var(--color-couple);
	}

	.couple-habit {
		border-left: 2px solid var(--color-couple);
		padding-left: 0.5rem;
		margin-left: -0.5rem;
	}

	.empty-day {
		text-align: center;
		padding: 2rem;
	}

	.empty-day p {
		color: var(--color-text-secondary);
		margin-bottom: 1rem;
	}

	.back-link, .today-link {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: var(--color-accent);
		color: var(--color-accent-text);
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
	}

	.back-link:hover, .today-link:hover {
		background: var(--color-accent-hover);
		text-decoration: none;
	}

	.navigation {
		text-align: center;
		margin-top: 1rem;
		padding: 1rem;
	}

	p.empty {
		color: var(--color-text-muted);
		text-align: center;
		padding: 1rem;
	}
</style>
