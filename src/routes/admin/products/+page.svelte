<script lang="ts">
	import { enhance } from '$app/forms';
	import { cdnUrl } from '$lib/cloudinary';
	import { formatNaira } from '$lib/format';
	let { data }: { data: any } = $props();

	function primaryImage(product: (typeof data.products)[0]) {
		const colours = product.product_colours as any[];
		if (!colours?.length) return null;
		const imgs = colours[0]?.product_images ?? [];
		const sorted = [...imgs].sort((a: any, b: any) => a.sort_order - b.sort_order);
		return sorted[0]?.cloudinary_public_id ?? null;
	}
</script>

<svelte:head><title>Products — SWM Admin</title></svelte:head>

<div class="page-head">
	<h1 class="page-title">Products</h1>
	<a href="/admin/products/new" class="btn btn-primary">+ Add Product</a>
</div>

<form method="GET" class="search-row">
	<input
		type="search"
		name="q"
		value={data.q}
		placeholder="Search products…"
		class="search-input"
	/>
	<button type="submit" class="btn btn-outline">Search</button>
	{#if data.q}
		<a href="/admin/products" class="btn btn-ghost">Clear</a>
	{/if}
</form>

{#if data.products.length === 0}
	<div class="empty-state">
		<p>{data.q ? `No products matching "${data.q}"` : 'No products yet.'}</p>
		<a href="/admin/products/new" class="btn btn-primary">Add your first product</a>
	</div>
{:else}
	<div class="product-table">
		<div class="table-head">
			<span class="col-img"></span>
			<span class="col-name">Name</span>
			<span class="col-cat">Category</span>
			<span class="col-price">Price</span>
			<span class="col-status">Status</span>
			<span class="col-actions"></span>
		</div>

		{#each data.products as product}
			{@const img = primaryImage(product)}
			<div class="table-row">
				<div class="col-img">
					{#if img}
						<img src={cdnUrl(img, { width: 64, height: 64, crop: 'fill' })} alt="" class="thumb" />
					{:else}
						<div class="thumb thumb-empty"></div>
					{/if}
				</div>

				<div class="col-name">
					<a href="/admin/products/{product.id}" class="product-link">{product.name}</a>
					<span class="colour-count">{(product.product_colours as any[]).length} colour(s)</span>
				</div>

				<div class="col-cat">
					{(product.categories as any)?.name ?? '—'}
				</div>

				<div class="col-price">
					{#if product.sale_price}
						<span class="sale-price">{formatNaira(product.sale_price)}</span>
						<span class="orig-price">{formatNaira(product.price)}</span>
					{:else}
						{formatNaira(product.price)}
					{/if}
				</div>

				<div class="col-status">
					<form method="POST" action="?/togglePublished" use:enhance>
						<input type="hidden" name="id" value={product.id} />
						<input type="hidden" name="published" value={String(product.published)} />
						<button type="submit" class="status-badge" class:published={product.published}>
							{product.published ? 'Live' : 'Draft'}
						</button>
					</form>
				</div>

				<div class="col-actions">
					<a href="/admin/products/{product.id}" class="btn-action">Edit</a>
					<form method="POST" action="?/deleteProduct" use:enhance onsubmit={(e) => { if (!confirm('Delete this product? This cannot be undone.')) e.preventDefault(); }}>
						<input type="hidden" name="id" value={product.id} />
						<button type="submit" class="btn-action danger">Delete</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.page-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
		flex-wrap: wrap;
	}

	.page-title { font-size: var(--text-h1); }

	.search-row {
		display: flex;
		gap: var(--space-sm);
		margin-bottom: var(--space-xl);
		flex-wrap: wrap;
	}

	.search-input {
		flex: 1;
		min-width: 200px;
		padding: 8px 12px;
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		background: var(--bg-card);
		color: var(--text-primary);
		font-size: var(--text-small);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-2xl) 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		color: var(--text-secondary);
	}

	.product-table {
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.table-head,
	.table-row {
		display: grid;
		grid-template-columns: 56px 1fr 120px 110px 80px 120px;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-sm) var(--space-md);
	}

	@media (max-width: 768px) {
		.table-head { display: none; }
		.table-row {
			grid-template-columns: 56px 1fr auto;
			grid-template-rows: auto auto;
		}
		.col-cat, .col-price, .col-status { display: none; }
	}

	.table-head {
		background: var(--bg-page);
		font-size: var(--text-micro);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-secondary);
	}

	.table-row {
		background: var(--bg-card);
		border-top: 1px solid var(--border-color);
		min-height: 64px;
	}

	.table-row:hover { background: var(--bg-page); }

	.thumb {
		width: 48px;
		height: 48px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		display: block;
	}

	.thumb-empty {
		background: var(--bg-page);
		border: 1px dashed var(--border-color);
	}

	.product-link {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
		text-decoration: none;
	}

	.product-link:hover { text-decoration: underline; }

	.colour-count {
		display: block;
		font-size: var(--text-micro);
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.col-price { font-size: var(--text-small); }

	.sale-price { font-weight: 600; color: var(--color-copperwood); }

	.orig-price {
		display: block;
		font-size: var(--text-micro);
		color: var(--text-secondary);
		text-decoration: line-through;
	}

	.status-badge {
		display: inline-block;
		font-size: var(--text-micro);
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 100px;
		border: none;
		cursor: pointer;
		background: var(--bg-page);
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
	}

	.status-badge.published {
		background: rgba(96, 108, 56, 0.15);
		color: var(--color-olive-leaf);
		border-color: rgba(96, 108, 56, 0.3);
	}

	.col-actions {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.btn-action {
		font-size: var(--text-micro);
		font-weight: 500;
		padding: 5px 12px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-color);
		background: none;
		color: var(--text-primary);
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		transition: background var(--transition-fast);
	}

	.btn-action:hover { background: var(--bg-page); }

	.btn-action.danger { color: var(--color-copperwood); border-color: rgba(188, 108, 37, 0.3); }
	.btn-action.danger:hover { background: rgba(188, 108, 37, 0.08); }
</style>
