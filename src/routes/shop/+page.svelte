<script lang="ts">
	import { goto } from '$app/navigation';
	import ProductCard from '$components/ProductCard.svelte';
	import ProductCardSkeleton from '$components/ProductCardSkeleton.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Build a new /shop URL preserving existing filters and applying overrides.
	// Pass null to remove a param.
	function shopUrl(
		overrides: Partial<{
			category: string | null;
			colour: string | null;
			size: string | null;
			sale: string | null;
			sort: string | null;
			min: string | null;
			max: string | null;
		}>
	): string {
		const f = data.filters;
		const p = new URLSearchParams();
		const category = 'category' in overrides ? overrides.category : f.categoryName;
		const colour = 'colour' in overrides ? overrides.colour : f.colourFilter;
		const size = 'size' in overrides ? overrides.size : f.sizeFilter;
		const sale = 'sale' in overrides ? overrides.sale : f.saleOnly ? '1' : null;
		const sort = 'sort' in overrides ? overrides.sort : f.sort !== 'newest' ? f.sort : null;
		const min =
			'min' in overrides
				? overrides.min
				: f.minPrice !== null
					? String(f.minPrice)
					: null;
		const max =
			'max' in overrides
				? overrides.max
				: f.maxPrice !== null
					? String(f.maxPrice)
					: null;

		if (category) p.set('category', category);
		if (colour) p.set('colour', colour);
		if (size) p.set('size', size);
		if (sale) p.set('sale', sale);
		if (sort) p.set('sort', sort);
		if (min) p.set('min', min);
		if (max) p.set('max', max);

		const qs = p.toString();
		return qs ? `/shop?${qs}` : '/shop';
	}

	function handleSortChange(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		goto(shopUrl({ sort: val === 'newest' ? null : val }), { keepFocus: true });
	}

	const hasActiveFilters = $derived(
		!!(data.filters.categoryName || data.filters.colourFilter || data.filters.sizeFilter || data.filters.saleOnly || data.filters.minPrice || data.filters.maxPrice)
	);

	const SKELETON_COUNT = 8;
</script>

<svelte:head>
	<title>
		{data.filters.categoryName
			? `${data.filters.categoryName[0].toUpperCase()}${data.filters.categoryName.slice(1)} — Shop With Mercy`
			: 'Shop — Shop With Mercy'}
	</title>
	<meta name="description" content="Browse our full collection of casual women's clothing." />
</svelte:head>

<div class="page-container shop-page">
	<!-- Page header -->
	<header class="shop-header">
		<h1 class="shop-title">
			{#if data.filters.categoryName}
				{data.filters.categoryName[0].toUpperCase()}{data.filters.categoryName.slice(1)}
			{:else}
				Shop
			{/if}
		</h1>
		<p class="item-count">
			{data.products.length}
			{data.products.length === 1 ? 'item' : 'items'}
		</p>
	</header>

	<!-- Filters + Sort bar -->
	<section class="filter-bar" aria-label="Filter and sort">
		<div class="filter-scroll">
			<!-- Category chips -->
			<div class="chip-group">
				<a href="/shop" class="chip" class:chip-active={!data.filters.categoryName}>All</a>
				{#each data.categories as cat}
					<a
						href={shopUrl({ category: cat.name.toLowerCase(), size: null })}
						class="chip"
						class:chip-active={data.filters.categoryName === cat.name.toLowerCase()}
					>{cat.name}</a>
				{/each}
			</div>

			{#if data.availableSizes.length > 0}
				<div class="filter-sep" aria-hidden="true"></div>
				<div class="chip-group">
					{#each data.availableSizes as size}
						<a
							href={shopUrl({ size: data.filters.sizeFilter === size ? null : size })}
							class="chip chip-sm"
							class:chip-active={data.filters.sizeFilter === size}
						>{size}</a>
					{/each}
				</div>
			{/if}

			<div class="filter-sep" aria-hidden="true"></div>

			<a
				href={shopUrl({ sale: data.filters.saleOnly ? null : '1' })}
				class="chip chip-sale"
				class:chip-active={data.filters.saleOnly}
			>Sale</a>
		</div>

		<div class="sort-wrap">
			<label class="sort-label" for="sort-select">Sort</label>
			<select
				id="sort-select"
				class="sort-select"
				value={data.filters.sort}
				onchange={handleSortChange}
			>
				<option value="newest">Newest</option>
				<option value="price_asc">Price: Low to High</option>
				<option value="price_desc">Price: High to Low</option>
			</select>
		</div>
	</section>

	<!-- Active filter tags -->
	{#if hasActiveFilters}
		<div class="active-filters" aria-label="Active filters">
			{#if data.filters.sizeFilter}
				<a href={shopUrl({ size: null })} class="filter-tag">
					Size: {data.filters.sizeFilter}
					<span aria-hidden="true"> &times;</span>
				</a>
			{/if}
			{#if data.filters.colourFilter}
				<a href={shopUrl({ colour: null })} class="filter-tag">
					Colour: {data.filters.colourFilter}
					<span aria-hidden="true"> &times;</span>
				</a>
			{/if}
			{#if data.filters.saleOnly}
				<a href={shopUrl({ sale: null })} class="filter-tag filter-tag-sale">
					On sale <span aria-hidden="true">&times;</span>
				</a>
			{/if}
			<a href="/shop" class="filter-tag filter-tag-clear">Clear all</a>
		</div>
	{/if}

	<!-- Product grid -->
	{#if data.products.length === 0}
		<div class="empty-state">
			{#if hasActiveFilters}
				<p>No products match your filters.</p>
				<a href="/shop" class="btn btn-outline">Clear filters</a>
			{:else}
				<p>Products are on their way — check back soon!</p>
				<a
					href="https://wa.me/2349049435149"
					class="btn btn-outline"
					target="_blank"
					rel="noopener noreferrer"
				>Chat on WhatsApp</a>
			{/if}
		</div>
	{:else}
		<ul class="product-grid" role="list">
			{#each data.products as product (product.id)}
				<li><ProductCard {...product} /></li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.shop-page {
		padding-block: var(--space-xl) var(--space-2xl);
	}

	.shop-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.shop-title {
		font-size: var(--text-h1);
	}

	.item-count {
		font-size: var(--text-small);
		color: var(--text-secondary);
		max-width: none;
	}

	/* Filter bar */
	.filter-bar {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
		flex-wrap: wrap;
	}

	.filter-scroll {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		overflow-x: auto;
		flex: 1;
		padding-bottom: 2px;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.filter-scroll::-webkit-scrollbar {
		display: none;
	}

	.chip-group {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		flex-shrink: 0;
	}

	.filter-sep {
		width: 1px;
		height: 20px;
		background: var(--border-color);
		flex-shrink: 0;
		margin-inline: var(--space-xs);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		padding: 6px 14px;
		border-radius: 100px;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		background: var(--bg-card);
		border: 1.5px solid var(--border-color);
		white-space: nowrap;
		text-decoration: none;
		transition: background-color var(--transition-fast), border-color var(--transition-fast),
			color var(--transition-fast);
		flex-shrink: 0;
		min-height: 36px;
	}

	.chip:hover {
		border-color: var(--text-secondary);
		color: var(--text-primary);
	}

	.chip:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.chip-active {
		background: var(--text-primary);
		color: var(--bg-page);
		border-color: var(--text-primary);
	}

	.chip-sm {
		padding: 4px 10px;
		font-size: var(--text-micro);
	}

	.chip-sale {
		color: var(--text-price-sale);
		border-color: var(--text-price-sale);
	}

	.chip-sale.chip-active {
		background: var(--badge-sale-bg);
		color: var(--badge-sale-text);
		border-color: var(--badge-sale-bg);
	}

	.sort-wrap {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-shrink: 0;
	}

	.sort-label {
		font-size: var(--text-small);
		color: var(--text-secondary);
		white-space: nowrap;
		margin: 0;
	}

	.sort-select {
		padding: 6px 12px;
		font: inherit;
		font-size: var(--text-small);
		color: var(--text-primary);
		background: var(--bg-card);
		border: 1.5px solid var(--border-color);
		border-radius: var(--radius-md);
		cursor: pointer;
		min-height: 36px;
		appearance: none;
		padding-right: 28px;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23606c38' stroke-width='2'%3E%3Cpath d='M6 9l6 6l6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 8px center;
	}

	.sort-select:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	/* Active filter tags */
	.active-filters {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		margin-bottom: var(--space-md);
	}

	.filter-tag {
		display: inline-flex;
		align-items: center;
		padding: 4px 10px;
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 100px;
		font-size: var(--text-micro);
		font-weight: 500;
		text-decoration: none;
		color: var(--text-primary);
		transition: background-color var(--transition-fast);
	}

	.filter-tag:hover {
		background: var(--border-color);
	}

	.filter-tag-sale {
		color: var(--text-price-sale);
		border-color: var(--text-price-sale);
	}

	.filter-tag-clear {
		color: var(--color-copperwood);
		border-color: var(--color-copperwood);
	}

	/* Product grid */
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
	}
</style>
