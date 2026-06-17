<script lang="ts">
	import Nav from '$components/Nav.svelte';
	import Footer from '$components/Footer.svelte';
	import CartDrawer from '$components/CartDrawer.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<Nav
	wishlistCount={data.wishlistCount ?? 0}
	user={data.user ?? null}
/>

<CartDrawer />

<main id="main-content" tabindex="-1">
	{@render children()}
</main>

<Footer />
