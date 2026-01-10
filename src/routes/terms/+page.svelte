<script>
	const lastUpdated = '10 de Janeiro de 2025';
</script>

<svelte:head>
	<title>Termos de Uso - Ritual</title>
</svelte:head>

<main>
	<h1>Termos de Uso</h1>
	<p class="last-updated">Última atualização: {lastUpdated}</p>

	<section>
		<h2>1. Aceitação dos Termos</h2>
		<p>
			Ao acessar e usar o Ritual ("aplicativo", "serviço"), você concorda em cumprir estes Termos de Uso.
			Se você não concordar com qualquer parte destes termos, não utilize o serviço.
		</p>
	</section>

	<section>
		<h2>2. Descrição do Serviço</h2>
		<p>
			O Ritual é um aplicativo de produtividade pessoal que permite:
		</p>
		<ul>
			<li>Criar e gerenciar um diário diário com reflexões e gratidões</li>
			<li>Organizar tarefas pessoais e de trabalho</li>
			<li>Acompanhar metas e hábitos</li>
			<li>Agendar tarefas futuras com integração ao Google Calendar</li>
			<li>Compartilhar metas e hábitos com um parceiro(a)</li>
		</ul>
	</section>

	<section>
		<h2>3. Conta de Usuário</h2>
		<p>
			Para usar o Ritual, você precisa fazer login com sua conta Google. Você é responsável por:
		</p>
		<ul>
			<li>Manter a segurança da sua conta Google</li>
			<li>Todas as atividades realizadas através da sua conta</li>
			<li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
		</ul>
	</section>

	<section>
		<h2>4. Uso Aceitável</h2>
		<p>Você concorda em não:</p>
		<ul>
			<li>Usar o serviço para fins ilegais ou não autorizados</li>
			<li>Tentar acessar dados de outros usuários</li>
			<li>Interferir ou interromper o funcionamento do serviço</li>
			<li>Fazer engenharia reversa ou tentar extrair o código-fonte</li>
			<li>Usar bots, scripts ou outros meios automatizados sem autorização</li>
		</ul>
	</section>

	<section>
		<h2>5. Propriedade Intelectual</h2>
		<p>
			O Ritual e todo seu conteúdo, recursos e funcionalidades são de propriedade exclusiva dos desenvolvedores
			e são protegidos por leis de direitos autorais e propriedade intelectual.
		</p>
		<p>
			Seus dados pessoais (entradas de diário, tarefas, etc.) permanecem de sua propriedade.
		</p>
	</section>

	<section>
		<h2>6. Integrações com Terceiros</h2>
		<p>
			O Ritual integra-se com serviços do Google (Login e Calendar). O uso dessas integrações está sujeito
			aos termos de serviço do Google. Não nos responsabilizamos por mudanças ou interrupções nos serviços do Google.
		</p>
	</section>

	<section>
		<h2>7. Disponibilidade do Serviço</h2>
		<p>
			Nos esforçamos para manter o serviço disponível 24/7, mas não garantimos disponibilidade ininterrupta.
			O serviço pode ser temporariamente indisponível para manutenção ou por fatores fora do nosso controle.
		</p>
	</section>

	<section>
		<h2>8. Limitação de Responsabilidade</h2>
		<p>
			O Ritual é fornecido "como está", sem garantias de qualquer tipo. Não nos responsabilizamos por:
		</p>
		<ul>
			<li>Perda de dados devido a falhas técnicas</li>
			<li>Danos indiretos, incidentais ou consequenciais</li>
			<li>Interrupções no serviço</li>
		</ul>
		<p>
			Recomendamos que você mantenha backups de informações importantes.
		</p>
	</section>

	<section>
		<h2>9. Modificações nos Termos</h2>
		<p>
			Reservamo-nos o direito de modificar estes termos a qualquer momento.
			Mudanças significativas serão comunicadas através do aplicativo.
			O uso continuado após alterações constitui aceitação dos novos termos.
		</p>
	</section>

	<section>
		<h2>10. Encerramento</h2>
		<p>
			Podemos suspender ou encerrar seu acesso ao serviço a qualquer momento, por qualquer motivo,
			incluindo violação destes termos. Você também pode encerrar sua conta a qualquer momento
			através das configurações.
		</p>
	</section>

	<section>
		<h2>11. Lei Aplicável</h2>
		<p>
			Estes termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais
			da comarca de São Paulo, SP.
		</p>
	</section>

	<section>
		<h2>12. Contato</h2>
		<p>
			Para dúvidas sobre estes termos, entre em contato:
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
