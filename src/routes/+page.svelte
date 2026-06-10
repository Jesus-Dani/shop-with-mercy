<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Shop With Mercy — Casual Women's Clothing</title>
</svelte:head>

<section class="hero">
	<div class="hero-inner page-container">
		<p class="hero-eyebrow">Welcome to Fashion Paradise</p>
		<h1 class="hero-heading">Shop With Mercy</h1>
		<p class="hero-sub">Casual women's clothing for campus and beyond.</p>
		<a href="/category/tops" class="btn btn-primary hero-cta">Shop Now</a>
	</div>
</section>

{#if data.dbStatus}
	<p class="sr-only" aria-live="polite">Database connected: {data.dbStatus}</p>
{/if}

<style>
	.hero {
		min-height: 60dvh;
		display: flex;
		align-items: center;
		background-color: var(--bg-card);
		padding-block: var(--space-2xl);
	}

	.hero-inner {
		max-width: 640px;
	}

	.hero-eyebrow {
		font-size: var(--text-small);
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary);
		margin-bottom: var(--space-md);
	}

	.hero-heading {
		font-size: var(--text-display);
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: var(--space-md);
		line-height: var(--leading-tight);
	}

	.hero-sub {
		font-size: var(--text-body);
		color: var(--text-secondary);
		margin-bottom: var(--space-xl);
		max-width: 40ch;
	}

	.hero-cta {
		font-size: var(--text-body);
	}
</style>
