<script lang="ts">
	import { formatNaira } from '$lib/format';
	import { cdnUrl, cdnSrcset, HERO_SIZES } from '$lib/cloudinary';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedColourIdx = $state(0);
	let selectedImageIdx = $state(0);
	let selectedSize = $state<string | null>(null);
	let cartMessage = $state('');

	const colour = $derived(data.colours[selectedColourIdx]);
	const currentImage = $derived(colour?.images[selectedImageIdx] ?? null);
	const variant = $derived(
		selectedSize ? (colour?.variants.find((v) => v.size === selectedSize) ?? null) : null
	);
	const canAddToCart = $derived(variant !== null && variant.stock_quantity > 0);
	const totalStock = $derived(
		data.colours.reduce(
			(sum, c) => sum + c.variants.reduce((s, v) => s + v.stock_quantity, 0),
			0
		)
	);
	const isOnSale = $derived(
		data.product.salePrice !== null && data.product.salePrice < data.product.price
	);

	function selectColour(idx: number) {
		selectedColourIdx = idx;
		selectedImageIdx = 0;
		selectedSize = null;
	}

	function handleAddToCart() {
		// Phase 2 will wire this to the real cart.
		// For now, direct users to WhatsApp.
		cartMessage = 'Cart coming soon! Contact us on WhatsApp to place your order.';
		setTimeout(() => {
			cartMessage = '';
		}, 4000);
	}

	function starFilled(star: number, rating: number) {
		return star <= Math.round(rating);
	}
</script>

<svelte:head>
	<title>{data.product.name} — Shop With Mercy</title>
	<meta
		name="description"
		content={data.product.description ??
			`${data.product.name} — casual women's clothing from Shop With Mercy.`}
	/>
</svelte:head>

<div class="page-container product-page">
	<!-- Breadcrumb -->
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<ol role="list">
			<li><a href="/">Home</a></li>
			<li aria-hidden="true">/</li>
			<li><a href="/shop">Shop</a></li>
			{#if data.product.category}
				<li aria-hidden="true">/</li>
				<li>
					<a href="/shop?category={data.product.category.name.toLowerCase()}"
						>{data.product.category.name}</a
					>
				</li>
			{/if}
			<li aria-hidden="true">/</li>
			<li aria-current="page">{data.product.name}</li>
		</ol>
	</nav>

	<div class="product-layout">
		<!-- Gallery -->
		<div class="gallery">
			<div class="gallery-main">
				{#if currentImage}
					<img
						src={cdnUrl(currentImage.cloudinary_public_id, {
							width: 800,
							aspectRatio: '4:5',
							crop: 'fill'
						})}
						srcset={cdnSrcset(currentImage.cloudinary_public_id, [400, 600, 800, 1200], {
							aspectRatio: '4:5',
							crop: 'fill'
						})}
						sizes={HERO_SIZES}
						alt="{data.product.name} in {colour.name}"
						width="800"
						height="1000"
						class="main-img"
					/>
				{:else}
					<div class="gallery-placeholder" aria-label="No image available"></div>
				{/if}

				{#if totalStock === 0}
					<span class="badge badge-sold-out gallery-badge">Sold out</span>
				{:else if isOnSale}
					<span class="badge badge-sale gallery-badge">Sale</span>
				{/if}
			</div>

			{#if colour?.images.length > 1}
				<ul class="gallery-thumbs" aria-label="Product images">
					{#each colour.images as img, i}
						<li>
							<button
								type="button"
								class="thumb"
								class:thumb-active={selectedImageIdx === i}
								aria-label="View image {i + 1}"
								aria-pressed={selectedImageIdx === i}
								onclick={() => {
									selectedImageIdx = i;
								}}
							>
								<img
									src={cdnUrl(img.cloudinary_public_id, {
										width: 80,
										height: 100,
										crop: 'fill'
									})}
									alt=""
									width="80"
									height="100"
								/>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Product info -->
		<div class="product-info">
			<h1 class="product-name">{data.product.name}</h1>

			<!-- Price -->
			<div class="price-row">
				{#if isOnSale}
					<span class="price-sale">{formatNaira(data.product.salePrice!)}</span>
					<span class="price-original">{formatNaira(data.product.price)}</span>
				{:else}
					<span class="price">{formatNaira(data.product.price)}</span>
				{/if}
			</div>

			<!-- Average rating -->
			{#if data.avgRating !== null}
				<div class="rating-row" aria-label="Rated {data.avgRating} out of 5">
					<span class="stars" aria-hidden="true">
						{#each [1, 2, 3, 4, 5] as star}
							<span class="star" class:star-filled={starFilled(star, data.avgRating)}>★</span>
						{/each}
					</span>
					<span class="rating-count">({data.reviewCount})</span>
				</div>
			{/if}

			<!-- Colour swatches -->
			{#if data.colours.length > 1}
				<div class="option-group">
					<p class="option-label">
						Colour: <strong>{colour.name}</strong>
					</p>
					<div class="swatches">
						{#each data.colours as c, i}
							<button
								type="button"
								class="swatch"
								class:swatch-active={selectedColourIdx === i}
								aria-label="Select colour {c.name}"
								aria-pressed={selectedColourIdx === i}
								onclick={() => selectColour(i)}
								title={c.name}
							>
								{#if c.hex}
									<span
										class="swatch-circle"
										style="background-color: {c.hex};"
									></span>
								{:else}
									<span class="swatch-text">{c.name}</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{:else if data.colours.length === 1}
				<p class="single-colour">Colour: <strong>{colour.name}</strong></p>
			{/if}

			<!-- Size picker -->
			{#if colour?.variants.length > 0}
				<div class="option-group">
					<p class="option-label">
						Size {#if !selectedSize}<span class="option-hint">— select one</span>{/if}
					</p>
					<div class="size-grid">
						{#each colour.variants as v}
							{@const inStock = v.stock_quantity > 0}
							<button
								type="button"
								class="size-btn"
								class:size-active={selectedSize === v.size}
								class:size-out={!inStock}
								disabled={!inStock}
								aria-label="{v.size}{!inStock ? ' — sold out' : ''}"
								aria-pressed={selectedSize === v.size}
								onclick={() => {
									selectedSize = v.size;
								}}
							>
								{v.size}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Add to cart -->
			<div class="cart-section">
				<button
					type="button"
					class="btn btn-primary add-to-cart-btn"
					disabled={totalStock === 0 || !selectedSize}
					onclick={handleAddToCart}
					aria-label={totalStock === 0
						? 'Sold out'
						: !selectedSize
							? 'Select a size first'
							: 'Add to cart'}
				>
					{#if totalStock === 0}
						Sold out
					{:else if !selectedSize}
						Select a size
					{:else}
						Add to cart
					{/if}
				</button>

				{#if cartMessage}
					<p class="cart-message" role="status">{cartMessage}</p>
				{/if}

				<!-- Wishlist (Phase 5) -->
				<button type="button" class="btn btn-outline wishlist-btn" aria-label="Save to wishlist">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
					</svg>
					Wishlist
				</button>
			</div>

			<!-- WhatsApp CTA for now -->
			<a
				href="https://wa.me/2349049435149?text=Hi! I'm interested in {encodeURIComponent(data.product.name)}."
				class="whatsapp-link"
				target="_blank"
				rel="noopener noreferrer"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
					<path d="M11 12l1 1l2 -2" />
				</svg>
				Ask about this item on WhatsApp
			</a>

			<!-- Description -->
			{#if data.product.description}
				<div class="description">
					<h2 class="description-heading">About this item</h2>
					<p>{data.product.description}</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Reviews -->
	{#if data.reviews.length > 0}
		<section class="reviews-section" aria-labelledby="reviews-heading">
			<h2 id="reviews-heading" class="reviews-heading">
				Customer Reviews
				{#if data.avgRating !== null}
					<span class="reviews-avg">{data.avgRating} / 5</span>
				{/if}
			</h2>

			<ul class="reviews-list" role="list">
				{#each data.reviews as review}
					<li class="review-card">
						<div class="review-header">
							<span class="stars" aria-label="Rated {review.rating} out of 5">
								{#each [1, 2, 3, 4, 5] as star}
									<span class="star" class:star-filled={star <= review.rating} aria-hidden="true"
										>★</span
									>
								{/each}
							</span>
							<time class="review-date" datetime={review.created_at}>
								{new Date(review.created_at).toLocaleDateString('en-NG', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								})}
							</time>
						</div>
						{#if review.body}
							<p class="review-body">{review.body}</p>
						{/if}
						<p class="review-verified">Verified purchase</p>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.product-page {
		padding-block: var(--space-lg) var(--space-2xl);
	}

	/* Breadcrumb */
	.breadcrumb {
		margin-bottom: var(--space-lg);
	}

	.breadcrumb ol {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		flex-wrap: wrap;
		font-size: var(--text-small);
		color: var(--text-secondary);
	}

	.breadcrumb a {
		text-decoration: none;
		color: var(--text-secondary);
		transition: color var(--transition-fast);
	}

	.breadcrumb a:hover {
		color: var(--color-copperwood);
	}

	/* Product layout */
	.product-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
		margin-bottom: var(--space-2xl);
	}

	@media (min-width: 768px) {
		.product-layout {
			grid-template-columns: 1fr 1fr;
			align-items: start;
		}
	}

	/* Gallery */
	.gallery {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.gallery-main {
		position: relative;
		aspect-ratio: 4 / 5;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--bg-card);
	}

	.main-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.gallery-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(
			135deg,
			var(--color-olive-leaf) 0%,
			var(--color-black-forest) 60%,
			var(--color-copperwood) 100%
		);
		opacity: 0.2;
	}

	.gallery-badge {
		position: absolute;
		top: var(--space-md);
		left: var(--space-md);
	}

	.gallery-thumbs {
		display: flex;
		gap: var(--space-sm);
		overflow-x: auto;
		scrollbar-width: none;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.gallery-thumbs::-webkit-scrollbar {
		display: none;
	}

	.gallery-thumbs li {
		flex-shrink: 0;
	}

	.thumb {
		flex-shrink: 0;
		width: 64px;
		height: 80px;
		border-radius: var(--radius-sm);
		overflow: hidden;
		border: 2px solid transparent;
		padding: 0;
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumb-active {
		border-color: var(--color-copperwood);
	}

	.thumb:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	/* Product info */
	.product-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.product-name {
		font-size: var(--text-h1);
		font-weight: 600;
		line-height: var(--leading-tight);
	}

	.price-row {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.price,
	.price-sale {
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--text-primary);
	}

	.price-sale {
		color: var(--text-price-sale);
	}

	.price-original {
		font-size: var(--text-body);
		color: var(--text-price-strike);
		text-decoration: line-through;
	}

	/* Ratings */
	.rating-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.stars {
		letter-spacing: 0.1em;
	}

	.star {
		color: var(--star-empty);
		font-size: 16px;
	}

	.star-filled {
		color: var(--star-filled);
	}

	.rating-count {
		font-size: var(--text-small);
		color: var(--text-secondary);
	}

	/* Options */
	.option-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.option-label {
		font-size: var(--text-small);
		color: var(--text-secondary);
		max-width: none;
	}

	.option-hint {
		font-weight: 400;
		font-style: italic;
	}

	.single-colour {
		font-size: var(--text-small);
		color: var(--text-secondary);
		max-width: none;
	}

	/* Colour swatches */
	.swatches {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.swatch {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid transparent;
		padding: 2px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color var(--transition-fast), transform var(--transition-fast);
	}

	.swatch-circle {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: block;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.swatch-text {
		font-size: var(--text-micro);
		font-weight: 600;
		white-space: nowrap;
		padding: 4px 8px;
	}

	.swatch-active {
		border-color: var(--color-copperwood);
	}

	.swatch:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	/* Sizes */
	.size-grid {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.size-btn {
		min-width: 44px;
		min-height: 44px;
		padding: 4px 12px;
		border: 1.5px solid var(--border-color);
		border-radius: var(--radius-sm);
		font: inherit;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-primary);
		background: transparent;
		cursor: pointer;
		transition: border-color var(--transition-fast), background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.size-btn:hover:not(:disabled) {
		border-color: var(--text-primary);
	}

	.size-btn:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.size-active {
		background: var(--text-primary);
		color: var(--bg-page);
		border-color: var(--text-primary);
	}

	.size-out {
		opacity: 0.35;
		cursor: not-allowed;
		text-decoration: line-through;
	}

	/* Cart */
	.cart-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.add-to-cart-btn {
		width: 100%;
		font-size: var(--text-body);
	}

	.cart-message {
		font-size: var(--text-small);
		color: var(--text-secondary);
		padding: var(--space-sm);
		background: var(--bg-card);
		border-radius: var(--radius-sm);
		max-width: none;
	}

	.wishlist-btn {
		width: 100%;
	}

	/* WhatsApp link */
	.whatsapp-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--text-small);
		color: var(--text-secondary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.whatsapp-link:hover {
		color: var(--color-copperwood);
	}

	/* Description */
	.description {
		border-top: 1px solid var(--border-color);
		padding-top: var(--space-lg);
	}

	.description-heading {
		font-size: var(--text-h3);
		margin-bottom: var(--space-sm);
	}

	/* Reviews */
	.reviews-section {
		border-top: 1px solid var(--border-color);
		padding-top: var(--space-xl);
	}

	.reviews-heading {
		font-size: var(--text-h2);
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
	}

	.reviews-avg {
		font-size: var(--text-body);
		font-weight: 400;
		color: var(--text-secondary);
	}

	.reviews-list {
		display: grid;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.reviews-list {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.review-card {
		background: var(--bg-card);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.review-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
	}

	.review-date {
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.review-body {
		font-size: var(--text-small);
		color: var(--text-primary);
		line-height: var(--leading-normal);
	}

	.review-verified {
		font-size: var(--text-micro);
		color: var(--color-olive-leaf);
		max-width: none;
	}
</style>
