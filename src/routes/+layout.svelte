<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

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
</style>
