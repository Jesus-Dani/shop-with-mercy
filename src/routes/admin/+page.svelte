<script lang="ts">
</script>

<svelte:head>
	<title>Admin — Shop With Mercy</title>
</svelte:head>

<div class="dashboard">
	<h1 class="dash-title">Dashboard</h1>

	<div class="card-grid">
		<a href="/admin/products" class="dash-card live">
			<span class="card-icon">📦</span>
			<h2 class="card-title">Products</h2>
			<p class="card-body">Add, edit, and manage your catalogue with images and stock.</p>
			<span class="badge-live">Open →</span>
		</a>

		<a href="/admin/orders" class="dash-card live">
			<span class="card-icon">🛒</span>
			<h2 class="card-title">Orders</h2>
			<p class="card-body">View and manage customer orders, mark fulfilment status.</p>
			<span class="badge-live">Open →</span>
		</a>

		<a href="/admin/inventory" class="dash-card live">
			<span class="card-icon">📋</span>
			<h2 class="card-title">Inventory</h2>
			<p class="card-body">Stock levels at a glance — out, low, and healthy.</p>
			<span class="badge-live">Open →</span>
		</a>

		<a href="/admin/categories" class="dash-card live">
			<span class="card-icon">🏷️</span>
			<h2 class="card-title">Categories</h2>
			<p class="card-body">Create and manage product categories.</p>
			<span class="badge-live">Open →</span>
		</a>

		<a href="/admin/reviews" class="dash-card live">
			<span class="card-icon">⭐</span>
			<h2 class="card-title">Reviews</h2>
			<p class="card-body">Moderate customer reviews — hide, restore, or delete.</p>
			<span class="badge-live">Open →</span>
		</a>

		<div class="dash-card coming">
			<span class="card-icon">📊</span>
			<h2 class="card-title">Analytics</h2>
			<p class="card-body">Revenue, best sellers, trends, and customer insights.</p>
			<span class="badge-coming">Phase C</span>
		</div>
	</div>

	<div class="quick-links">
		<a href="/" class="btn btn-outline">View Storefront</a>
	</div>
</div>

<style>
	.dashboard { display: flex; flex-direction: column; gap: var(--space-xl); }
	.dash-title { font-size: var(--text-h1); }

	.card-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	@media (min-width: 640px) {
		.card-grid { grid-template-columns: repeat(2, 1fr); }
	}

	@media (min-width: 960px) {
		.card-grid { grid-template-columns: repeat(3, 1fr); }
	}

	.dash-card {
		background: var(--bg-card);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		border: 1px solid var(--border-color);
	}

	.card-icon { font-size: 24px; }

	.card-title {
		font-size: var(--text-h3);
		font-weight: 600;
	}

	.card-body {
		font-size: var(--text-small);
		color: var(--text-secondary);
		flex: 1;
	}

	.dash-card.live {
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
	}

	.dash-card.live:hover {
		border-color: var(--color-olive-leaf);
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	}

	.badge-live {
		display: inline-block;
		font-size: var(--text-micro);
		font-weight: 600;
		color: var(--color-olive-leaf);
		background: rgba(96, 108, 56, 0.12);
		border: 1px solid rgba(96, 108, 56, 0.3);
		border-radius: 100px;
		padding: 3px 10px;
		align-self: flex-start;
	}

	.badge-coming {
		display: inline-block;
		font-size: var(--text-micro);
		font-weight: 500;
		color: var(--text-secondary);
		background: var(--bg-page);
		border: 1px solid var(--border-color);
		border-radius: 100px;
		padding: 3px 10px;
		align-self: flex-start;
	}

	.quick-links {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}
</style>
