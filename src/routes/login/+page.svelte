<script lang="ts">
	// Página de login
</script>

<svelte:head>
	<title>Login - Ontrack</title>
</svelte:head>

<main>
	<h1>Ontrack</h1>
	<p>Seu ritual diário de produtividade</p>

	<a href="/login/google" class="google-btn">
		Entrar com Google
	</a>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		font-family: system-ui, -apple-system, sans-serif;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	p {
		color: #666;
		margin-bottom: 2rem;
	}

	.google-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.75rem 1.5rem;
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		color: #333;
		text-decoration: none;
		transition: background 0.2s;
	}

	.google-btn:hover {
		background: #f5f5f5;
	}
</style>
