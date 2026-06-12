<script lang="ts">
	import { cart } from '$lib/cart.svelte';
	import { cdnUrl } from '$lib/cloudinary';
	import { formatNaira } from '$lib/format';

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && cart.isOpen) cart.close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if cart.isOpen}
	<button class="backdrop" aria-label="Close cart" onclick={cart.close} tabindex="-1"></button>
{/if}

<div
	class="drawer"
	class:open={cart.isOpen}
	role="dialog"
	aria-modal="true"
	aria-label="Shopping cart"
	aria-hidden={!cart.isOpen}
>
	<div class="drawer-head">
		<h2 class="drawer-title">Cart {#if cart.count > 0}<span class="count-badge">({cart.count})</span>{/if}</h2>
		<button class="close-btn" aria-label="Close cart" onclick={cart.close}>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M18 6l-12 12" /><path d="M6 6l12 12" />
			</svg>
		</button>
	</div>

	{#if cart.items.length === 0}
		<div class="empty">
			<p class="empty-text">Your cart is empty.</p>
			<button class="btn btn-outline" onclick={cart.close}>Continue Shopping</button>
		</div>
	{:else}
		<ul class="item-list" role="list">
			{#each cart.items as item (item.variantId)}
				<li class="cart-item">
					<a href="/shop/{item.productId}" onclick={cart.close} class="item-img-wrap">
						{#if item.imagePublicId}
							<img
								src={cdnUrl(item.imagePublicId, { width: 80, height: 100, crop: 'fill' })}
								alt={item.name}
								width="80"
								height="100"
								class="item-img"
							/>
						{:else}
							<div class="item-img-placeholder" aria-hidden="true"></div>
						{/if}
					</a>

					<div class="item-body">
						<a href="/shop/{item.productId}" onclick={cart.close} class="item-name">{item.name}</a>
						<p class="item-meta">{item.colourName} · {item.size}</p>
						<p class="item-price">{formatNaira(item.price)}</p>

						<div class="item-foot">
							<div class="qty-control" role="group" aria-label="Quantity for {item.name}">
								<button
									class="qty-btn"
									aria-label="Decrease quantity"
									onclick={() => cart.updateQty(item.variantId, item.quantity - 1)}
								>−</button>
								<span class="qty-val">{item.quantity}</span>
								<button
									class="qty-btn"
									aria-label="Increase quantity"
									onclick={() => cart.updateQty(item.variantId, item.quantity + 1)}
								>+</button>
							</div>
							<button
								class="remove-btn"
								aria-label="Remove {item.name} from cart"
								onclick={() => cart.remove(item.variantId)}
							>Remove</button>
						</div>
					</div>
				</li>
			{/each}
		</ul>

		<div class="drawer-foot">
			<div class="total-row">
				<span class="total-label">Subtotal</span>
				<span class="total-amount">{formatNaira(cart.total)}</span>
			</div>
			<a href="/cart" class="btn btn-primary" onclick={cart.close}>View Cart &amp; Checkout</a>
			<button class="btn btn-outline" onclick={cart.close}>Continue Shopping</button>
		</div>
	{/if}
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		z-index: 300;
		border: none;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(420px, 92vw);
		background: var(--bg-page);
		z-index: 400;
		display: flex;
		flex-direction: column;
		transform: translateX(100%);
		transition: transform var(--transition-medium);
		box-shadow: -4px 0 32px rgba(0, 0, 0, 0.18);
		overflow: hidden;
	}

	.drawer.open {
		transform: translateX(0);
	}

	/* Head */
	.drawer-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--border-color);
		flex-shrink: 0;
	}

	.drawer-title {
		font-size: var(--text-h3);
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.count-badge {
		font-size: var(--text-small);
		font-weight: 400;
		color: var(--text-secondary);
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		color: var(--text-secondary);
		border-radius: var(--radius-md);
		transition: color var(--transition-fast);
	}

	.close-btn:hover {
		color: var(--text-primary);
	}

	.close-btn:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	/* Empty */
	.empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
		padding: var(--space-xl);
		text-align: center;
	}

	.empty-text {
		color: var(--text-secondary);
		max-width: none;
	}

	/* Item list */
	.item-list {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-md) var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		scrollbar-width: thin;
	}

	.cart-item {
		display: flex;
		gap: var(--space-md);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--border-color);
	}

	.cart-item:last-child {
		border-bottom: none;
	}

	.item-img-wrap {
		flex-shrink: 0;
		width: 76px;
		height: 96px;
		border-radius: var(--radius-sm);
		overflow: hidden;
		background: var(--bg-card);
		display: block;
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
		gap: 4px;
	}

	.item-name {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-primary);
		text-decoration: none;
		line-height: var(--leading-tight);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.item-name:hover { color: var(--color-copperwood); }

	.item-meta {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		max-width: none;
	}

	.item-price {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
		max-width: none;
	}

	.item-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 4px;
	}

	/* Qty */
	.qty-control {
		display: flex;
		align-items: center;
		gap: 0;
		border: 1.5px solid var(--border-color);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.qty-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		color: var(--text-primary);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background-color var(--transition-fast);
		line-height: 1;
	}

	.qty-btn:hover { background: var(--bg-card); }

	.qty-btn:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: -2px;
	}

	.qty-val {
		min-width: 28px;
		text-align: center;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-primary);
		border-left: 1.5px solid var(--border-color);
		border-right: 1.5px solid var(--border-color);
		line-height: 32px;
	}

	.remove-btn {
		font-size: var(--text-micro);
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color var(--transition-fast);
	}

	.remove-btn:hover { color: var(--color-copperwood); }

	.remove-btn:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
		border-radius: 2px;
	}

	/* Footer */
	.drawer-foot {
		padding: var(--space-md) var(--space-lg) var(--space-lg);
		border-top: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		flex-shrink: 0;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xs);
	}

	.total-label {
		font-size: var(--text-small);
		color: var(--text-secondary);
	}

	.total-amount {
		font-size: var(--text-body);
		font-weight: 700;
		color: var(--text-primary);
	}
</style>
