<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Premium - Ritual</title>
</svelte:head>

<main>
	<a href="/app" class="back">&larr; Voltar</a>

	<div class="hero">
		<h1>Modo Casal</h1>
		<p class="subtitle">Cresçam juntos, alcancem mais.</p>
	</div>

	<div class="features">
		<div class="feature">
			<span class="icon">💑</span>
			<div>
				<h3>Metas Compartilhadas</h3>
				<p>Definam objetivos em comum e acompanhem o progresso juntos.</p>
			</div>
		</div>

		<div class="feature">
			<span class="icon">🔄</span>
			<div>
				<h3>Hábitos de Casal</h3>
				<p>Criem hábitos que ambos podem marcar como concluídos.</p>
			</div>
		</div>

		<div class="feature">
			<span class="icon">📊</span>
			<div>
				<h3>Dashboard Conjunto</h3>
				<p>Visualizem o progresso um do outro em tempo real.</p>
			</div>
		</div>

		<div class="feature">
			<span class="icon">🔗</span>
			<div>
				<h3>Conexão Fácil</h3>
				<p>Conecte-se com seu parceiro(a) através de um código único.</p>
			</div>
		</div>
	</div>

	<div class="pricing-card">
		<div class="price">
			<span class="value">R$ 47</span>
			<span class="period">pagamento único</span>
		</div>

		<ul class="benefits">
			<li>Acesso vitalício</li>
			<li>Sem mensalidades</li>
			<li>Todas as funcionalidades de casal</li>
		</ul>

		<form method="POST" action="/api/stripe/checkout">
			<button type="submit" class="cta">
				Desbloquear agora
			</button>
		</form>
	</div>

	<p class="guarantee">Pagamento seguro via Stripe</p>
</main>

<style>
	main {
		max-width: 500px;
		margin: 0 auto;
		padding: 2rem 1rem;
		min-height: 100vh;
	}

	.back {
		display: inline-block;
		color: #88c0d0;
		text-decoration: none;
		margin-bottom: 2rem;
		font-size: 1rem;
	}

	.back:hover {
		text-decoration: underline;
	}

	.hero {
		text-align: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin: 0 0 0.5rem 0;
		color: #e0e0e0;
	}

	.subtitle {
		color: #8899a6;
		font-size: 1.125rem;
		margin: 0;
	}

	.features {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.feature {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: #1b2838;
		border-radius: 8px;
		align-items: flex-start;
	}

	.icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.feature h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1rem;
		color: #e0e0e0;
	}

	.feature p {
		margin: 0;
		font-size: 0.875rem;
		color: #8899a6;
	}

	.pricing-card {
		background: linear-gradient(135deg, #2d4a3e 0%, #1b3830 100%);
		border: 1px solid #3d6a5e;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		margin-bottom: 1rem;
	}

	.price {
		display: flex;
		flex-direction: column;
		margin-bottom: 1.5rem;
	}

	.value {
		font-size: 3rem;
		font-weight: bold;
		color: #98c379;
	}

	.period {
		color: #8899a6;
		font-size: 0.875rem;
	}

	.benefits {
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem 0;
		text-align: left;
	}

	.benefits li {
		padding: 0.5rem 0;
		color: #e0e0e0;
		font-size: 0.9375rem;
	}

	.benefits li::before {
		content: '✓ ';
		color: #98c379;
		font-weight: bold;
	}

	.cta {
		width: 100%;
		padding: 1rem;
		background: #98c379;
		color: #0d1b2a;
		border: none;
		border-radius: 8px;
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
	}

	.cta:hover {
		background: #a8d389;
	}

	.guarantee {
		text-align: center;
		color: #5a6a7a;
		font-size: 0.875rem;
		margin: 0;
	}
</style>
