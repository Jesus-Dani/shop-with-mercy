<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const STATUSES = ['all', 'pending', 'paid', 'fulfilled', 'delivered', 'cancelled', 'refunded'];

	const STATUS_LABELS: Record<string, string> = {
		pending: 'Pending', paid: 'Paid', fulfilled: 'Fulfilled',
		delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded'
	};

	const VALID_NEXT: Record<string, string[]> = {
		pending: ['paid', 'cancelled'],
		paid: ['fulfilled', 'cancelled'],
		fulfilled: ['delivered', 'cancelled'],
		delivered: ['refunded'],
		cancelled: ['refunded'],
		refunded: []
	};

	function formatNaira(naira: number) {
		return '₦' + Math.round(naira).toLocaleString('en-NG');
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	let copyFeedback = $state('');

	function buildCopyText() {
		const header = [
			`Orders: ${data.from} to ${data.to}`,
			data.status !== 'all' ? `Status: ${STATUS_LABELS[data.status]}` : 'Status: All',
			`Total: ${data.orders.length} order${data.orders.length !== 1 ? 's' : ''}`
		].join(' | ');

		const lines: string[] = [header, ''];

		for (const o of data.orders) {
			lines.push(`#${o.order_number} · ${formatDate(o.created_at)} · ${(o.status as string).toUpperCase()} · ${formatNaira(Number(o.subtotal))}`);
			lines.push(`${o.customer_name} | ${o.customer_phone ?? '—'}`);
			if (Array.isArray(o.order_items) && o.order_items.length > 0) {
				for (const item of o.order_items as any[]) {
					lines.push(`  • ${item.product_name} · ${item.size} · ${item.colour_name} · x${item.quantity}`);
				}
			}
			lines.push('');
		}

		return lines.join('\n').trim();
	}

	async function copyOrders() {
		const text = buildCopyText();
		await navigator.clipboard.writeText(text);
		copyFeedback = 'Copied!';
		setTimeout(() => (copyFeedback = ''), 2000);
	}

	const canCopy = $derived(!!(data.from && data.to));
</script>

<svelte:head><title>Orders — SWM Admin</title></svelte:head>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Orders</h1>
		<span class="count">{data.orders.length} shown</span>
	</div>

	{#if form?.error}
		<p class="alert-error" role="alert">{form.error}</p>
	{/if}

	<!-- Status filter tabs -->
	<nav class="status-tabs" aria-label="Filter by status">
		{#each STATUSES as s}
			<a
				href="/admin/orders?status={s}{data.q ? `&q=${encodeURIComponent(data.q)}` : ''}"
				class="tab"
				class:active={data.status === s}
			>{s === 'all' ? 'All' : STATUS_LABELS[s]}</a>
		{/each}
	</nav>

	<!-- Search + Date range -->
	<form method="GET" action="/admin/orders" class="search-bar">
		<input type="hidden" name="status" value={data.status} />
		<input
			type="search"
			name="q"
			value={data.q}
			placeholder="Search order number, name, email…"
			class="search-input"
		/>
		<input type="date" name="from" value={data.from} class="date-input" title="From date" />
		<input type="date" name="to" value={data.to} class="date-input" title="To date" />
		<button type="submit" class="btn btn-outline">Filter</button>
		{#if data.from || data.to}
			<a href="/admin/orders?status={data.status}" class="btn btn-ghost clear-btn">Clear dates</a>
		{/if}
	</form>

	<!-- Copy bar — only shown when date range is active -->
	{#if canCopy && data.orders.length > 0}
		<div class="copy-bar">
			<span class="copy-label">{data.orders.length} order{data.orders.length !== 1 ? 's' : ''} in range</span>
			<button type="button" class="btn btn-outline copy-btn" onclick={copyOrders}>
				{copyFeedback || 'Copy all orders'}
			</button>
		</div>
	{/if}

	{#if data.orders.length === 0}
		<p class="empty">No orders found.</p>
	{:else}
		<div class="table-wrap">
			<table class="orders-table">
				<thead>
					<tr>
						<th>Order #</th>
						<th>Customer</th>
						<th>Date</th>
						<th>Status</th>
						<th>Amount</th>
						<th>Next action</th>
					</tr>
				</thead>
				<tbody>
					{#each data.orders as order (order.id)}
						<tr>
							<td>
								<a href="/admin/orders/{order.id}" class="order-link">
									#{order.order_number}
								</a>
							</td>
							<td>
								<div class="customer-name">{order.customer_name}</div>
								<div class="customer-email">{order.customer_email}</div>
							</td>
							<td class="date-cell">{formatDate(order.created_at)}</td>
							<td><span class="badge badge-{order.status}">{STATUS_LABELS[order.status]}</span></td>
							<td class="amount-cell">{formatNaira(order.subtotal)}</td>
							<td>
								{#if VALID_NEXT[order.status]?.length}
									<form method="POST" action="?/updateStatus" use:enhance>
										<input type="hidden" name="id" value={order.id} />
										<select name="status" class="status-select" onchange={(e) => e.currentTarget.closest('form')?.requestSubmit()}>
											<option value="" disabled selected>Move to…</option>
											{#each VALID_NEXT[order.status] as next}
												<option value={next}>{STATUS_LABELS[next]}</option>
											{/each}
										</select>
									</form>
								{:else}
									<span class="terminal">—</span>
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

	.page-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-md);
	}

	.page-title { font-size: var(--text-h1); }

	.count {
		font-size: var(--text-small);
		color: var(--text-secondary);
	}

	.alert-error {
		background: rgba(188, 108, 37, 0.10);
		color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.30);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-small);
		max-width: none;
	}

	.status-tabs {
		display: flex;
		gap: 2px;
		flex-wrap: wrap;
	}

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

	.search-bar {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		align-items: center;
	}

	.search-input {
		flex: 1;
		min-width: 160px;
	}

	.date-input {
		width: 140px;
		flex-shrink: 0;
	}

	.clear-btn {
		color: var(--text-secondary);
		font-size: var(--text-small);
		text-decoration: none;
		padding: 6px 10px;
	}

	.copy-bar {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--bg-raised);
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-color);
	}

	.copy-label {
		font-size: var(--text-small);
		color: var(--text-secondary);
	}

	.copy-btn {
		margin-left: auto;
	}

	.empty {
		color: var(--text-secondary);
		font-size: var(--text-small);
		max-width: none;
	}

	.table-wrap { overflow-x: auto; }

	.orders-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}

	.orders-table th {
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

	.orders-table td {
		padding: var(--space-sm);
		border-bottom: 1px solid var(--border-color);
		vertical-align: middle;
	}

	.order-link {
		font-weight: 600;
		color: var(--text-primary);
		text-decoration: none;
	}

	.order-link:hover { text-decoration: underline; }

	.customer-name { font-weight: 500; }
	.customer-email { font-size: var(--text-micro); color: var(--text-secondary); }

	.date-cell { white-space: nowrap; color: var(--text-secondary); }
	.amount-cell { font-weight: 600; white-space: nowrap; }

	.badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 999px;
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.badge-pending  { background: #e5e7eb; color: #374151; }
	.badge-paid     { background: #dbeafe; color: #1e40af; }
	.badge-fulfilled { background: #fef3c7; color: #92400e; }
	.badge-delivered { background: #d1fae5; color: #065f46; }
	.badge-cancelled { background: #fee2e2; color: #991b1b; }
	.badge-refunded  { background: #ede9fe; color: #5b21b6; }

	.status-select {
		font-size: var(--text-micro);
		padding: 4px 8px;
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		background: var(--bg-page);
		color: var(--text-primary);
		cursor: pointer;
	}

	.terminal { color: var(--text-secondary); }
</style>
