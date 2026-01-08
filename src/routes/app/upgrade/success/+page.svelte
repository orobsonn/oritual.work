<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Bem-vindo ao Premium - Ritual</title>
</svelte:head>

<main>
	<div class="confetti">
		<span>🎉</span>
		<span>✨</span>
		<span>🎊</span>
	</div>

	<div class="content">
		<h1>Parabéns!</h1>
		<p class="subtitle">Você agora é Premium</p>

		<div class="card">
			<h2>Próximo passo: conecte-se com seu parceiro(a)</h2>

			<div class="steps">
				<div class="step">
					<span class="step-number">1</span>
					<p>Acesse a área de Casal e gere um código de convite</p>
				</div>
				<div class="step">
					<span class="step-number">2</span>
					<p>Envie o código para seu parceiro(a)</p>
				</div>
				<div class="step">
					<span class="step-number">3</span>
					<p>Ele(a) entra no Ritual e usa o código para conectar</p>
				</div>
				<div class="step">
					<span class="step-number">4</span>
					<p>Pronto! Comecem a criar metas e hábitos juntos</p>
				</div>
			</div>
		</div>

		<a href="/app/couple" class="cta">
			Ir para área de Casal
		</a>

		<a href="/app" class="secondary">
			Voltar ao Dashboard
		</a>
	</div>
</main>

<style>
	main {
		max-width: 500px;
		margin: 0 auto;
		padding: 2rem 1rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.confetti {
		font-size: 3rem;
		margin-bottom: 1rem;
		display: flex;
		gap: 1rem;
		animation: bounce 1s ease-in-out;
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-20px); }
	}

	.content {
		width: 100%;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0;
		color: #98c379;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #8899a6;
		margin: 0.5rem 0 2rem 0;
	}

	.card {
		background: #1b2838;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		text-align: left;
	}

	.card h2 {
		font-size: 1.125rem;
		color: #e0e0e0;
		margin: 0 0 1.5rem 0;
		text-align: center;
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.step {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.step-number {
		width: 28px;
		height: 28px;
		background: #88c0d0;
		color: #0d1b2a;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.step p {
		margin: 0;
		color: #e0e0e0;
		font-size: 0.9375rem;
		line-height: 1.5;
		padding-top: 3px;
	}

	.cta {
		display: block;
		width: 100%;
		padding: 1rem;
		background: #98c379;
		color: #0d1b2a;
		border: none;
		border-radius: 8px;
		font-size: 1.125rem;
		font-weight: 600;
		text-decoration: none;
		margin-bottom: 1rem;
	}

	.cta:hover {
		background: #a8d389;
	}

	.secondary {
		display: block;
		color: #8899a6;
		text-decoration: none;
		font-size: 0.9375rem;
	}

	.secondary:hover {
		color: #88c0d0;
	}
</style>
