<script lang="ts">
	import { formatNaira } from '$lib/format';
	import { cdnUrl } from '$lib/cloudinary';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let wishlist = $state(data.wishlist as typeof data.wishlist);

	async function remove(wishlistId: string, variantId: string) {
		await fetch('/api/wishlist', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ variant_id: variantId })
		});
		wishlist = wishlist.filter((item) => item.wishlistId !== wishlistId);
	}
</script>

<svelte:head>
	<title>Wishlist — Shop With Mercy</title>
</svelte:head>

<div class="page-container wishlist-page">
	<h1 class="page-title">My Wishlist</h1>

	{#if wishlist.length === 0}
		<div class="empty-state">
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="empty-icon">
				<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
			</svg>
			<p>Your wishlist is empty.</p>
			<a href="/shop" class="btn btn-primary">Browse the shop</a>
		</div>
	{:else}
		<p class="count">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
		<ul class="wishlist-grid" role="list">
			{#each wishlist as item (item.wishlistId)}
				<li class="wishlist-card">
					<a href="/shop/{item.productId}" class="card-image-link">
						{#if item.imagePublicId}
							<img
								src={cdnUrl(item.imagePublicId, { width: 300, height: 360, crop: 'fill' })}
								alt={item.productName}
								class="card-img"
								loading="lazy"
							/>
						{:else}
							<div class="card-img card-img-empty"></div>
						{/if}
						{#if !item.inStock}
							<span class="sold-out-badge">Sold out</span>
						{/if}
					</a>

					<div class="card-body">
						<a href="/shop/{item.productId}" class="card-name">{item.productName}</a>

						<div class="card-meta">
							{#if item.colourHex}
								<span class="colour-dot" style="background:{item.colourHex}"></span>
							{/if}
							<span class="card-variant">{item.colourName} · {item.size}</span>
						</div>

						<div class="card-price">
							{#if item.salePrice && item.salePrice < item.price}
								<span class="price-sale">{formatNaira(item.salePrice)}</span>
								<span class="price-orig">{formatNaira(item.price)}</span>
							{:else}
								<span class="price">{formatNaira(item.price)}</span>
							{/if}
						</div>

						<div class="card-actions">
							<a href="/shop/{item.productId}" class="btn btn-primary btn-sm">
								{item.inStock ? 'Add to cart' : 'View item'}
							</a>
							<button
								type="button"
								class="btn-remove"
								aria-label="Remove from wishlist"
								onclick={() => remove(item.wishlistId, item.variantId)}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M18 6l-12 12" /><path d="M6 6l12 12" />
								</svg>
								Remove
							</button>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.wishlist-page {
		padding-block: var(--space-xl) var(--space-2xl);
	}

	.page-title {
		font-size: var(--text-h1);
		font-weight: 600;
		margin-bottom: var(--space-md);
	}

	.count {
		font-size: var(--text-small);
		color: var(--text-secondary);
		margin-bottom: var(--space-xl);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-2xl) 0;
		text-align: center;
		color: var(--text-secondary);
	}

	.empty-icon { color: var(--border-color); }

	.wishlist-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-lg);
	}

	@media (min-width: 640px) {
		.wishlist-grid { grid-template-columns: repeat(3, 1fr); }
	}

	@media (min-width: 1024px) {
		.wishlist-grid { grid-template-columns: repeat(4, 1fr); }
	}

	.wishlist-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.card-image-link {
		position: relative;
		display: block;
		border-radius: var(--radius-md);
		overflow: hidden;
		aspect-ratio: 3 / 4;
		background: var(--bg-card);
	}

	.card-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.4s ease;
	}

	.card-image-link:hover .card-img { transform: scale(1.04); }

	.card-img-empty { background: var(--bg-card); }

	.sold-out-badge {
		position: absolute;
		bottom: var(--space-sm);
		left: var(--space-sm);
		background: rgba(28, 38, 16, 0.75);
		color: var(--color-cornsilk);
		font-size: var(--text-micro);
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 100px;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.card-name {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
		text-decoration: none;
		line-height: 1.3;
	}

	.card-name:hover { text-decoration: underline; }

	.card-meta {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.colour-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid rgba(0,0,0,0.12);
		flex-shrink: 0;
	}

	.card-variant {
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.card-price {
		display: flex;
		align-items: baseline;
		gap: var(--space-xs);
	}

	.price, .price-sale {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
	}

	.price-sale { color: var(--color-copperwood); }

	.price-orig {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		text-decoration: line-through;
	}

	.card-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-top: var(--space-xs);
		flex-wrap: wrap;
	}

	.btn-sm {
		font-size: var(--text-micro);
		padding: 6px 14px;
	}

	.btn-remove {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: var(--text-micro);
		color: var(--text-secondary);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: color var(--transition-fast);
	}

	.btn-remove:hover { color: var(--color-copperwood); }
</style>
