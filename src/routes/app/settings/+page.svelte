<script lang="ts">
	import { enhance } from '$app/forms';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { themeStore, type Theme } from '$lib/stores/theme.svelte';

	let { data } = $props();

	let saved = $state(false);
	let calendarDisconnecting = $state(false);
</script>

<svelte:head>
	<title>Configurações - Ritual</title>
</svelte:head>

<main>
	<header>
		<a href="/app" class="back">&larr;</a>
		<h1>Configurações</h1>
		<div class="header-spacer"></div>
		<ThemeToggle />
	</header>

	<section class="section">
		<h2>Aparência</h2>
		<p class="description">Escolha o tema visual do aplicativo.</p>

		<div class="theme-options">
			<button
				type="button"
				class="theme-option"
				class:active={themeStore.theme === 'light'}
				onclick={() => themeStore.setTheme('light')}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="5"/>
					<line x1="12" y1="1" x2="12" y2="3"/>
					<line x1="12" y1="21" x2="12" y2="23"/>
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
					<line x1="1" y1="12" x2="3" y2="12"/>
					<line x1="21" y1="12" x2="23" y2="12"/>
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
				</svg>
				<span>Claro</span>
			</button>
			<button
				type="button"
				class="theme-option"
				class:active={themeStore.theme === 'dark'}
				onclick={() => themeStore.setTheme('dark')}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
				</svg>
				<span>Escuro</span>
			</button>
			<button
				type="button"
				class="theme-option"
				class:active={themeStore.theme === 'system'}
				onclick={() => themeStore.setTheme('system')}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
					<line x1="8" y1="21" x2="16" y2="21"/>
					<line x1="12" y1="17" x2="12" y2="21"/>
				</svg>
				<span>Sistema</span>
			</button>
		</div>
	</section>

	<section class="section">
		<h2>Afirmação diária</h2>
		<p class="description">Esta afirmação aparecerá na seção "Manhã" do seu diário.</p>

		<form
			method="POST"
			action="?/saveAffirmation"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					saved = true;
					setTimeout(() => (saved = false), 2000);
				};
			}}
		>
			<textarea
				name="affirmation"
				placeholder="Ex: Eu sou capaz de alcançar meus objetivos."
				value={data.affirmation}
			></textarea>

			<div class="actions">
				<button type="submit">Salvar</button>
				{#if saved}
					<span class="saved">Salvo!</span>
				{/if}
			</div>
		</form>
	</section>

	<section class="section calendar-section">
		<h2>Google Calendar</h2>
		<p class="description">
			Conecte seu Google Calendar para exportar tarefas agendadas e receber notificações.
		</p>

		{#if data.calendarJustConnected}
			<div class="success-message">
				Google Calendar conectado com sucesso!
			</div>
		{/if}

		{#if data.hasCalendarConnected}
			<div class="calendar-status connected">
				<span class="status-icon">✓</span>
				<span>Google Calendar conectado</span>
			</div>
			<form
				method="POST"
				action="?/disconnectCalendar"
				use:enhance={() => {
					calendarDisconnecting = true;
					return async ({ update }) => {
						await update();
						calendarDisconnecting = false;
					};
				}}
			>
				<button type="submit" class="disconnect-btn" disabled={calendarDisconnecting}>
					{calendarDisconnecting ? 'Desconectando...' : 'Desconectar'}
				</button>
			</form>
		{:else}
			<a href="/app/settings/calendar-auth" class="connect-btn">
				Conectar Google Calendar
			</a>
		{/if}
	</section>

	<section class="section">
		<h2>Conta</h2>
		<div class="account-info">
			<p>
				<strong>Status:</strong>
				{#if data.isPremium}
					<span class="premium-badge">Premium</span>
				{:else}
					<span class="free-badge">Gratuito</span>
				{/if}
			</p>

			{#if !data.isPremium}
				<p class="upgrade-info">
					Desbloqueie metas e hábitos de casal com o plano Premium.
				</p>
				<form method="POST" action="/api/stripe/checkout">
					<button type="submit" class="upgrade-btn">
						Desbloquear Premium - R$ 47
					</button>
				</form>
			{/if}
		</div>
	</section>

	<section class="section danger">
		<h2>Sair</h2>
		<form method="POST" action="/logout">
			<button type="submit" class="logout-btn">Sair da conta</button>
		</form>
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
		font-size: 1.25rem;
		margin: 0;
		color: var(--color-text-primary);
	}

	.header-spacer {
		flex: 1;
	}

	/* Theme options */
	.theme-options {
		display: flex;
		gap: 0.5rem;
	}

	.theme-option {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.theme-option:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.theme-option.active {
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}

	.theme-option span {
		font-size: 0.875rem;
	}

	h2 {
		font-size: 1rem;
		margin: 0 0 0.5rem 0;
		color: var(--color-text-primary);
	}

	.section {
		background: var(--color-bg-secondary);
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin: 0 0 1rem 0;
	}

	textarea {
		width: 100%;
		min-height: 100px;
		padding: 0.75rem;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-family: inherit;
		font-size: 1rem;
		resize: vertical;
		box-sizing: border-box;
		margin-bottom: 0.5rem;
		color: var(--color-text-primary);
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	button[type='submit'] {
		padding: 0.5rem 1rem;
		background: var(--color-accent);
		color: var(--color-accent-text);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
	}

	button[type='submit']:hover {
		background: var(--color-accent-hover);
	}

	.saved {
		color: var(--color-success);
		font-size: 0.875rem;
	}

	.account-info p {
		margin: 0 0 0.5rem 0;
		color: var(--color-text-primary);
	}

	.premium-badge {
		background: var(--color-warning);
		color: #000;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.free-badge {
		background: var(--color-border);
		color: var(--color-text-secondary);
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.upgrade-info {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.upgrade-btn {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-accent);
		color: var(--color-accent-text);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		margin-top: 0.5rem;
		font-weight: 600;
	}

	.upgrade-btn:hover {
		background: var(--color-accent-hover);
	}

	.danger {
		border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
		background: color-mix(in srgb, var(--color-error) 10%, var(--color-bg-secondary));
	}

	.logout-btn {
		background: var(--color-error) !important;
		color: #fff !important;
	}

	.logout-btn:hover {
		filter: brightness(0.9);
	}

	/* Calendar section styles */
	.calendar-section .description {
		margin-bottom: 1rem;
	}

	.success-message {
		background: color-mix(in srgb, var(--color-success) 15%, transparent);
		border: 1px solid var(--color-success);
		color: var(--color-success);
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.calendar-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.calendar-status.connected {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		border: 1px solid var(--color-accent);
		color: var(--color-accent);
	}

	.status-icon {
		font-size: 1rem;
	}

	.connect-btn {
		display: block;
		text-align: center;
		padding: 0.75rem;
		background: #4285f4;
		color: #fff;
		border: none;
		border-radius: 4px;
		text-decoration: none;
		font-weight: 600;
	}

	.connect-btn:hover {
		background: #3367d6;
	}

	.disconnect-btn {
		width: 100%;
		padding: 0.5rem;
		background: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.disconnect-btn:hover {
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.disconnect-btn:disabled {
		opacity: 0.5;
		cursor: wait;
	}
</style>
