<script lang="ts">
	import type { PageData } from './$types';
	import { formatNaira } from '$lib/format';

	const { data }: { data: PageData } = $props();

	const STATUS_COLOURS: Record<string, string> = {
		pending:   'badge-gray',
		paid:      'badge-blue',
		fulfilled: 'badge-amber',
		delivered: 'badge-green',
		cancelled: 'badge-red',
		refunded:  'badge-purple'
	};

	function fmtDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function fmtDateShort(iso: string) {
		return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
	}
</script>

<svelte:head>
	<title>{data.name} — Customers — Shop With Mercy Admin</title>
</svelte:head>

<div class="crm-page">
	<!-- Back -->
	<a href="/admin/customers" class="back-link">← All customers</a>

	<!-- Header -->
	<div class="customer-header">
		<div class="avatar" aria-hidden="true">
			{data.name.slice(0, 1).toUpperCase()}
		</div>
		<div class="header-info">
			<h1 class="customer-name">{data.name}</h1>
			<p class="customer-email">{data.email}</p>
			{#if data.phone}
				<p class="customer-phone">{data.phone}</p>
			{/if}
		</div>
		<div class="account-status">
			{#if data.hasAccount}
				<span class="badge badge-green">Registered account</span>
				{#if data.profile?.created_at}
					<span class="joined">Joined {fmtDate(data.profile.created_at)}</span>
				{/if}
			{:else}
				<span class="badge badge-gray">Guest</span>
				{#if data.firstOrderAt}
					<span class="joined">First order {fmtDate(data.firstOrderAt)}</span>
				{/if}
			{/if}
		</div>
	</div>

	<!-- Stat cards -->
	<div class="stats-row">
		<div class="stat-card">
			<span class="stat-label">Lifetime value</span>
			<span class="stat-value">{formatNaira(data.ltv)}</span>
		</div>
		<div class="stat-card">
			<span class="stat-label">Total orders</span>
			<span class="stat-value">{data.orderCount}</span>
		</div>
		<div class="stat-card">
			<span class="stat-label">Paid orders</span>
			<span class="stat-value">{data.paidCount}</span>
		</div>
		<div class="stat-card">
			<span class="stat-label">Avg order value</span>
			<span class="stat-value">{data.avgOrder > 0 ? formatNaira(data.avgOrder) : '—'}</span>
		</div>
	</div>

	<!-- Order history -->
	<section class="section">
		<h2 class="section-title">Order History</h2>
		{#if data.orders.length === 0}
			<p class="empty-note">No orders.</p>
		{:else}
			<div class="table-wrap">
				<table class="data-table">
					<thead>
						<tr>
							<th>Order</th>
							<th>Date</th>
							<th>Status</th>
							<th class="num-col">Total</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each data.orders as o}
							<tr>
								<td class="order-num">{o.order_number}</td>
								<td class="date-cell">{fmtDateShort(o.created_at)}</td>
								<td>
									<span class="badge {STATUS_COLOURS[o.status] ?? 'badge-gray'}">
										{o.status}
									</span>
								</td>
								<td class="num-col">{formatNaira(o.subtotal)}</td>
								<td>
									<a href="/admin/orders/{o.id}" class="view-link">View →</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<!-- Wishlist (registered only) -->
	{#if data.hasAccount}
		<section class="section">
			<h2 class="section-title">Saved to Wishlist</h2>
			{#if data.wishlist.length === 0}
				<p class="empty-note">No wishlist items.</p>
			{:else}
				<div class="table-wrap">
					<table class="data-table">
						<thead>
							<tr>
								<th>Product</th>
								<th>Colour</th>
								<th>Size</th>
								<th>Saved on</th>
							</tr>
						</thead>
						<tbody>
							{#each data.wishlist as w}
								<tr>
									<td class="product-name">{w.product_name}</td>
									<td>{w.colour_name}</td>
									<td>{w.size}</td>
									<td class="date-cell">{fmtDateShort(w.added_at)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	.crm-page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.back-link {
		display: inline-block;
		font-size: 0.8125rem;
		color: #6b7280;
		text-decoration: none;
		transition: color 0.15s;
	}

	.back-link:hover { color: #111; }

	/* Header */
	.customer-header {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: #fff;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 4px rgba(0,0,0,0.06);
		flex-wrap: wrap;
	}

	.avatar {
		width: 56px;
		height: 56px;
		border-radius: 9999px;
		background: #e8e2da;
		color: #5c4a35;
		font-size: 1.375rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.header-info {
		flex: 1;
		min-width: 0;
	}

	.customer-name {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.3;
	}

	.customer-email,
	.customer-phone {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 2px;
	}

	.account-status {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		flex-shrink: 0;
	}

	.joined {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	/* Stats */
	.stats-row {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.stats-row { grid-template-columns: repeat(4, 1fr); }
	}

	.stat-card {
		background: #fff;
		border-radius: 10px;
		padding: 1rem 1.25rem;
		box-shadow: 0 1px 4px rgba(0,0,0,0.06);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: 500;
	}

	.stat-value {
		font-size: 1.375rem;
		font-weight: 700;
		color: #111;
	}

	/* Section */
	.section {
		background: #fff;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 4px rgba(0,0,0,0.06);
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	/* Table */
	.table-wrap { overflow-x: auto; }

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.data-table th {
		text-align: left;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid #e5e7eb;
		white-space: nowrap;
	}

	.data-table td {
		padding: 0.625rem 0.75rem;
		border-bottom: 1px solid #f3f4f6;
		color: #374151;
		vertical-align: middle;
	}

	.data-table tr:last-child td { border-bottom: none; }

	.num-col { text-align: right; }

	.order-num  { font-weight: 600; color: #111; font-family: monospace; }
	.date-cell  { color: #9ca3af; white-space: nowrap; }
	.product-name { font-weight: 500; }

	.view-link {
		font-size: 0.75rem;
		color: #7e6c5a;
		text-decoration: none;
		font-weight: 500;
		white-space: nowrap;
	}

	.view-link:hover { text-decoration: underline; }

	/* Badges */
	.badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 9999px;
		font-size: 0.7rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.badge-gray   { background: #f3f4f6; color: #6b7280; }
	.badge-blue   { background: #dbeafe; color: #1e40af; }
	.badge-amber  { background: #fef3c7; color: #92400e; }
	.badge-green  { background: #d1fae5; color: #065f46; }
	.badge-red    { background: #fee2e2; color: #991b1b; }
	.badge-purple { background: #ede9fe; color: #5b21b6; }

	.empty-note {
		color: #9ca3af;
		font-size: 0.875rem;
		padding: 1rem 0;
	}
</style>
