import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'ritual-theme';
const THEME_COLORS = {
	light: '#f5f7fa',
	dark: '#0d1b2a'
};

function getStoredTheme(): Theme | null {
	if (!browser) return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') {
		return stored;
	}
	return null;
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	const html = document.documentElement;
	const metaThemeColor = document.querySelector('meta[name="theme-color"]');

	html.setAttribute('data-theme', theme);
	if (metaThemeColor) {
		metaThemeColor.setAttribute('content', THEME_COLORS[theme]);
	}
}

function createThemeStore() {
	let theme = $state<Theme>('dark');
	let initialized = $state(false);

	function init() {
		if (!browser || initialized) return;

		// Get stored preference or default to dark
		const stored = getStoredTheme();
		theme = stored ?? 'dark';
		applyTheme(theme);

		initialized = true;
	}

	function setTheme(newTheme: Theme) {
		theme = newTheme;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, newTheme);
			applyTheme(newTheme);
		}
	}

	function toggle() {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	}

	return {
		get theme() {
			return theme;
		},
		init,
		setTheme,
		toggle
	};
}

export const themeStore = createThemeStore();
