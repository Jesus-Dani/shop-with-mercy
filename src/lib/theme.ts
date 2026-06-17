import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

export const themeStore = writable<Theme>('light');

export const theme = {
	init() {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const apply = (dark: boolean) => {
			const t: Theme = dark ? 'dark' : 'light';
			document.documentElement.setAttribute('data-theme', t);
			themeStore.set(t);
		};
		apply(mq.matches);
		mq.addEventListener('change', (e) => apply(e.matches));
	}
};
