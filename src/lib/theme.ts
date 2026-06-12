import { writable } from 'svelte/store';

const STORAGE_KEY = 'swm-theme';
type Theme = 'light' | 'dark';

// Plain Svelte writable store — no runes, no Svelte client internals, fully SSR-safe.
// theme.svelte.ts used $state at module level, which can pull in Svelte's browser
// internals when bundled by adapter-netlify, crashing the Lambda on cold start.
export const themeStore = writable<Theme>('light');

function applyTheme(t: Theme) {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute('data-theme', t);
	localStorage.setItem(STORAGE_KEY, t);
}

export const theme = {
	init() {
		if (typeof window === 'undefined') return;
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		const initial: Theme =
			stored === 'light' || stored === 'dark'
				? stored
				: window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
		themeStore.set(initial);
		applyTheme(initial);
	},
	toggle() {
		themeStore.update((t) => {
			const next: Theme = t === 'light' ? 'dark' : 'light';
			applyTheme(next);
			return next;
		});
	},
	setTheme(t: Theme) {
		themeStore.set(t);
		applyTheme(t);
	}
};
