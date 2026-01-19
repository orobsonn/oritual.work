import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ritual-theme';
const THEME_COLORS = {
	light: '#f5f7fa',
	dark: '#0d1b2a'
};

function getSystemTheme(): 'light' | 'dark' {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
	if (!browser) return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}
	return null;
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	const html = document.documentElement;
	const metaThemeColor = document.querySelector('meta[name="theme-color"]');

	if (theme === 'system') {
		html.removeAttribute('data-theme');
		const systemTheme = getSystemTheme();
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', THEME_COLORS[systemTheme]);
		}
	} else {
		html.setAttribute('data-theme', theme);
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', THEME_COLORS[theme]);
		}
	}
}

function createThemeStore() {
	let theme = $state<Theme>('dark');
	let initialized = $state(false);

	// Computed: resolved theme (what's actually displayed)
	const resolvedTheme = $derived(
		theme === 'system' ? getSystemTheme() : theme
	);

	function init() {
		if (!browser || initialized) return;

		// Get stored preference or default to system
		const stored = getStoredTheme();
		theme = stored ?? 'system';
		applyTheme(theme);

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			if (theme === 'system') {
				applyTheme('system');
			}
		});

		initialized = true;
	}

	function setTheme(newTheme: Theme) {
		theme = newTheme;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, newTheme);
			applyTheme(newTheme);
		}
	}

	function cycle() {
		const order: Theme[] = ['light', 'dark', 'system'];
		const currentIndex = order.indexOf(theme);
		const nextIndex = (currentIndex + 1) % order.length;
		setTheme(order[nextIndex]);
	}

	return {
		get theme() {
			return theme;
		},
		get resolvedTheme() {
			return resolvedTheme;
		},
		init,
		setTheme,
		cycle
	};
}

export const themeStore = createThemeStore();
