<script lang="ts">
	import ProductCard from '$components/ProductCard.svelte';
	import ProductCardSkeleton from '$components/ProductCardSkeleton.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Shop With Mercy — Casual Women's Clothing</title>
	<meta
		name="description"
		content="Shop With Mercy — casual women's clothing for campus life and beyond. Based in Nigeria."
	/>
</svelte:head>

<!-- Hero: full-width split two-panel -->
<section class="hero" aria-label="Welcome">
	<div class="hero-left">
		<div class="hero-content">
			<p class="hero-eyebrow">New arrivals every week</p>
			<h1 class="hero-heading">Dress with<br />confidence.</h1>
			<p class="hero-sub">
				Casual women's clothing for campus life and beyond. Delivered across Nigeria.
			</p>
			<div class="hero-actions">
				<a href="/shop" class="btn btn-primary">Shop Now</a>
				<a href="/shop?sale=1" class="btn btn-ghost-light">Sale Items</a>
			</div>
		</div>
	</div>
	<div class="hero-right" aria-hidden="true">
		<div class="hero-art">
			<div class="hero-art-circle hero-art-circle-1"></div>
			<div class="hero-art-circle hero-art-circle-2"></div>
			<div class="hero-art-text">SWM</div>
		</div>
	</div>
</section>

<!-- Category quick-links -->
{#if data.categories.length > 0}
	<section class="categories-section" aria-labelledby="categories-heading">
		<div class="page-container">
			<h2 id="categories-heading" class="section-title">Shop by category</h2>
			<ul class="category-row" role="list">
				<li>
					<a href="/shop" class="category-chip">All</a>
				</li>
				{#each data.categories as cat}
					<li>
						<a href="/shop?category={cat.name.toLowerCase()}" class="category-chip">{cat.name}</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<!-- Featured / New Arrivals -->
<section class="featured-section" aria-labelledby="featured-heading">
	<div class="page-container">
		<div class="section-header">
			<h2 id="featured-heading" class="section-title">New Arrivals</h2>
			<a href="/shop" class="see-all">See all &rarr;</a>
		</div>

		{#if data.featuredProducts.length === 0}
			<div class="empty-state">
				<p>Products are on their way — check back soon!</p>
				<a
					href="https://wa.me/2349049435149"
					class="btn btn-outline"
					target="_blank"
					rel="noopener noreferrer"
				>
					Chat on WhatsApp
				</a>
			</div>
		{:else}
			<ul class="product-grid" role="list">
				{#each data.featuredProducts as product (product.id)}
					<li>
						<ProductCard {...product} />
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<!-- USP strip -->
<section class="usp-strip" aria-label="Why shop with us">
	<div class="page-container">
		<ul class="usp-list" role="list">
			<li class="usp-item">
				<span class="usp-icon" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
						<path d="M9 12l2 2l4 -4" />
					</svg>
				</span>
				<span>Secure checkout via Paystack</span>
			</li>
			<li class="usp-item">
				<span class="usp-icon" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
						<path d="M19 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
						<path d="M5 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
						<path d="M5 7v8a2 2 0 0 0 2 2h8" />
						<path d="M17 5h-8a2 2 0 0 0 -2 2v2" />
					</svg>
				</span>
				<span>Campus pickup at RUN</span>
			</li>
			<li class="usp-item">
				<span class="usp-icon" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
						<path d="M11 12l1 1l2 -2" />
					</svg>
				</span>
				<span>WhatsApp support</span>
			</li>
			<li class="usp-item">
				<span class="usp-icon" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 3l1.45 4.05l4.3 .35l-3.3 2.85l1.05 4.25l-3.5 -2.15l-3.5 2.15l1.05 -4.25l-3.3 -2.85l4.3 -.35z" />
						<path d="M6.818 20.04l-.318 .96" />
						<path d="M17.5 21l-.5 -1" />
						<path d="M3 11h1m16 0h1" />
					</svg>
				</span>
				<span>New styles weekly</span>
			</li>
		</ul>
	</div>
</section>

<style>
	/* ── Hero ──────────────────────────────────────────────── */
	.hero {
		display: grid;
		grid-template-columns: 1fr;
		min-height: 65dvh;
	}

	@media (min-width: 768px) {
		.hero {
			grid-template-columns: 1fr 1fr;
			min-height: 70dvh;
		}
	}

	.hero-left {
		background-color: var(--color-black-forest);
		display: flex;
		align-items: center;
		padding: var(--space-2xl) var(--page-gutter-mobile);
	}

	@media (min-width: 768px) {
		.hero-left {
			justify-content: flex-end;
			padding: var(--space-2xl) var(--space-2xl);
		}
	}

	.hero-content {
		max-width: 460px;
		width: 100%;
	}

	.hero-eyebrow {
		font-size: var(--text-small);
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-sunlit-clay);
		margin-bottom: var(--space-md);
		max-width: none;
	}

	.hero-heading {
		font-size: var(--text-display);
		font-weight: 700;
		color: var(--color-cornsilk);
		line-height: 1.15;
		margin-bottom: var(--space-md);
	}

	.hero-sub {
		font-size: var(--text-body);
		color: rgba(254, 250, 224, 0.75);
		margin-bottom: var(--space-xl);
		line-height: var(--leading-normal);
	}

	.hero-actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.btn-ghost-light {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 12px 24px;
		border-radius: var(--radius-md);
		font-size: var(--text-small);
		font-weight: 500;
		line-height: 1;
		min-height: 44px;
		cursor: pointer;
		white-space: nowrap;
		background: transparent;
		color: var(--color-cornsilk);
		border: 1.5px solid rgba(254, 250, 224, 0.4);
		text-decoration: none;
		transition: border-color var(--transition-fast), background-color var(--transition-fast);
	}

	.btn-ghost-light:hover {
		border-color: var(--color-cornsilk);
		background: rgba(254, 250, 224, 0.08);
	}

	.btn-ghost-light:focus-visible {
		outline: 2px solid var(--color-sunlit-clay);
		outline-offset: 2px;
	}

	/* Hero right: decorative panel */
	.hero-right {
		display: none;
		background-color: var(--color-olive-leaf);
		position: relative;
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.hero-right {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.hero-art {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-art-circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(254, 250, 224, 0.08);
	}

	.hero-art-circle-1 {
		width: 70%;
		aspect-ratio: 1;
		top: -10%;
		right: -10%;
	}

	.hero-art-circle-2 {
		width: 50%;
		aspect-ratio: 1;
		bottom: -15%;
		left: -5%;
		background: rgba(188, 108, 37, 0.15);
	}

	.hero-art-text {
		font-size: clamp(80px, 12vw, 140px);
		font-weight: 700;
		color: rgba(254, 250, 224, 0.12);
		letter-spacing: -0.02em;
		user-select: none;
		z-index: 1;
	}

	/* ── Categories section ────────────────────────────────── */
	.categories-section {
		padding-block: var(--space-xl);
		border-bottom: 1px solid var(--border-color);
	}

	.section-title {
		font-size: var(--text-h2);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--space-lg);
	}

	.section-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: var(--space-lg);
	}

	.see-all {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.see-all:hover {
		color: var(--color-copperwood);
	}

	.category-row {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.category-chip {
		display: inline-flex;
		align-items: center;
		padding: 8px 20px;
		border-radius: 100px;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-primary);
		background: var(--bg-card);
		border: 1.5px solid var(--border-color);
		text-decoration: none;
		transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
		min-height: 44px;
	}

	.category-chip:hover {
		background: var(--text-primary);
		color: var(--bg-page);
		border-color: var(--text-primary);
	}

	.category-chip:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	/* ── Featured section ──────────────────────────────────── */
	.featured-section {
		padding-block: var(--space-xl) var(--space-2xl);
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.product-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-lg);
		}
	}

	@media (min-width: 1280px) {
		.product-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.empty-state {
		padding: var(--space-2xl) 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-lg);
	}

	.empty-state p {
		color: var(--text-secondary);
		font-size: var(--text-body);
	}

	/* ── USP strip ─────────────────────────────────────────── */
	.usp-strip {
		background: var(--bg-card);
		padding-block: var(--space-xl);
		border-top: 1px solid var(--border-color);
	}

	.usp-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.usp-list {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.usp-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-small);
		color: var(--text-secondary);
	}

	.usp-icon {
		color: var(--color-olive-leaf);
		flex-shrink: 0;
	}
</style>
