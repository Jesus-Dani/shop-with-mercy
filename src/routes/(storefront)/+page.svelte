<script lang="ts">
	import ProductCard from '$components/ProductCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Shop With Mercy — Casual Women's Clothing</title>
	<meta
		name="description"
		content="Shop With Mercy — casual women's clothing for everyday life. Based in Nigeria."
	/>
</svelte:head>

<!-- Hero – editorial split -->
<section class="hero" aria-label="Shop With Mercy">
	<div class="hero-panel">
		<img
			src="/images/skirt.jpeg"
			alt=""
			aria-hidden="true"
			class="hero-img"
			loading="eager"
			fetchpriority="high"
			width="800"
			height="1000"
		/>
	</div>
	<div class="hero-panel">
		<img
			src="/images/top.jpeg"
			alt=""
			aria-hidden="true"
			class="hero-img"
			loading="eager"
			width="800"
			height="1000"
		/>
	</div>
	<div class="hero-overlay">
		<p class="hero-wordmark">Shop With Mercy</p>
		<p class="hero-sub">Casual women's clothing for everyday life.</p>
		<a href="/shop" class="btn btn-primary">Shop the Collection</a>
	</div>
</section>

<!-- Category chips -->
{#if data.categories.length > 0}
	<nav class="category-nav" aria-label="Shop by category">
		<div class="page-container">
			<ul class="category-row" role="list">
				<li><a href="/shop" class="category-chip">All</a></li>
				{#each data.categories as cat}
					<li>
						<a href="/shop?category={cat.name.toLowerCase()}" class="category-chip">{cat.name}</a>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
{/if}

<!-- Catalogue -->
<section class="catalogue-section" aria-label="Latest pieces">
	<div class="page-container">
		<div class="section-header">
			<h2 class="section-title">Latest Pieces</h2>
			<a href="/shop" class="see-all">View all &rarr;</a>
		</div>

		{#if data.featuredProducts.length === 0}
			<div class="empty-state">
				<p>Products are on their way — check back soon!</p>
				<a
					href="https://wa.me/2349049435149"
					class="btn btn-outline"
					target="_blank"
					rel="noopener noreferrer"
				>Chat on WhatsApp</a>
			</div>
		{:else}
			<ul class="masonry-grid" role="list">
				{#each data.featuredProducts as product (product.id)}
					<li class="masonry-item">
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
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
						<path d="M9 12l2 2l4 -4" />
					</svg>
				</span>
				<span>Secure checkout via Paystack</span>
			</li>
			<li class="usp-item">
				<span class="usp-icon" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
						<path d="M11 12l1 1l2 -2" />
					</svg>
				</span>
				<span>WhatsApp support</span>
			</li>
			<li class="usp-item">
				<span class="usp-icon" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="7" width="18" height="13" rx="2" />
						<path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
					</svg>
				</span>
				<span>Delivery across Nigeria</span>
			</li>
		</ul>
	</div>
</section>

<style>
	/* ── Hero ─────────────────────────────────────────────────── */
	.hero {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 85dvh;
	}

	.hero-panel {
		position: relative;
		overflow: hidden;
		flex: 1;
		min-height: 85dvh;
		background: var(--color-black-forest);
	}

	/* Single image on mobile — cleaner focus */
	.hero-panel:last-of-type {
		display: none;
	}

	@media (min-width: 768px) {
		.hero {
			flex-direction: row;
			height: 88dvh;
			min-height: unset;
			max-height: 880px;
		}

		.hero-panel {
			min-height: unset;
		}

		.hero-panel:last-of-type {
			display: block;
		}
	}

	.hero-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
		display: block;
		transition: transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.hero-panel:hover .hero-img {
		transform: scale(1.05);
	}

	/* Overlay centered across the full hero width */
	.hero-overlay {
		position: absolute;
		inset: 0;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: var(--space-lg);
		padding: var(--space-2xl) var(--page-gutter-mobile);
		background: rgba(28, 38, 16, 0.40);
		pointer-events: none;
	}

	.hero-overlay > * {
		pointer-events: auto;
	}

	.hero-wordmark {
		font-family: var(--font-display);
		font-size: clamp(22px, 4.5vw, 52px);
		font-weight: 400;
		color: var(--color-cornsilk);
		line-height: 1.1;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		max-width: none;
		margin: 0;
	}

	.hero-sub {
		font-size: var(--text-body);
		color: rgba(254, 250, 224, 0.82);
		line-height: var(--leading-normal);
		max-width: 34ch;
		margin: 0;
	}

	/* ── Category nav ─────────────────────────────────────────── */
	.category-nav {
		padding-block: var(--space-lg);
		border-bottom: 1px solid var(--border-color);
	}

	.category-row {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.category-chip {
		display: inline-flex;
		align-items: center;
		padding: 7px 18px;
		border-radius: 100px;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-primary);
		background: var(--bg-card);
		border: 1.5px solid var(--border-color);
		text-decoration: none;
		min-height: 40px;
		transition: background-color 150ms, border-color 150ms, color 150ms;
	}

	.category-chip:hover {
		background: var(--text-primary);
		color: var(--bg-page);
		border-color: var(--text-primary);
	}

	/* ── Catalogue section ────────────────────────────────────── */
	.catalogue-section {
		padding-block: var(--space-xl) var(--space-2xl);
	}

	.section-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: var(--space-lg);
	}

	.section-title {
		font-size: var(--text-h2);
		font-weight: 600;
		color: var(--text-primary);
	}

	.see-all {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 150ms;
	}

	.see-all:hover {
		color: var(--color-copperwood);
	}

	/* Pinterest masonry via CSS columns */
	.masonry-grid {
		columns: 2;
		column-gap: 10px;
	}

	@media (min-width: 640px) {
		.masonry-grid { columns: 3; column-gap: 12px; }
	}

	@media (min-width: 1024px) {
		.masonry-grid { columns: 4; column-gap: 14px; }
	}

	.masonry-item {
		break-inside: avoid;
		display: inline-block;
		width: 100%;
		margin-bottom: 10px;
	}

	@media (min-width: 640px) {
		.masonry-item { margin-bottom: 12px; }
	}

	@media (min-width: 1024px) {
		.masonry-item { margin-bottom: 14px; }
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
	}

	/* ── USP strip ────────────────────────────────────────────── */
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
		.usp-list { grid-template-columns: repeat(3, 1fr); }
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
