<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		children
	}: {
		open?: boolean;
		title?: string;
		children: Snippet;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			open = false;
		}
	}
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<div
		class="overlay"
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
		onclick={handleOverlayClick}
	>
		<div class="modal">
			<button
				type="button"
				class="close"
				onclick={() => (open = false)}
				aria-label="Fechar"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"/>
					<line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>

			{#if title}
				<h2 id="modal-title" class="modal-title">{title}</h2>
			{/if}

			{@render children()}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: var(--color-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		z-index: 1000;
		animation: fadeIn 150ms ease-out;
	}

	.modal {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 24px;
		width: min(440px, 100%);
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		animation: slideUp 200ms cubic-bezier(0.25, 1, 0.5, 1);
	}

	.close {
		position: absolute;
		top: 16px;
		right: 16px;
		width: 28px;
		height: 28px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		color: var(--color-text-muted);
		transition: background 150ms, color 150ms;
	}

	.close:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.modal-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		padding-right: 32px;
		color: var(--color-text-primary);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
