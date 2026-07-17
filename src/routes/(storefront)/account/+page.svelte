<script lang="ts">
	import type { PageData } from './$types';
	import { formatNaira } from '$lib/format';

	let { data }: { data: PageData } = $props();

	const firstName = $derived(data.user.full_name.split(' ')[0] || data.user.email.split('@')[0]);

	const tabs = ['Orders', 'Wishlist', 'Profile'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Orders');

	const STATUS_LABEL: Record<string, string> = {
		pending: 'Pending',
		paid: 'Paid',
		fulfilled: 'Fulfilled',
		delivered: 'Delivered',
		cancelled: 'Cancelled',
		refunded: 'Refunded'
	};

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>My Account — Shop With Mercy</title>
</svelte:head>

<div class="page-container account-page">
	<div class="account-head">
		<div>
			<h1 class="page-title">Hi, {firstName}</h1>
			<p class="email-label">{data.user.email}</p>
		</div>
		<form method="POST" action="/auth/signout">
			<button type="submit" class="btn btn-outline signout-btn">Sign out</button>
		</form>
	</div>

	<!-- Tab bar -->
	<div class="tab-bar" role="tablist">
		{#each tabs as tab}
			<button
				role="tab"
				class="tab-btn"
				class:tab-active={activeTab === tab}
				aria-selected={activeTab === tab}
				onclick={() => (activeTab = tab)}
			>{tab}</button>
		{/each}
	</div>

	<!-- Tab panels -->
	<div class="tab-panel">
		{#if activeTab === 'Orders'}
			{#if data.orders.length === 0}
				<div class="empty-panel">
					<p class="empty-title">No orders yet</p>
					<p class="empty-sub">Your order history will appear here after you place an order.</p>
					<a href="/shop" class="btn btn-primary">Browse the Collection</a>
				</div>
			{:else}
				<ul class="order-list" role="list">
					{#each data.orders as order (order.id)}
						<li class="order-card">
							<div class="order-head">
								<div class="order-meta">
									<span class="order-num">Order {order.orderNumber}</span>
									<span class="order-date">{formatDate(order.createdAt)}</span>
								</div>
								<span class="status-badge status-{order.status}">
									{STATUS_LABEL[order.status] ?? order.status}
								</span>
							</div>

							<ul class="order-items" role="list">
								{#each order.items as item}
									<li class="order-item">
										<span class="item-name">{item.product_name}</span>
										<span class="item-detail">{item.colour_name} · Size {item.size} · ×{item.quantity}</span>
										<span class="item-price">{formatNaira(item.unit_price * item.quantity)}</span>
									</li>
								{/each}
							</ul>

							<div class="order-foot">
								<span class="order-total-label">Total</span>
								<span class="order-total">{formatNaira(order.subtotal)}</span>
							</div>
						</li>
					{/each}
				</ul>
			{/if}

		{:else if activeTab === 'Wishlist'}
			<div class="empty-panel">
				<p class="empty-title">Your Wishlist</p>
				<p class="empty-sub">View and manage items you've saved.</p>
				<a href="/account/wishlist" class="btn btn-primary">Go to Wishlist</a>
			</div>

		{:else if activeTab === 'Profile'}
			<div class="profile-section">
				<div class="profile-row">
					<span class="profile-key">Name</span>
					<span class="profile-val">{data.user.full_name || '—'}</span>
				</div>
				<div class="profile-row">
					<span class="profile-key">Email</span>
					<span class="profile-val">{data.user.email}</span>
				</div>
				<p class="profile-note">Profile editing coming soon.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.account-page {
		padding-block: var(--space-xl) var(--space-2xl);
	}

	.account-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
		flex-wrap: wrap;
	}

	.page-title { font-size: var(--text-h1); }

	.email-label {
		font-size: var(--text-small);
		color: var(--text-secondary);
		margin-top: 4px;
		max-width: none;
	}

	.signout-btn { min-width: 100px; }

	/* Tabs */
	.tab-bar {
		display: flex;
		gap: 0;
		border-bottom: 1px solid var(--border-color);
		margin-bottom: var(--space-xl);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.tab-bar::-webkit-scrollbar { display: none; }

	.tab-btn {
		padding: var(--space-sm) var(--space-lg);
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		transition: color var(--transition-fast), border-color var(--transition-fast);
		white-space: nowrap;
		min-height: 44px;
		margin-bottom: -1px;
	}

	.tab-btn:hover { color: var(--text-primary); }

	.tab-active {
		color: var(--text-primary);
		border-bottom-color: var(--color-black-forest);
	}

	[data-theme="dark"] .tab-active {
		border-bottom-color: var(--color-cornsilk);
	}

	/* Empty panels */
	.empty-panel {
		padding: var(--space-2xl) 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-md);
	}

	.empty-title {
		font-size: var(--text-h2);
		font-weight: 600;
		color: var(--text-primary);
		max-width: none;
	}

	.empty-sub { color: var(--text-secondary); }

	/* Order list */
	.order-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.order-card {
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.order-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--border-color);
		flex-wrap: wrap;
	}

	.order-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.order-num {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
	}

	.order-date {
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	/* Status badges */
	.status-badge {
		font-size: var(--text-micro);
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 100px;
		text-transform: capitalize;
	}

	.status-pending  { background: rgba(188,108,37,0.12); color: var(--color-copperwood); }
	.status-paid     { background: rgba(96,108,56,0.12);  color: var(--color-olive-leaf); }
	.status-fulfilled{ background: rgba(96,108,56,0.12);  color: var(--color-olive-leaf); }
	.status-delivered{ background: rgba(96,108,56,0.18);  color: var(--color-olive-leaf); }
	.status-cancelled{ background: rgba(120,120,120,0.12);color: var(--text-secondary); }
	.status-refunded { background: rgba(188,108,37,0.12); color: var(--color-copperwood); }

	/* Order items */
	.order-items {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: var(--space-sm) var(--space-lg);
	}

	.order-item {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		padding-block: var(--space-sm);
		border-bottom: 1px solid var(--border-color);
		flex-wrap: wrap;
	}

	.order-item:last-child { border-bottom: none; }

	.item-name {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-primary);
		flex: 1;
		min-width: 120px;
	}

	.item-detail {
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.item-price {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
		margin-left: auto;
	}

	.order-foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md) var(--space-lg);
		border-top: 1px solid var(--border-color);
		background: var(--bg-page);
	}

	.order-total-label {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
	}

	.order-total {
		font-size: var(--text-body);
		font-weight: 700;
		color: var(--text-primary);
	}

	/* Profile */
	.profile-section {
		display: flex;
		flex-direction: column;
		gap: 0;
		max-width: 480px;
	}

	.profile-row {
		display: flex;
		gap: var(--space-xl);
		padding-block: var(--space-md);
		border-bottom: 1px solid var(--border-color);
	}

	.profile-key {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		min-width: 80px;
		flex-shrink: 0;
	}

	.profile-val {
		font-size: var(--text-small);
		color: var(--text-primary);
	}

	.profile-note {
		font-size: var(--text-small);
		color: var(--text-secondary);
		margin-top: var(--space-lg);
	}
</style>
