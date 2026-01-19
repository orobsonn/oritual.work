<script lang="ts">
	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';
	import '$lib/styles/theme.css';
	import { themeStore } from '$lib/stores/theme.svelte';

	let { children } = $props();

	onMount(() => {
		themeStore.init();
	});
</script>

{#if $navigating}
	<div class="loading-overlay">
		<div class="spinner"></div>
	</div>
{/if}

{@render children()}

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		background-color: var(--color-bg-primary);
		color: var(--color-text-primary);
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		line-height: 1.6;
		min-height: 100vh;
		transition: background-color 150ms, color 150ms;
	}

	:global(a) {
		color: var(--color-accent);
		text-decoration: none;
	}

	:global(a:hover) {
		text-decoration: underline;
	}

	:global(::selection) {
		background: var(--color-selection-bg);
		color: var(--color-selection-text);
	}

	/* Loading overlay */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--color-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
