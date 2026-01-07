<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let saved = $state(false);
</script>

<svelte:head>
	<title>Configurações - Ontrack</title>
</svelte:head>

<main>
	<header>
		<a href="/app" class="back">&larr;</a>
		<h1>Configurações</h1>
	</header>

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
				<button class="upgrade-btn" disabled>
					Desbloquear Premium (R$ 47) - Em breve
				</button>
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
	}

	h2 {
		font-size: 1rem;
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	.section {
		background: #fafafa;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.description {
		font-size: 0.875rem;
		color: #666;
		margin: 0 0 1rem 0;
	}

	textarea {
		width: 100%;
		min-height: 100px;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-family: inherit;
		font-size: 1rem;
		resize: vertical;
		box-sizing: border-box;
		margin-bottom: 0.5rem;
	}

	textarea:focus {
		outline: none;
		border-color: #333;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	button[type='submit'] {
		padding: 0.5rem 1rem;
		background: #333;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.saved {
		color: #22c55e;
		font-size: 0.875rem;
	}

	.account-info p {
		margin: 0 0 0.5rem 0;
	}

	.premium-badge {
		background: #fbbf24;
		color: #000;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.free-badge {
		background: #e5e5e5;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.upgrade-info {
		font-size: 0.875rem;
		color: #666;
	}

	.upgrade-btn {
		width: 100%;
		padding: 0.75rem;
		background: #333;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.upgrade-btn:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.danger {
		border: 1px solid #fee2e2;
		background: #fef2f2;
	}

	.logout-btn {
		background: #ef4444;
	}
</style>
