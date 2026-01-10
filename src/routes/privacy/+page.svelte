<script>
	const lastUpdated = '10 de Janeiro de 2025';
</script>

<svelte:head>
	<title>Política de Privacidade - Ritual</title>
</svelte:head>

<main>
	<h1>Política de Privacidade</h1>
	<p class="last-updated">Última atualização: {lastUpdated}</p>

	<section>
		<h2>1. Introdução</h2>
		<p>
			O Ritual ("nós", "nosso" ou "aplicativo") respeita sua privacidade e está comprometido em proteger seus dados pessoais.
			Esta política de privacidade explica como coletamos, usamos e protegemos suas informações quando você utiliza nosso serviço.
		</p>
	</section>

	<section>
		<h2>2. Dados que Coletamos</h2>
		<p>Coletamos os seguintes tipos de informações:</p>
		<ul>
			<li><strong>Informações da conta Google:</strong> Nome, email e identificador único quando você faz login com Google</li>
			<li><strong>Dados do diário:</strong> Suas entradas diárias, tarefas, metas e hábitos que você cria no aplicativo</li>
			<li><strong>Dados do Google Calendar:</strong> Acesso para criar e gerenciar eventos relacionados às suas tarefas agendadas (apenas quando você autoriza)</li>
		</ul>
	</section>

	<section>
		<h2>3. Como Usamos seus Dados</h2>
		<p>Utilizamos suas informações para:</p>
		<ul>
			<li>Autenticar seu acesso ao aplicativo</li>
			<li>Salvar e sincronizar suas entradas de diário, tarefas, metas e hábitos</li>
			<li>Criar eventos no seu Google Calendar quando você solicita</li>
			<li>Melhorar a experiência do usuário e funcionalidades do aplicativo</li>
		</ul>
	</section>

	<section>
		<h2>4. Compartilhamento de Dados</h2>
		<p>
			Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto:
		</p>
		<ul>
			<li>Com o Google, para autenticação e integração com o Calendar (conforme você autoriza)</li>
			<li>Quando exigido por lei ou ordem judicial</li>
		</ul>
	</section>

	<section>
		<h2>5. Armazenamento e Segurança</h2>
		<p>
			Seus dados são armazenados de forma segura utilizando serviços de infraestrutura em nuvem (Cloudflare).
			Implementamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado,
			alteração, divulgação ou destruição.
		</p>
	</section>

	<section>
		<h2>6. Seus Direitos</h2>
		<p>Você tem o direito de:</p>
		<ul>
			<li>Acessar seus dados pessoais</li>
			<li>Corrigir dados incorretos</li>
			<li>Solicitar a exclusão de seus dados</li>
			<li>Revogar o acesso ao Google Calendar a qualquer momento nas configurações</li>
			<li>Excluir sua conta e todos os dados associados</li>
		</ul>
	</section>

	<section>
		<h2>7. Cookies</h2>
		<p>
			Utilizamos cookies essenciais para manter sua sessão de login ativa.
			Não utilizamos cookies de rastreamento ou publicidade.
		</p>
	</section>

	<section>
		<h2>8. Alterações nesta Política</h2>
		<p>
			Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas
			através do aplicativo ou por email.
		</p>
	</section>

	<section>
		<h2>9. Contato</h2>
		<p>
			Para dúvidas sobre esta política ou sobre seus dados, entre em contato através do email:
			<a href="mailto:contato@oritual.work">contato@oritual.work</a>
		</p>
	</section>

	<div class="back-link">
		<a href="/">Voltar para o início</a>
	</div>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
		color: #e0e0e0;
	}

	h1 {
		color: #88c0d0;
		margin-bottom: 0.5rem;
	}

	.last-updated {
		color: #8899a6;
		font-size: 0.875rem;
		margin-bottom: 2rem;
	}

	section {
		margin-bottom: 2rem;
	}

	h2 {
		color: #e0e0e0;
		font-size: 1.25rem;
		margin-bottom: 0.75rem;
	}

	p {
		line-height: 1.7;
		color: #b8c5d0;
		margin-bottom: 0.75rem;
	}

	ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
		color: #b8c5d0;
	}

	li {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	a {
		color: #88c0d0;
	}

	a:hover {
		text-decoration: underline;
	}

	.back-link {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid #2d4a5e;
	}
</style>
