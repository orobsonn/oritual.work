<script lang="ts">
	import { navigating } from '$app/stores';

	let { children } = $props();
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
		background-color: #0d1b2a;
		color: #e0e0e0;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		line-height: 1.6;
		min-height: 100vh;
	}

	:global(a) {
		color: #88c0d0;
		text-decoration: none;
	}

	:global(a:hover) {
		text-decoration: underline;
	}

	:global(::selection) {
		background: #88c0d0;
		color: #0d1b2a;
	}

	/* Loading overlay */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(13, 27, 42, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #2d4a5e;
		border-top-color: #88c0d0;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
