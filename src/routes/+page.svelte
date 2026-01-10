<svelte:head>
	<title>Ritual - Diário de produtividade</title>
	<meta name="description" content="Organize seu dia, acompanhe metas e crie hábitos." />
</svelte:head>

<main>
	<header>
		<span class="bear">( = )</span>
		<h1>Ritual</h1>
	</header>

	<p class="intro">
		Um diário simples para organizar seu dia, acompanhar metas e criar hábitos duradouros.
	</p>

	<a href="/login" class="cta">Entrar com Google</a>

	<hr />

	<section>
		<h2>O que faz</h2>
		<ul>
			<li><strong>Diário</strong> — Registre gratidões e reflexões diárias</li>
			<li><strong>Tarefas</strong> — Organize trabalho e vida pessoal</li>
			<li><strong>Metas</strong> — Acompanhe progresso numérico</li>
			<li><strong>Hábitos</strong> — Construa consistência</li>
			<li><strong>Agenda</strong> — Planeje o futuro, sincronize com Google Calendar</li>
		</ul>
	</section>

	<hr />

	<section>
		<h2>Privacidade</h2>
		<p>
			Usamos sua conta Google apenas para login.
			Com sua permissão, criamos eventos no seu Calendar.
			Não vendemos seus dados. Você pode deletar tudo a qualquer momento.
		</p>
	</section>

	<hr />

	<footer>
		<a href="/privacy">Privacidade</a>
		<span>·</span>
		<a href="/terms">Termos</a>
	</footer>
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		font-family: Verdana, sans-serif;
		line-height: 1.6;
		color: #e0e0e0;
	}

	header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.bear {
		font-family: monospace;
		font-size: 1.25rem;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: normal;
		color: #88c0d0;
	}

	h2 {
		font-size: 1rem;
		font-weight: bold;
		color: #88c0d0;
		margin: 0 0 0.75rem 0;
	}

	.intro {
		font-size: 1.1rem;
		color: #b8c5d0;
		margin-bottom: 1.5rem;
	}

	.cta {
		display: inline-block;
		padding: 0.6rem 1.25rem;
		background: #88c0d0;
		color: #0d1b2a;
		text-decoration: none;
		border-radius: 4px;
		font-size: 0.95rem;
	}

	.cta:hover {
		background: #9dd0e0;
	}

	hr {
		border: none;
		border-top: 1px dashed #2d4a5e;
		margin: 2rem 0;
	}

	section {
		margin-bottom: 0;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin-bottom: 0.5rem;
		color: #b8c5d0;
	}

	li strong {
		color: #e0e0e0;
	}

	p {
		color: #b8c5d0;
		margin: 0;
	}

	footer {
		display: flex;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	footer a {
		color: #88c0d0;
		text-decoration: none;
	}

	footer a:hover {
		text-decoration: underline;
	}

	footer span {
		color: #5a6a7a;
	}
</style>
