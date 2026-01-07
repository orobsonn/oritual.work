<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let { data } = $props();

	let newTaskDescription = $state('');
	let newTaskCategory = $state<'work' | 'personal'>('work');

	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let saving = $state(false);

	// Rich editor state values
	let gratitudeValue = $state(data.entry.gratitude ?? '');
	let intentionValue = $state(data.entry.intention ?? '');
	let greatThingsValue = $state(data.entry.greatThings ?? '');
	let couldHaveDoneValue = $state(data.entry.couldHaveDone ?? '');
	let tomorrowPlansValue = $state(data.entry.tomorrowPlans ?? '');

	// Initialize editors with content on mount
	onMount(() => {
		initializeEditor('gratitude-editor', data.entry.gratitude);
		initializeEditor('intention-editor', data.entry.intention);
		initializeEditor('great-things-editor', data.entry.greatThings);
		initializeEditor('could-have-done-editor', data.entry.couldHaveDone);
		initializeEditor('tomorrow-plans-editor', data.entry.tomorrowPlans);
	});

	function initializeEditor(editorId: string, content: string | null) {
		const editor = document.getElementById(editorId);
		if (editor && content) {
			editor.innerHTML = renderContent(content);
		}
	}

	function renderContent(text: string): string {
		const lines = text.split('\n');
		let html = '';
		let inList = false;

		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
				if (!inList) {
					html += '<ul>';
					inList = true;
				}
				html += `<li>${trimmed.slice(2)}</li>`;
			} else {
				if (inList) {
					html += '</ul>';
					inList = false;
				}
				if (trimmed) {
					html += `<div>${trimmed}</div>`;
				} else {
					html += '<div><br></div>';
				}
			}
		}
		if (inList) html += '</ul>';
		return html || '<div><br></div>';
	}

	function handleEditorKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLDivElement;

		if (e.key === 'Enter') {
			const selection = window.getSelection();
			if (!selection || !selection.rangeCount) return;

			const range = selection.getRangeAt(0);
			const li = range.startContainer.parentElement?.closest('li');

			if (li) {
				// We're in a list item - let browser handle it
				return;
			}

			// Check if current line starts with bullet
			const currentText = range.startContainer.textContent || '';
			if (currentText.trim().startsWith('- ') || currentText.trim().startsWith('• ')) {
				e.preventDefault();
				document.execCommand('insertUnorderedList');
			}
		}
	}

	function handleEditorInput(e: Event, updateFn: (val: string) => void) {
		const target = e.target as HTMLDivElement;

		// Check for bullet point trigger "- " at start of line
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const node = range.startContainer;

			// Only process text nodes not already in a list
			if (node.nodeType === Node.TEXT_NODE && !node.parentElement?.closest('li')) {
				const nodeText = node.textContent || '';

				// Check if line starts with "- " (bullet trigger)
				if (nodeText === '- ' || nodeText.startsWith('- ')) {
					// Clear the "- " and convert to list
					const remainingText = nodeText.slice(2);

					// Save selection info
					const parentEl = node.parentElement;

					if (parentEl) {
						// Set content without the "- "
						node.textContent = remainingText || '\u200B'; // Zero-width space if empty

						// Move cursor to start
						const newRange = document.createRange();
						newRange.setStart(node, remainingText ? 0 : 1);
						newRange.collapse(true);
						selection.removeAllRanges();
						selection.addRange(newRange);

						// Create bullet list
						document.execCommand('insertUnorderedList');
					}
				}
			}
		}

		const text = target.innerText;
		updateFn(text);
		scheduleAutoSave(e);
	}

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

	// Filtrar hábitos mensais que já atingiram o target
	const filteredHabits = $derived(data.habits.filter(h => {
		if (h.frequencyType === 'monthly' && h.monthlyCompleted >= h.monthlyTarget && !h.completedToday) {
			return false;
		}
		return true;
	}));
</script>

<svelte:head>
	<title>Hoje - Rumo</title>
</svelte:head>

<header>
	<div class="header-content">
		<a href="/app" class="back">&larr;</a>
		<h1>{data.today}</h1>
		{#if totalTasks > 0}
			<div class="header-progress">
				<span class="progress-text">{progressPercent}%</span>
				<div class="progress-bar-mini">
					<div class="progress-fill" style="width: {progressPercent}%"></div>
				</div>
			</div>
		{/if}
	</div>
</header>

<main>

	<div class="diary-content">
		<!-- Seção Manhã -->
		<section class="section morning">
		<h2>Manhã</h2>

		<form id="entry-form" method="POST" action="?/saveEntry" use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
				saving = false;
			};
		}}>
			<div class="field">
				<label for="gratitude-editor">Sou grato por...</label>
				<div
					class="rich-editor"
					contenteditable="true"
					role="textbox"
					aria-multiline="true"
					id="gratitude-editor"
					data-placeholder="Escreva pelo que você é grato hoje..."
					onkeydown={handleEditorKeydown}
					oninput={(e) => handleEditorInput(e, (val) => gratitudeValue = val)}
				></div>
				<input type="hidden" name="gratitude" bind:value={gratitudeValue} />
			</div>

			<div class="field">
				<label for="intention-editor">O que faria o meu dia perfeito?</label>
				<div
					class="rich-editor"
					contenteditable="true"
					role="textbox"
					aria-multiline="true"
					id="intention-editor"
					data-placeholder="Descreva como seria seu dia ideal..."
					onkeydown={handleEditorKeydown}
					oninput={(e) => handleEditorInput(e, (val) => intentionValue = val)}
				></div>
				<input type="hidden" name="intention" bind:value={intentionValue} />
			</div>
		</form>

		{#if data.affirmation}
			<div class="affirmation">
				<span class="affirmation-label">Afirmação diária</span>
				<p>"{data.affirmation}"</p>
			</div>
		{/if}

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
		{#if filteredHabits.length > 0}
			<section class="section habits">
			<h2>Hábitos de hoje</h2>
			<ul>
				{#each filteredHabits as habit (habit.id)}
					<li class:completed={habit.completedToday} class:couple-habit={habit.isCouple}>
						<form method="POST" action="?/toggleHabit" use:enhance>
							<input type="hidden" name="habitId" value={habit.id} />
							<input type="hidden" name="completed" value={habit.completedToday ? 'false' : 'true'} />
							<input type="hidden" name="isCouple" value={habit.isCouple ? 'true' : 'false'} />
							<button type="submit" class="checkbox">
								{habit.completedToday ? '✓' : '○'}
							</button>
						</form>
						<span>{habit.title}</span>
						{#if habit.isCouple}
							<span class="badge couple">casal</span>
						{/if}
						{#if habit.frequencyType === 'monthly'}
							<span class="badge monthly">{habit.monthlyCompleted}/{habit.monthlyTarget}</span>
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
				<label for="great-things-editor">Coisas incríveis que aconteceram</label>
				<div
					class="rich-editor"
					contenteditable="true"
					role="textbox"
					aria-multiline="true"
					id="great-things-editor"
					data-placeholder="O que de bom aconteceu hoje?"
					onkeydown={handleEditorKeydown}
					oninput={(e) => handleEditorInput(e, (val) => greatThingsValue = val)}
				></div>
				<input type="hidden" name="greatThings" bind:value={greatThingsValue} />
			</div>

			<div class="field">
				<label for="could-have-done-editor">O que podia ter feito</label>
				<div
					class="rich-editor"
					contenteditable="true"
					role="textbox"
					aria-multiline="true"
					id="could-have-done-editor"
					data-placeholder="O que você poderia ter feito melhor?"
					onkeydown={handleEditorKeydown}
					oninput={(e) => handleEditorInput(e, (val) => couldHaveDoneValue = val)}
				></div>
				<input type="hidden" name="couldHaveDone" bind:value={couldHaveDoneValue} />
			</div>

			<div class="field">
				<label for="tomorrow-plans-editor">Planos para amanhã</label>
				<div
					class="rich-editor"
					contenteditable="true"
					role="textbox"
					aria-multiline="true"
					id="tomorrow-plans-editor"
					data-placeholder="O que pretende fazer amanhã?"
					onkeydown={handleEditorKeydown}
					oninput={(e) => handleEditorInput(e, (val) => tomorrowPlansValue = val)}
				></div>
				<input type="hidden" name="tomorrowPlans" bind:value={tomorrowPlansValue} />
			</div>
		</form>
		</section>
	</div>
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
		padding-top: 4rem;
	}

	/* Responsive grid layout for desktop */
	@media (min-width: 1024px) {
		main {
			max-width: 1200px;
			padding: 2rem;
			padding-top: 5rem;
		}

		.diary-content {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto auto auto;
			gap: 1.5rem;
		}

		/* Manhã - coluna esquerda, linha 1 */
		.morning {
			grid-column: 1;
			grid-row: 1;
		}

		/* Hábitos - coluna direita, linha 1 */
		.habits {
			grid-column: 2;
			grid-row: 1;
		}

		/* Tarefas - ocupa as duas colunas, linha 2 */
		.tasks {
			grid-column: 1 / -1;
			grid-row: 2;
		}

		/* Noite - ocupa as duas colunas, linha 3 */
		.evening {
			grid-column: 1 / -1;
			grid-row: 3;
		}

		.section {
			padding: 1.5rem;
		}
	}

	/* Ultra-wide screens */
	@media (min-width: 1600px) {
		main {
			max-width: 1400px;
		}
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
		box-sizing: border-box;
	}

	@media (min-width: 1024px) {
		.header-content {
			max-width: 1200px;
			padding: 1rem 2rem;
		}
	}

	@media (min-width: 1600px) {
		.header-content {
			max-width: 1400px;
		}
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

	.header-progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header-progress .progress-text {
		font-size: 0.875rem;
		color: #88c0d0;
		font-weight: 600;
	}

	.progress-bar-mini {
		width: 60px;
		height: 6px;
		background: rgba(45, 74, 94, 0.5);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-bar-mini .progress-fill {
		height: 100%;
		background: #88c0d0;
		transition: width 0.3s ease;
	}

	h2 {
		font-size: 1rem;
		margin: 0 0 1rem 0;
		color: #88c0d0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	h3 {
		font-size: 0.875rem;
		margin: 0 0 0.5rem 0;
		color: #8899a6;
	}

	.section {
		margin-bottom: 2rem;
		padding: 1rem;
		background: #1b2838;
		border-radius: 8px;
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
		color: #8899a6;
		margin-bottom: 0.25rem;
	}

	/* Rich Editor - Obsidian style */
	.rich-editor {
		min-height: 80px;
		padding: 0.75rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		font-family: inherit;
		font-size: 1rem;
		color: #e0e0e0;
		line-height: 1.6;
		box-sizing: border-box;
	}

	.rich-editor:focus {
		outline: none;
		border-color: #88c0d0;
	}

	.rich-editor:empty::before {
		content: attr(data-placeholder);
		color: #5a6a7a;
		pointer-events: none;
	}

	.rich-editor :global(ul) {
		margin: 0.25rem 0;
		padding-left: 1.5rem;
		list-style-type: disc;
	}

	.rich-editor :global(li) {
		margin: 0.125rem 0;
		padding: 0;
		border: none;
		display: list-item;
	}

	.rich-editor :global(li)::marker {
		color: #88c0d0;
	}

	.rich-editor :global(div) {
		min-height: 1.4em;
	}

	/* Affirmation */
	.affirmation {
		background: #0d1b2a;
		padding: 1rem;
		border-left: 3px solid #88c0d0;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
		font-style: italic;
		color: #b8c5d0;
	}

	.affirmation-label {
		display: block;
		font-size: 0.75rem;
		font-style: normal;
		color: #8899a6;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
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
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		font-size: 1rem;
		color: #e0e0e0;
	}

	.add-task select {
		padding: 0.5rem;
		background: #0d1b2a;
		border: 1px solid #2d4a5e;
		border-radius: 4px;
		color: #e0e0e0;
	}

	.add-task button {
		padding: 0.5rem 1rem;
		background: #88c0d0;
		color: #0d1b2a;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.add-task button:hover {
		background: #9dd0e0;
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
		border-bottom: 1px solid #2d4a5e;
	}

	li:last-child {
		border-bottom: none;
	}

	li.completed span {
		text-decoration: line-through;
		color: #5a6a7a;
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

	li span {
		flex: 1;
		color: #e0e0e0;
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

	.badge {
		font-size: 0.625rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: transparent;
		border: 1px solid #5a6a7a;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		color: #8899a6;
	}

	.badge.couple {
		border-color: #e879a9;
		color: #e879a9;
		margin-left: auto;
	}

	.badge.monthly {
		margin-left: auto;
	}

	li.couple-habit .checkbox {
		color: #e879a9;
	}

	.empty {
		color: #5a6a7a;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem;
	}

	.saving-indicator {
		font-size: 0.75rem;
		color: #5a6a7a;
		text-align: right;
		margin-top: 0.5rem;
	}

</style>
