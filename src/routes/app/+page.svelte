<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data } = $props();

	function formatDate(dateStr: string): string {
		const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

		if (dateStr === today) return 'Hoje';

		const date = new Date(dateStr + 'T12:00:00');
		return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
	}

	function getProgressColor(percent: number): string {
		if (percent >= 80) return 'var(--color-success)';
		if (percent >= 50) return 'var(--color-accent)';
		if (percent >= 25) return 'var(--color-warning)';
		return 'var(--color-error)';
	}
</script>

<svelte:head>
	<title>Dashboard - Ritual</title>
</svelte:head>

<main>
	<header>
		<h1><span class="logo-char">ᕙ(⇀‸↼‶)ᕗ</span> Ritual</h1>
		<div class="header-actions">
			<ThemeToggle />
			<div class="user-info">
				<span>{data.user.name ?? data.user.email}</span>
			</div>
		</div>
	</header>

	<section class="welcome">
		<h2>Olá, {data.user.name ?? 'usuário'}!</h2>
		<p>Seu ritual diário começa com as escolhas de agora.</p>
	</section>

	<nav class="menu">
		<a href="/app/today" class="primary">Hoje</a>

		<div class="menu-grid">
			<a href="/app/goals">Metas</a>
			<a href="/app/habits">Hábitos</a>
			<a href="/app/agenda">Agenda</a>

			<!-- Área de Casal -->
			<a href="/app/couple" class="couple-link" class:upgrade={!data.isPremium && !data.hasCouple}>
				Casal
				{#if data.hasCouple}
					<span class="badge connected">Conectado</span>
				{:else if !data.isPremium}
					<span class="premium-tag">Premium</span>
				{/if}
			</a>

			<a href="/app/settings">Configurações</a>
		</div>
	</nav>

	<!-- Analytics Section -->
	<section class="analytics">
		<h3>Análises</h3>

		<div class="analytics-grid">
			<!-- Tarefas da Semana -->
			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Tarefas da Semana</span>
					<span class="stat-value" style="color: {getProgressColor(data.analytics.tasks.week.percent)}">{data.analytics.tasks.week.percent}%</span>
				</div>
				<div class="stat-bar">
					<div class="stat-fill" style="width: {data.analytics.tasks.week.percent}%; background: {getProgressColor(data.analytics.tasks.week.percent)}"></div>
				</div>
				<span class="stat-detail">{data.analytics.tasks.week.completed}/{data.analytics.tasks.week.total} concluídas</span>
			</div>

			<!-- Tarefas do Mês -->
			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Tarefas do Mês</span>
					<span class="stat-value" style="color: {getProgressColor(data.analytics.tasks.month.percent)}">{data.analytics.tasks.month.percent}%</span>
				</div>
				<div class="stat-bar">
					<div class="stat-fill" style="width: {data.analytics.tasks.month.percent}%; background: {getProgressColor(data.analytics.tasks.month.percent)}"></div>
				</div>
				<span class="stat-detail">{data.analytics.tasks.month.completed}/{data.analytics.tasks.month.total} concluídas</span>
			</div>

			<!-- Hábitos da Semana -->
			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Hábitos da Semana</span>
					<span class="stat-value" style="color: {getProgressColor(data.analytics.habits.week.percent)}">{data.analytics.habits.week.percent}%</span>
				</div>
				<div class="stat-bar">
					<div class="stat-fill" style="width: {data.analytics.habits.week.percent}%; background: {getProgressColor(data.analytics.habits.week.percent)}"></div>
				</div>
				<span class="stat-detail">{data.analytics.habits.week.completed}/{data.analytics.habits.week.expected} concluídos</span>
			</div>
		</div>

		<!-- Metas -->
		{#if data.analytics.goals.length > 0}
			<div class="goals-section">
				<h4>Progresso das Metas</h4>
				<div class="goals-list">
					{#each data.analytics.goals as goal (goal.id)}
						<a href="/app/goals" class="goal-row">
							<span class="goal-name">{goal.title}</span>
							<div class="goal-progress-container">
								<div class="goal-bar">
									<div class="goal-fill" style="width: {goal.percent}%"></div>
								</div>
								<span class="goal-numbers">{goal.current}/{goal.target}</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Metas de Casal -->
		{#if data.analytics.coupleGoals.length > 0}
			<div class="goals-section couple">
				<h4>Metas de Casal</h4>
				<div class="goals-list">
					{#each data.analytics.coupleGoals as goal (goal.id)}
						<a href="/app/couple" class="goal-row couple">
							<span class="goal-name">{goal.title}</span>
							<div class="goal-progress-container">
								<div class="goal-bar couple">
									<div class="goal-fill couple" style="width: {goal.percent}%"></div>
								</div>
								<span class="goal-numbers">{goal.current}/{goal.target}</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</section>

	<!-- Histórico recente -->
	{#if data.recentDays.length > 0}
		<section class="history">
			<h3>Últimos dias</h3>
			<ul>
				{#each data.recentDays as day}
					{@const isToday = day.date === new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })}
					<li>
						<a href={isToday ? '/app/today' : `/app/today/${day.date}`} class="day-link">
							<span class="date">{formatDate(day.date)}</span>
							{#if day.taskStats.total > 0}
								<div class="mini-progress">
									<div class="mini-bar">
										<div class="mini-fill" style="width: {day.taskStats.percent}%"></div>
									</div>
									<span class="mini-text">{day.taskStats.percent}%</span>
								</div>
							{:else}
								<span class="no-tasks">-</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	h1 {
		font-size: 1.5rem;
		margin: 0;
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logo-char {
		font-size: 1rem;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.user-info span {
		color: var(--color-text-secondary);
	}

	.welcome {
		text-align: center;
		margin-bottom: 2rem;
	}

	.welcome h2 {
		margin-bottom: 0.5rem;
		color: var(--color-text-primary);
	}

	.welcome p {
		color: var(--color-text-secondary);
	}

	.menu {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.menu > a {
		padding: 1rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		text-decoration: none;
		color: var(--color-text-primary);
		transition: background 0.2s;
	}

	.menu > a:hover {
		background: var(--color-bg-tertiary);
		text-decoration: none;
	}

	.menu > a.primary {
		background: var(--color-accent);
		color: var(--color-accent-text);
		border-color: var(--color-accent);
		font-weight: 600;
	}

	.menu > a.primary:hover {
		background: var(--color-accent-hover);
	}

	.menu-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.menu-grid a,
	.menu-grid .couple-locked {
		padding: 1rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		text-decoration: none;
		color: var(--color-text-primary);
		transition: background 0.2s;
	}

	.menu-grid a:hover {
		background: var(--color-bg-tertiary);
	}

	.couple-link {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.badge.connected {
		background: var(--color-success);
		color: #fff;
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
	}

	.couple-link.upgrade {
		border: 1px dashed var(--color-warning);
	}

	.couple-link.upgrade:hover {
		background: rgba(251, 191, 36, 0.1);
		border-color: var(--color-warning);
	}

	.premium-tag {
		background: var(--color-warning);
		color: #000;
		font-size: 0.7rem;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-weight: 600;
	}

	/* Histórico */
	.history {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.history h3 {
		font-size: 0.875rem;
		color: var(--color-accent);
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history ul {
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 300px;
		overflow-y: auto;
	}

	.history li {
		padding: 0;
		border-bottom: 1px solid var(--color-bg-secondary);
	}

	.history li:last-child {
		border-bottom: none;
	}

	.day-link {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		text-decoration: none;
		color: inherit;
		transition: opacity 0.2s;
	}

	.day-link:hover {
		opacity: 0.8;
		text-decoration: none;
	}

	.date {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.mini-progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mini-bar {
		width: 60px;
		height: 4px;
		background: var(--color-bg-secondary);
		border-radius: 2px;
		overflow: hidden;
	}

	.mini-fill {
		height: 100%;
		background: var(--color-accent);
	}

	.mini-text {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		width: 35px;
		text-align: right;
	}

	.no-tasks {
		color: var(--color-text-muted);
	}

	/* Analytics Section */
	.analytics {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.analytics h3 {
		font-size: 0.875rem;
		color: var(--color-accent);
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.analytics-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		background: var(--color-bg-secondary);
		padding: 1rem;
		border-radius: 8px;
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.stat-bar {
		height: 8px;
		background: var(--color-bg-primary);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.stat-fill {
		height: 100%;
		transition: width 0.3s ease;
	}

	.stat-detail {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	/* Goals in analytics */
	.goals-section {
		margin-top: 1rem;
	}

	.goals-section h4 {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.goals-section.couple h4 {
		color: var(--color-couple);
	}

	.goals-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.goal-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-bg-secondary);
		border-radius: 6px;
		text-decoration: none;
		transition: background 0.2s;
	}

	.goal-row:hover {
		background: var(--color-bg-tertiary);
	}

	.goal-row.couple {
		border-left: 3px solid var(--color-couple);
	}

	.goal-name {
		color: var(--color-text-primary);
		font-size: 0.875rem;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.goal-progress-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.goal-bar {
		width: 80px;
		height: 6px;
		background: color-mix(in srgb, var(--color-border) 50%, transparent);
		border-radius: 3px;
		overflow: hidden;
	}

	.goal-bar.couple {
		background: color-mix(in srgb, var(--color-couple) 20%, transparent);
	}

	.goal-fill {
		height: 100%;
		background: var(--color-accent);
		transition: width 0.3s ease;
	}

	.goal-fill.couple {
		background: var(--color-couple);
	}

	.goal-numbers {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		min-width: 50px;
		text-align: right;
	}

	/* Responsive desktop layout */
	@media (min-width: 768px) {
		.analytics-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1024px) {
		main {
			max-width: 1000px;
			padding: 2rem;
		}

		header {
			margin-bottom: 2.5rem;
			padding-bottom: 1.5rem;
		}

		.welcome {
			margin-bottom: 2.5rem;
		}

		.welcome h2 {
			font-size: 1.75rem;
		}

		.menu {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}

		.menu > a.primary {
			grid-column: 1 / -1;
			text-align: center;
			font-size: 1.1rem;
			padding: 1.25rem;
		}

		.menu-grid {
			grid-column: 1 / -1;
		}

		.analytics {
			margin-top: 3rem;
		}

		.stat-card {
			padding: 1.5rem;
		}

		.stat-value {
			font-size: 2rem;
		}

		.history {
			margin-top: 3rem;
		}

		.goals-section {
			margin-top: 1.5rem;
		}
	}
</style>
