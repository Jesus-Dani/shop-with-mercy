<script lang="ts">
	import { cdnUrl, cdnSrcset, CARD_SIZES } from '$lib/cloudinary';
	import { formatNaira } from '$lib/format';

	interface Props {
		id: string;
		name: string;
		price: number;
		salePrice?: number | null;
		coverPublicId?: string | null;
		totalStock?: number;
	}

	let {
		id,
		name,
		price,
		salePrice = null,
		coverPublicId = null,
		totalStock = 0
	}: Props = $props();

	const isSoldOut = $derived(totalStock <= 0);
	const isOnSale = $derived(salePrice !== null && salePrice < price);


</script>

<article class="card">
	<div class="card-image-wrap">
		<a href="/shop/{id}" tabindex="-1" aria-hidden="true" class="card-img-link">
			{#if coverPublicId}
				<img
					src={cdnUrl(coverPublicId, { width: 400, aspectRatio: '4:5', crop: 'fill' })}
					srcset={cdnSrcset(coverPublicId, [320, 480, 640, 800], {
						aspectRatio: '4:5',
						crop: 'fill'
					})}
					sizes={CARD_SIZES}
					alt={name}
					loading="lazy"
					width="400"
					height="500"
					class="card-img"
				/>
			{:else}
				<div class="card-img-placeholder" aria-hidden="true"></div>
			{/if}
		</a>

		{#if isSoldOut}
			<span class="badge badge-sold-out card-badge">Sold out</span>
		{:else if isOnSale}
			<span class="badge badge-sale card-badge">Sale</span>
		{/if}

		<a
			href="/shop/{id}"
			class="wishlist-btn"
			aria-label="Save {name} to wishlist"
			tabindex="0"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
			</svg>
		</a>
	</div>

	<div class="card-body">
		<a href="/shop/{id}" class="card-name">{name}</a>
		<div class="card-price">
			{#if isOnSale}
				<span class="price-sale">{formatNaira(salePrice!)}</span>
				<span class="price-original">{formatNaira(price)}</span>
			{:else}
				<span class="price">{formatNaira(price)}</span>
			{/if}
		</div>
	</div>
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--bg-card);
	}

	.card-img-link {
		display: block;
		overflow: hidden;
	}

	.card-image-wrap {
		position: relative;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		background: var(--bg-card);
	}

	.card-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.card:hover .card-img {
		transform: scale(1.07);
	}

	.card-img-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(
			135deg,
			var(--color-olive-leaf) 0%,
			var(--color-black-forest) 60%,
			var(--color-copperwood) 100%
		);
		opacity: 0.25;
	}

	.card-badge {
		position: absolute;
		top: var(--space-sm);
		left: var(--space-sm);
		pointer-events: none;
	}

	.wishlist-btn {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: rgba(254, 250, 224, 0.88);
		color: var(--color-black-forest);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color var(--transition-fast), color var(--transition-fast), opacity var(--transition-fast);
		opacity: 1;
		border: none;
		cursor: pointer;
	}

	@media (min-width: 768px) {
		.wishlist-btn {
			opacity: 0;
		}
		.card:hover .wishlist-btn,
		.wishlist-btn:focus-visible {
			opacity: 1;
		}
	}

	.wishlist-btn:hover {
		background: var(--color-cornsilk);
		color: var(--color-copperwood);
	}

	.wishlist-btn:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.card-body {
		padding: var(--space-sm) var(--space-sm) var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.card-name {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-primary);
		line-height: var(--leading-tight);
		text-decoration: none;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-name:hover {
		color: var(--color-copperwood);
	}

	.card-name:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
		border-radius: 2px;
	}

	.card-price {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.price,
	.price-sale {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
	}

	.price-sale {
		color: var(--text-price-sale);
	}

	.price-original {
		font-size: var(--text-micro);
		color: var(--text-price-strike);
		text-decoration: line-through;
	}
</style>
