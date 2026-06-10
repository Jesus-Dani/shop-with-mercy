import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// svelte.config.js handles adapter and alias configuration.
// This file only registers the SvelteKit Vite plugin.
export default defineConfig({
	plugins: [sveltekit()]
});
