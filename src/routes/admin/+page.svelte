<script lang="ts">
	import type { LayoutData } from './$types';
	let { data }: { data: LayoutData } = $props();
</script>

<svelte:head>
	<title>Admin — Shop With Mercy</title>
</svelte:head>

<div class="dashboard">
	<h1 class="dash-title">Dashboard</h1>
	<p class="dash-sub">Welcome back, {data.adminUser.full_name || data.adminUser.email}.</p>

	<div class="card-grid">
		<div class="dash-card coming">
			<span class="card-icon">📦</span>
			<h2 class="card-title">Products</h2>
			<p class="card-body">Add, edit, and manage your catalogue with images and stock.</p>
			<span class="badge-coming">Coming in Phase 4</span>
		</div>

		<div class="dash-card coming">
			<span class="card-icon">🛒</span>
			<h2 class="card-title">Orders</h2>
			<p class="card-body">View and manage customer orders, mark fulfilment status.</p>
			<span class="badge-coming">Coming in Phase 7</span>
		</div>

		<div class="dash-card coming">
			<span class="card-icon">📊</span>
			<h2 class="card-title">Analytics</h2>
			<p class="card-body">Revenue, best sellers, inventory, customer insights.</p>
			<span class="badge-coming">Coming in Phase 8</span>
		</div>
	</div>

	<div class="quick-links">
		<a href="/" class="btn btn-outline">View Storefront</a>
		<a href="https://app.supabase.com" target="_blank" rel="noopener" class="btn btn-outline">Supabase Dashboard ↗</a>
	</div>
</div>

<style>
	.dashboard { display: flex; flex-direction: column; gap: var(--space-xl); }
	.dash-title { font-size: var(--text-h1); }
	.dash-sub { color: var(--text-secondary); }

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
