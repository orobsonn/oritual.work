<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let step = $state(form?.step ?? 1);
	let affirmation = $state('');
	let habits = $state(['', '', '']);
	let goals = $state([{ title: '', target: 12 }]);
	let hasPartner = $state<boolean | null>(null);

	function addHabit() {
		habits = [...habits, ''];
	}

	function addGoal() {
		goals = [...goals, { title: '', target: 1 }];
	}
</script>

<svelte:head>
	<title>Bem-vindo ao Ontrack</title>
</svelte:head>

<main>
	<div class="progress-dots">
		{#each [1, 2, 3, 4] as s}
			<span class="dot" class:active={step >= s}></span>
		{/each}
	</div>

	{#if step === 1}
		<!-- Step 1: Afirmação -->
		<section class="step">
			<h1>Sua afirmação diária</h1>
			<p class="subtitle">
				Uma frase que você verá toda manhã como parte do seu ritual.
			</p>

			<form method="POST" action="?/saveAffirmation" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						step = 2;
					}
				};
			}}>
				<textarea
					name="affirmation"
					placeholder="Ex: Eu sou capaz de alcançar meus objetivos. Cada dia é uma nova oportunidade."
					bind:value={affirmation}
					rows="3"
				></textarea>

				<div class="actions">
					<button type="submit" class="primary">Continuar</button>
				</div>
			</form>
		</section>

	{:else if step === 2}
		<!-- Step 2: Hábitos -->
		<section class="step">
			<h1>Seus hábitos</h1>
			<p class="subtitle">
				Quais hábitos você quer cultivar? Começaremos com 3x por semana.
			</p>

			<form method="POST" action="?/saveHabits" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						step = 3;
					}
				};
			}}>
				{#each habits as habit, i}
					<input
						type="text"
						name="habits"
						placeholder="Ex: Meditar, Exercitar, Ler..."
						bind:value={habits[i]}
					/>
				{/each}

				<button type="button" class="add-more" onclick={addHabit}>
					+ Adicionar outro hábito
				</button>

				<div class="actions">
					<button type="submit" class="primary">Continuar</button>
				</div>
			</form>
		</section>

	{:else if step === 3}
		<!-- Step 3: Metas -->
		<section class="step">
			<h1>Suas metas</h1>
			<p class="subtitle">
				O que você quer conquistar? Defina metas mensuráveis.
			</p>

			<form method="POST" action="?/saveGoals" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						step = 4;
					}
				};
			}}>
				{#each goals as goal, i}
					<div class="goal-row">
						<input
							type="text"
							name="goals"
							placeholder="Ex: Ler livros"
							bind:value={goals[i].title}
						/>
						<input
							type="number"
							name="targets"
							min="1"
							bind:value={goals[i].target}
						/>
					</div>
				{/each}

				<button type="button" class="add-more" onclick={addGoal}>
					+ Adicionar outra meta
				</button>

				<div class="actions">
					<button type="submit" class="primary">Continuar</button>
				</div>
			</form>
		</section>

	{:else if step === 4}
		<!-- Step 4: Casal -->
		<section class="step">
			<h1>Metas em casal</h1>
			<p class="subtitle">
				Você pode criar metas e hábitos compartilhados com seu parceiro(a).
			</p>

			{#if hasPartner === null}
				<div class="partner-question">
					<p>Você tem um parceiro(a) para compartilhar metas?</p>
					<div class="partner-options">
						<button class="option" onclick={() => hasPartner = true}>
							Sim, tenho
						</button>
						<button class="option" onclick={() => hasPartner = false}>
							Não / Prefiro não
						</button>
					</div>
				</div>

			{:else if hasPartner}
				<div class="premium-offer">
					<div class="offer-badge">Oferta de boas-vindas</div>
					<h2>Desbloqueie o modo Casal</h2>
					<p>Crie metas e hábitos compartilhados com quem você ama.</p>

					<div class="pricing">
						<span class="old-price">R$ 47,90</span>
						<span class="new-price">R$ 27,90</span>
						<span class="discount">-42%</span>
					</div>

					<p class="once">Pagamento único. Sem mensalidade.</p>

					<form method="POST" action="?/finish" use:enhance>
						<input type="hidden" name="hasPartner" value="true" />
						<input type="hidden" name="wantsPremium" value="true" />
						<button type="submit" class="primary premium-btn">
							Quero desbloquear
						</button>
					</form>

					<form method="POST" action="?/finish" use:enhance>
						<input type="hidden" name="hasPartner" value="true" />
						<input type="hidden" name="wantsPremium" value="false" />
						<button type="submit" class="skip-link">
							Talvez depois
						</button>
					</form>
				</div>

			{:else}
				<form method="POST" action="?/finish" use:enhance>
					<input type="hidden" name="hasPartner" value="false" />
					<input type="hidden" name="wantsPremium" value="false" />
					<button type="submit" class="primary">
						Começar a usar o Ontrack
					</button>
				</form>
			{/if}
		</section>
	{/if}

	<form method="POST" action="?/skip" use:enhance class="skip-form">
		<button type="submit" class="skip">Pular configuração</button>
	</form>
</main>

<style>
	main {
		max-width: 500px;
		margin: 0 auto;
		padding: 2rem 1rem;
		font-family: system-ui, -apple-system, sans-serif;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.progress-dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #e0e0e0;
		transition: background 0.3s;
	}

	.dot.active {
		background: #333;
	}

	.step {
		flex: 1;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem 0;
		text-align: center;
	}

	.subtitle {
		color: #666;
		text-align: center;
		margin: 0 0 2rem 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	textarea,
	input[type='text'] {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		box-sizing: border-box;
	}

	textarea {
		resize: vertical;
		min-height: 100px;
	}

	input[type='number'] {
		width: 80px;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		text-align: center;
	}

	.goal-row {
		display: flex;
		gap: 0.5rem;
	}

	.goal-row input[type='text'] {
		flex: 1;
	}

	.add-more {
		background: none;
		border: none;
		color: #666;
		cursor: pointer;
		font-size: 0.875rem;
		padding: 0.5rem;
	}

	.add-more:hover {
		color: #333;
	}

	.actions {
		margin-top: 1rem;
	}

	button.primary {
		width: 100%;
		padding: 1rem;
		background: #333;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
	}

	button.primary:hover {
		background: #444;
	}

	/* Partner question */
	.partner-question {
		text-align: center;
	}

	.partner-question p {
		margin-bottom: 1rem;
	}

	.partner-options {
		display: flex;
		gap: 1rem;
	}

	.option {
		flex: 1;
		padding: 1rem;
		background: #f9f9f9;
		border: 1px solid #eee;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
	}

	.option:hover {
		background: #f0f0f0;
	}

	/* Premium offer */
	.premium-offer {
		text-align: center;
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		padding: 2rem;
		border-radius: 12px;
		margin-top: 1rem;
	}

	.offer-badge {
		display: inline-block;
		background: #333;
		color: #fff;
		font-size: 0.75rem;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		margin-bottom: 1rem;
	}

	.premium-offer h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
	}

	.premium-offer > p {
		color: #666;
		margin: 0 0 1.5rem 0;
	}

	.pricing {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.old-price {
		text-decoration: line-through;
		color: #999;
		font-size: 1rem;
	}

	.new-price {
		font-size: 2rem;
		font-weight: bold;
		color: #333;
	}

	.discount {
		background: #22c55e;
		color: #fff;
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
	}

	.once {
		font-size: 0.875rem;
		color: #666;
		margin-bottom: 1.5rem;
	}

	.premium-btn {
		background: #333 !important;
	}

	.skip-link {
		background: none;
		border: none;
		color: #666;
		cursor: pointer;
		font-size: 0.875rem;
		margin-top: 1rem;
		width: 100%;
	}

	/* Skip form */
	.skip-form {
		margin-top: auto;
		padding-top: 2rem;
	}

	.skip {
		background: none;
		border: none;
		color: #999;
		cursor: pointer;
		font-size: 0.875rem;
		width: 100%;
	}

	.skip:hover {
		color: #666;
	}
</style>
