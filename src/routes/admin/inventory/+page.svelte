<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function stockStatus(qty: number): 'out' | 'low' | 'healthy' {
		if (qty === 0) return 'out';
		if (qty <= 5) return 'low';
		return 'healthy';
	}

	const STATUS_LABEL = { out: 'Out', low: 'Low', healthy: 'OK' };
</script>

<svelte:head><title>Inventory — SWM Admin</title></svelte:head>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Inventory</h1>
	</div>

	<!-- Summary cards -->
	<div class="stats">
		<div class="stat stat-out">
			<span class="stat-value">{data.outCount}</span>
			<span class="stat-label">Out of stock</span>
		</div>
		<div class="stat stat-low">
			<span class="stat-value">{data.lowCount}</span>
			<span class="stat-label">Low stock (1–5)</span>
		</div>
		<div class="stat stat-healthy">
			<span class="stat-value">{data.healthyCount}</span>
			<span class="stat-label">Healthy (6+)</span>
		</div>
	</div>

	<!-- Filter tabs -->
	<nav class="filter-tabs" aria-label="Filter inventory">
		<a href="/admin/inventory?filter=all"     class="tab" class:active={data.filter === 'all'}>All</a>
		<a href="/admin/inventory?filter=low"     class="tab" class:active={data.filter === 'low'}>Low stock</a>
		<a href="/admin/inventory?filter=out"     class="tab" class:active={data.filter === 'out'}>Out of stock</a>
	</nav>

	{#if data.variants.length === 0}
		<p class="empty">No variants match this filter.</p>
	{:else}
		<div class="table-wrap">
			<table class="inv-table">
				<thead>
					<tr>
						<th>Product</th>
						<th>Category</th>
						<th>Colour</th>
						<th>Size</th>
						<th>Stock</th>
						<th>Status</th>
						<th>Edit</th>
					</tr>
				</thead>
				<tbody>
					{#each data.variants as v (v.id)}
						{@const colour = v.product_colours}
						{@const product = colour?.products}
						{@const status = stockStatus(v.stock_quantity)}
						<tr class="row-{status}">
							<td class="product-name">
								{product?.name ?? '—'}
								{#if !product?.published}
									<span class="unpublished-tag">Draft</span>
								{/if}
							</td>
							<td class="muted">{product?.categories?.name ?? '—'}</td>
							<td>
								<span class="colour-swatch" style="background:{colour?.colour_hex ?? '#999'}"></span>
								{colour?.colour_name ?? '—'}
							</td>
							<td class="size-cell">{v.size}</td>
							<td class="qty-cell qty-{status}">{v.stock_quantity}</td>
							<td><span class="badge badge-{status}">{STATUS_LABEL[status]}</span></td>
							<td>
								{#if product?.id}
									<a href="/admin/products/{product.id}?tab=stock" class="edit-link">Edit stock →</a>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.page { display: flex; flex-direction: column; gap: var(--space-lg); }
	.page-title { font-size: var(--text-h1); }

	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-md);
		max-width: 480px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: var(--space-md);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-color);
	}

	.stat-out  { border-color: #fecaca; background: #fff5f5; }
	.stat-low  { border-color: #fde68a; background: #fffbeb; }
	.stat-healthy { border-color: #a7f3d0; background: #f0fdf9; }

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		line-height: 1;
	}

	.stat-out .stat-value   { color: #991b1b; }
	.stat-low .stat-value   { color: #92400e; }
	.stat-healthy .stat-value { color: #065f46; }

	.stat-label {
		font-size: var(--text-micro);
		font-weight: 500;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.filter-tabs { display: flex; gap: 2px; }

	.tab {
		padding: 6px 14px;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast), color var(--transition-fast);
	}

	.tab:hover { background: var(--bg-raised); color: var(--text-primary); }
	.tab.active { background: var(--color-black-forest); color: var(--color-cornsilk); }

	.empty {
		color: var(--text-secondary);
		font-size: var(--text-small);
		max-width: none;
	}

	.table-wrap { overflow-x: auto; }

	.inv-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}

	.inv-table th {
		text-align: left;
		padding: var(--space-xs) var(--space-sm);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border-color);
		white-space: nowrap;
	}

	.inv-table td {
		padding: var(--space-sm);
		border-bottom: 1px solid var(--border-color);
		vertical-align: middle;
	}

	.row-out  td { background: #fff5f5; }
	.row-low  td { background: #fffbeb; }

	.product-name { font-weight: 500; }

	.unpublished-tag {
		display: inline-block;
		font-size: 10px;
		font-weight: 600;
		padding: 1px 5px;
		border-radius: 3px;
		background: #e5e7eb;
		color: #6b7280;
		margin-left: 4px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		vertical-align: middle;
	}

	.muted { color: var(--text-secondary); }

	.colour-swatch {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid rgba(0,0,0,0.15);
		vertical-align: middle;
		margin-right: 4px;
	}

	.size-cell { font-weight: 600; }

	.qty-cell { font-weight: 700; font-size: 15px; }
	.qty-out     { color: #991b1b; }
	.qty-low     { color: #92400e; }
	.qty-healthy { color: #065f46; }

	.badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 999px;
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.badge-out     { background: #fee2e2; color: #991b1b; }
	.badge-low     { background: #fef3c7; color: #92400e; }
	.badge-healthy { background: #d1fae5; color: #065f46; }

	.edit-link {
		font-size: var(--text-micro);
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		white-space: nowrap;
	}

	.edit-link:hover { color: var(--text-primary); text-decoration: underline; }
</style>
