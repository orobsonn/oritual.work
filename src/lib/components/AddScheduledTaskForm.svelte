<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		today,
		hasCalendarConnected = false,
		onSuccess = () => {},
		action = '?/addScheduledTask'
	}: {
		today: string;
		hasCalendarConnected?: boolean;
		onSuccess?: () => void;
		action?: string;
	} = $props();

	let newTaskDescription = $state('');
	let newTaskNotes = $state('');
	let newTaskCategory = $state<'work' | 'personal'>('personal');
	let newTaskDate = $state(today);
	let newTaskTime = $state('');
	let newTaskDuration = $state(60);
	let addToCalendar = $state(false);
	let isSubmitting = $state(false);
</script>

<form
	method="POST"
	{action}
	use:enhance={() => {
		isSubmitting = true;

		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				newTaskDescription = '';
				newTaskNotes = '';
				newTaskTime = '';
				newTaskDuration = 60;
				addToCalendar = false;
				newTaskDate = today;
				await update();
				onSuccess();
			}
		};
	}}
>
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
				min={today}
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
				onclick={() => (newTaskCategory = 'work')}
			>
				💼 Trabalho
			</button>
			<button
				type="button"
				class="toggle-btn"
				class:active={newTaskCategory === 'personal'}
				onclick={() => (newTaskCategory = 'personal')}
			>
				🏠 Pessoal
			</button>
		</div>
	</div>

	{#if hasCalendarConnected && newTaskTime}
		<div class="form-row">
			<button
				type="button"
				class="calendar-btn"
				class:active={addToCalendar}
				onclick={() => (addToCalendar = !addToCalendar)}
			>
				<span class="calendar-icon">📅</span>
				<span class="calendar-text">
					{addToCalendar
						? 'Sincronizar com Google Calendar'
						: 'Adicionar ao Google Calendar'}
				</span>
				{#if addToCalendar}
					<span class="calendar-check">✓</span>
				{/if}
			</button>
			<input
				type="hidden"
				name="addToCalendar"
				value={addToCalendar ? 'true' : 'false'}
			/>
		</div>
	{/if}

	<button type="submit" class="submit-btn" disabled={isSubmitting}>
		{isSubmitting ? 'Agendando...' : 'Agendar'}
	</button>
</form>

<style>
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
		color: var(--color-text-secondary);
		margin-bottom: 0.25rem;
	}

	input[type='text'],
	input[type='date'],
	input[type='time'],
	textarea,
	select {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 1rem;
		color: var(--color-text-primary);
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

	input[type='text']:focus,
	input[type='date']:focus,
	input[type='time']:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	input[type='date']::-webkit-calendar-picker-indicator,
	input[type='time']::-webkit-calendar-picker-indicator {
		filter: var(--input-icon-filter);
		cursor: pointer;
	}

	.category-toggle {
		display: flex;
		gap: 0.5rem;
	}

	.toggle-btn {
		flex: 1;
		padding: 0.75rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.toggle-btn:hover {
		background: rgba(136, 192, 208, 0.1);
	}

	.toggle-btn.active {
		background: rgba(136, 192, 208, 0.15);
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}

	.calendar-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.875rem 1rem;
		background: var(--color-bg-primary);
		border: 1px dashed var(--color-border);
		border-radius: 6px;
		color: var(--color-text-secondary);
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.calendar-btn:hover {
		border-color: var(--color-accent);
		background: rgba(136, 192, 208, 0.05);
	}

	.calendar-btn.active {
		border-style: solid;
		border-color: var(--color-accent);
		background: rgba(136, 192, 208, 0.1);
		color: var(--color-text-primary);
	}

	.calendar-icon {
		font-size: 1.1rem;
	}

	.calendar-text {
		flex: 1;
		text-align: left;
	}

	.calendar-check {
		color: var(--color-accent);
		font-weight: bold;
	}

	.submit-btn {
		width: 100%;
		padding: 0.875rem;
		background: var(--color-accent);
		color: var(--color-accent-text);
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: background 150ms;
	}

	.submit-btn:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: wait;
	}
</style>
