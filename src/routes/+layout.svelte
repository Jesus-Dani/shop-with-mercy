<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.svelte';
	import Nav from '$components/Nav.svelte';
	import Footer from '$components/Footer.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	onMount(() => {
		theme.init();
	});
</script>

<Nav
	cartCount={data.cartCount ?? 0}
	wishlistCount={data.wishlistCount ?? 0}
	user={data.user ?? null}
/>

<main id="main-content" tabindex="-1">
	{@render children()}
</main>

<Footer />
