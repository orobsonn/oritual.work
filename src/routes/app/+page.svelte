<script lang="ts">
	let { data } = $props();

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr + 'T12:00:00');
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (dateStr === today.toISOString().split('T')[0]) return 'Hoje';
		if (dateStr === yesterday.toISOString().split('T')[0]) return 'Ontem';

		return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
	}
</script>

<svelte:head>
	<title>Dashboard - Ontrack</title>
</svelte:head>

<main>
	<header>
		<h1>Ontrack</h1>
		<div class="user-info">
			<span>{data.user.name ?? data.user.email}</span>
		</div>
	</header>

	<section class="welcome">
		<h2>Bem-vindo, {data.user.name ?? 'usuário'}!</h2>
		<p>Seu ritual diário começa aqui.</p>
	</section>

	<nav class="menu">
		<a href="/app/today" class="primary">Hoje</a>
		<a href="/app/goals">Metas</a>
		<a href="/app/habits">Hábitos</a>

		<!-- Área de Casal - visível mas potencialmente bloqueada -->
		{#if data.isPremium}
			<a href="/app/couple" class="couple-link">
				Casal
				{#if data.hasCouple}
					<span class="badge connected">Conectado</span>
				{/if}
			</a>
		{:else}
			<div class="couple-locked">
				<span class="lock-text">Casal</span>
				<span class="premium-tag">Premium</span>
			</div>
		{/if}

		<a href="/app/settings" class="secondary">Configurações</a>
	</nav>

	<!-- Histórico recente -->
	{#if data.recentDays.length > 0}
		<section class="history">
			<h3>Últimos dias</h3>
			<ul>
				{#each data.recentDays as day}
					<li>
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
		font-family: system-ui, -apple-system, sans-serif;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #eee;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0;
	}

	.user-info span {
		color: #666;
	}

	.welcome {
		text-align: center;
		margin-bottom: 2rem;
	}

	.welcome h2 {
		margin-bottom: 0.5rem;
	}

	.welcome p {
		color: #666;
	}

	.menu {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.menu a {
		padding: 1rem;
		background: #f9f9f9;
		border: 1px solid #eee;
		border-radius: 4px;
		text-decoration: none;
		color: #333;
		transition: background 0.2s;
	}

	.menu a:hover {
		background: #f0f0f0;
	}

	.menu a.primary {
		background: #333;
		color: #fff;
		border-color: #333;
	}

	.menu a.primary:hover {
		background: #444;
	}

	.menu a.secondary {
		background: transparent;
		color: #666;
	}

	.couple-link {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.badge.connected {
		background: #22c55e;
		color: #fff;
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
	}

	.couple-locked {
		padding: 1rem;
		background: #fafafa;
		border: 1px dashed #ddd;
		border-radius: 4px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #999;
	}

	.lock-text {
		color: #999;
	}

	.premium-tag {
		background: #fbbf24;
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
		border-top: 1px solid #eee;
	}

	.history h3 {
		font-size: 0.875rem;
		color: #666;
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.history li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.history li:last-child {
		border-bottom: none;
	}

	.date {
		font-size: 0.875rem;
		color: #666;
	}

	.mini-progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mini-bar {
		width: 60px;
		height: 4px;
		background: #e0e0e0;
		border-radius: 2px;
		overflow: hidden;
	}

	.mini-fill {
		height: 100%;
		background: #333;
	}

	.mini-text {
		font-size: 0.75rem;
		color: #999;
		width: 35px;
		text-align: right;
	}

	.no-tasks {
		color: #ddd;
	}
</style>
