<script lang="ts">
	import { cart } from '$lib/cart.svelte';
	import { cdnUrl } from '$lib/cloudinary';
	import { formatNaira } from '$lib/format';

	const whatsappMsg = $derived(
		cart.items.length === 0
			? ''
			: encodeURIComponent(
					`Hi! I'd like to order:\n${cart.items
						.map(
							(i) =>
								`• ${i.name} (${i.colourName}, Size ${i.size}) x${i.quantity} — ${formatNaira(i.price * i.quantity)}`
						)
						.join('\n')}\n\nTotal: ${formatNaira(cart.total)}`
				)
	);
</script>

<svelte:head>
	<title>Your Cart — Shop With Mercy</title>
</svelte:head>

<div class="page-container cart-page">
	<h1 class="page-title">Your Cart</h1>

	{#if cart.items.length === 0}
		<div class="empty-state">
			<p>Your cart is empty.</p>
			<a href="/shop" class="btn btn-primary">Browse the Collection</a>
		</div>
	{:else}
		<div class="cart-layout">
			<!-- Item list -->
			<ul class="item-list" role="list">
				{#each cart.items as item (item.variantId)}
					<li class="cart-item">
						<a href="/shop/{item.productId}" class="item-img-wrap">
							{#if item.imagePublicId}
								<img
									src={cdnUrl(item.imagePublicId, { width: 120, height: 150, crop: 'fill' })}
									alt={item.name}
									width="120"
									height="150"
									class="item-img"
								/>
							{:else}
								<div class="item-img-placeholder" aria-hidden="true"></div>
							{/if}
						</a>

						<div class="item-body">
							<div class="item-top">
								<div class="item-meta-wrap">
									<a href="/shop/{item.productId}" class="item-name">{item.name}</a>
									<p class="item-meta">{item.colourName} · Size {item.size}</p>
								</div>
								<button
									class="remove-btn"
									aria-label="Remove {item.name}"
									onclick={() => cart.remove(item.variantId)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
										<path d="M18 6l-12 12" /><path d="M6 6l12 12" />
									</svg>
								</button>
							</div>

							<div class="item-bottom">
								<div class="qty-control" role="group" aria-label="Quantity for {item.name}">
									<button class="qty-btn" aria-label="Decrease" onclick={() => cart.updateQty(item.variantId, item.quantity - 1)}>−</button>
									<span class="qty-val">{item.quantity}</span>
									<button class="qty-btn" aria-label="Increase" onclick={() => cart.updateQty(item.variantId, item.quantity + 1)}>+</button>
								</div>
								<p class="item-price">{formatNaira(item.price * item.quantity)}</p>
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<!-- Order summary -->
			<aside class="summary">
				<h2 class="summary-title">Order Summary</h2>

				<div class="summary-rows">
					<div class="summary-row">
						<span>Subtotal ({cart.count} {cart.count === 1 ? 'item' : 'items'})</span>
						<span>{formatNaira(cart.total)}</span>
					</div>
					<div class="summary-row">
						<span>Delivery</span>
						<span class="delivery-note">Calculated on checkout</span>
					</div>
				</div>

				<div class="summary-total">
					<span>Total</span>
					<span class="total-val">{formatNaira(cart.total)}</span>
				</div>

				<a
					href="https://wa.me/2349049435149?text={whatsappMsg}"
					class="btn btn-primary checkout-btn"
					target="_blank"
					rel="noopener noreferrer"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
						<path d="M11 12l1 1l2 -2" />
					</svg>
					Order via WhatsApp
				</a>

				<p class="checkout-note">Online card payment coming soon via Paystack</p>

				<a href="/shop" class="btn btn-outline">Continue Shopping</a>
			</aside>
		</div>
	{/if}
</div>

<style>
	.cart-page {
		padding-block: var(--space-xl) var(--space-2xl);
	}

	.page-title {
		font-size: var(--text-h1);
		margin-bottom: var(--space-xl);
	}

	.empty-state {
		padding: var(--space-2xl) 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-lg);
	}

	.empty-state p { color: var(--text-secondary); }

	/* Layout */
	.cart-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
		align-items: start;
	}

	@media (min-width: 768px) {
		.cart-layout {
			grid-template-columns: 1fr 360px;
		}
	}

	/* Items */
	.item-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.cart-item {
		display: flex;
		gap: var(--space-md);
		padding-block: var(--space-lg);
		border-bottom: 1px solid var(--border-color);
	}

	.item-img-wrap {
		flex-shrink: 0;
		width: 96px;
		height: 120px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--bg-card);
		display: block;
	}

	@media (min-width: 480px) {
		.item-img-wrap {
			width: 110px;
			height: 138px;
		}
	}

	.item-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.item-img-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--color-olive-leaf) 0%, var(--color-black-forest) 100%);
		opacity: 0.2;
	}

	.item-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--space-sm);
	}

	.item-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-sm);
	}

	.item-meta-wrap {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.item-name {
		font-size: var(--text-body);
		font-weight: 500;
		color: var(--text-primary);
		text-decoration: none;
		line-height: var(--leading-tight);
	}

	.item-name:hover { color: var(--color-copperwood); }

	.item-meta {
		font-size: var(--text-small);
		color: var(--text-secondary);
		max-width: none;
	}

	.remove-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		color: var(--text-secondary);
		border-radius: var(--radius-sm);
		transition: color var(--transition-fast);
	}

	.remove-btn:hover { color: var(--color-copperwood); }

	.remove-btn:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.item-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
	}

	.qty-control {
		display: flex;
		align-items: center;
		border: 1.5px solid var(--border-color);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.qty-btn {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		color: var(--text-primary);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.qty-btn:hover { background: var(--bg-card); }

	.qty-btn:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: -2px;
	}

	.qty-val {
		min-width: 36px;
		text-align: center;
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
		border-left: 1.5px solid var(--border-color);
		border-right: 1.5px solid var(--border-color);
		line-height: 40px;
	}

	.item-price {
		font-size: var(--text-body);
		font-weight: 700;
		color: var(--text-primary);
		max-width: none;
	}

	/* Summary */
	.summary {
		background: var(--bg-card);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		position: sticky;
		top: calc(var(--nav-height) + var(--space-md));
	}

	.summary-title {
		font-size: var(--text-h3);
		font-weight: 600;
	}

	.summary-rows {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-small);
		color: var(--text-secondary);
	}

	.delivery-note {
		font-style: italic;
	}

	.summary-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: var(--space-md);
		border-top: 1px solid var(--border-color);
		font-size: var(--text-body);
		font-weight: 600;
		color: var(--text-primary);
	}

	.total-val {
		font-size: var(--text-h2);
	}

	.checkout-btn {
		width: 100%;
		gap: var(--space-sm);
	}

	.checkout-note {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		text-align: center;
		max-width: none;
	}
</style>
