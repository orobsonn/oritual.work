<script lang="ts">
	import { themeStore } from '$lib/stores/theme.svelte';
</script>

<button
	type="button"
	class="theme-toggle"
	onclick={() => themeStore.toggle()}
	title={themeStore.theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
	aria-label={themeStore.theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
>
	{#if themeStore.theme === 'dark'}
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="5"/>
			<line x1="12" y1="1" x2="12" y2="3"/>
			<line x1="12" y1="21" x2="12" y2="23"/>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
			<line x1="1" y1="12" x2="3" y2="12"/>
			<line x1="21" y1="12" x2="23" y2="12"/>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
		</svg>
	{:else}
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		width: 32px;
		height: 32px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 150ms, color 150ms;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.theme-toggle:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
