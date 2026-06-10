const STORAGE_KEY = 'swm-theme';

type Theme = 'light' | 'dark';

function createTheme() {
	let current = $state<Theme>('light');

	function init() {
		if (typeof window === 'undefined') return;
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		if (stored === 'light' || stored === 'dark') {
			current = stored;
		} else {
			current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		applyTheme(current);
	}

	function applyTheme(t: Theme) {
		document.documentElement.setAttribute('data-theme', t);
		localStorage.setItem(STORAGE_KEY, t);
	}

	function toggle() {
		current = current === 'light' ? 'dark' : 'light';
		applyTheme(current);
	}

	function setTheme(t: Theme) {
		current = t;
		applyTheme(t);
	}

	return {
		get current() { return current; },
		get isDark() { return current === 'dark'; },
		init,
		toggle,
		setTheme
	};
}

export const theme = createTheme();
