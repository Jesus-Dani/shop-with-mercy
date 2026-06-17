<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme';

	let { children }: { children: import('svelte').Snippet } = $props();

	onMount(() => {
		theme.init();
	});
</script>

{@render children()}
