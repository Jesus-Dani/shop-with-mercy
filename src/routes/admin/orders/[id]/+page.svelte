<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const o: any = $derived(data.order);

	const STATUS_LABELS: Record<string, string> = {
		pending: 'Pending', paid: 'Paid', fulfilled: 'Fulfilled',
		delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded'
	};

	function formatNaira(naira: number) {
		return '₦' + Math.round(naira).toLocaleString('en-NG');
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('en-NG', {
			day: 'numeric', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	}

	let updating = $state(false);
</script>

<svelte:head><title>Order #{o.order_number} — SWM Admin</title></svelte:head>

<div class="page">
	<div class="page-header">
		<a href="/admin/orders" class="back-link">← Orders</a>
		<h1 class="page-title">Order #{o.order_number}</h1>
		<span class="badge badge-{o.status}">{STATUS_LABELS[o.status]}</span>
	</div>

	{#if form?.error}
		<p class="alert-error" role="alert">{form.error}</p>
	{/if}
	{#if form?.success}
		<p class="alert-success" role="status">Status updated to <strong>{STATUS_LABELS[form.newStatus]}</strong>.</p>
	{/if}

	<div class="grid">
		<!-- Left column: customer + order meta -->
		<div class="col">
			<section class="card">
				<h2 class="card-title">Customer</h2>
				<dl class="detail-list">
					<dt>Name</dt><dd>{o.customer_name}</dd>
					<dt>Email</dt><dd><a href="mailto:{o.customer_email}">{o.customer_email}</a></dd>
					<dt>Phone</dt><dd>{o.customer_phone}</dd>
				</dl>
			</section>

			<section class="card">
				<h2 class="card-title">Order details</h2>
				<dl class="detail-list">
					<dt>Placed</dt><dd>{formatDate(o.created_at)}</dd>
					<dt>Delivery</dt><dd>{o.delivery_type === 'within_run' ? 'Within run' : 'Outside run'}</dd>
					<dt>Paystack ref</dt><dd class="mono">{o.paystack_reference}</dd>
					{#if o.paystack_channel}<dt>Channel</dt><dd>{o.paystack_channel}</dd>{/if}
				</dl>
			</section>

			<!-- Status update -->
			{#if data.validNext.length > 0}
				<section class="card">
					<h2 class="card-title">Update status</h2>
					<form
						method="POST"
						action="?/updateStatus"
						class="status-form"
						use:enhance={() => {
							updating = true;
							return async ({ update }) => { updating = false; await update(); await invalidateAll(); };
						}}
					>
						{#each data.validNext as next}
							<button
								type="submit"
								name="status"
								value={next}
								class="btn btn-status btn-status-{next}"
								disabled={updating}
							>
								Mark as {STATUS_LABELS[next]}
							</button>
						{/each}
					</form>
				</section>
			{/if}
		</div>

		<!-- Right column: line items -->
		<div class="col">
			<section class="card">
				<h2 class="card-title">Items</h2>
				<table class="items-table">
					<thead>
						<tr>
							<th>Product</th>
							<th>Colour</th>
							<th>Size</th>
							<th>Qty</th>
							<th>Unit price</th>
							<th>Total</th>
						</tr>
					</thead>
					<tbody>
						{#each o.order_items as item (item.id)}
							{@const productId = item.product_variants?.product_colours?.product_id ?? null}
							<tr>
								<td>
									{#if productId}
										<a href="/admin/products/{productId}" class="product-link">{item.product_name}</a>
									{:else}
										{item.product_name}
									{/if}
								</td>
								<td>{item.colour_name}</td>
								<td>{item.size}</td>
								<td>{item.quantity}</td>
								<td>{formatNaira(item.unit_price)}</td>
								<td class="fw">{formatNaira(item.unit_price * item.quantity)}</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td colspan="5" class="subtotal-label">Subtotal</td>
							<td class="subtotal-amount">{formatNaira(o.subtotal)}</td>
						</tr>
					</tfoot>
				</table>
			</section>
		</div>
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: var(--space-lg); }

	.page-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.back-link {
		font-size: var(--text-small);
		color: var(--text-secondary);
		text-decoration: none;
		flex-shrink: 0;
	}

	.back-link:hover { color: var(--text-primary); }

	.page-title { font-size: var(--text-h1); }

	.badge {
		display: inline-block;
		padding: 3px 10px;
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

	.alert-error {
		background: rgba(188, 108, 37, 0.10);
		color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.30);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-small);
		max-width: none;
	}

	.alert-success {
		background: rgba(96, 108, 56, 0.08);
		color: #065f46;
		border: 1px solid rgba(96, 108, 56, 0.25);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-small);
		max-width: none;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
	}

	@media (min-width: 900px) {
		.grid { grid-template-columns: 340px 1fr; }
	}

	.col { display: flex; flex-direction: column; gap: var(--space-md); }

	.card {
		background: var(--bg-raised);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.card-title {
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.detail-list {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 6px var(--space-md);
		font-size: var(--text-small);
	}

	dt { color: var(--text-secondary); white-space: nowrap; }
	dd { margin: 0; }
	a { color: var(--text-primary); }
	.mono { font-family: monospace; font-size: 12px; }

	.status-form { display: flex; flex-direction: column; gap: var(--space-sm); }

	.btn-status {
		width: 100%;
		padding: 10px;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		cursor: pointer;
		border: 1px solid;
		transition: opacity var(--transition-fast);
	}

	.btn-status:disabled { opacity: 0.5; cursor: not-allowed; }

	.btn-status-paid       { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
	.btn-status-fulfilled  { background: #fef3c7; color: #92400e; border-color: #fde68a; }
	.btn-status-delivered  { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
	.btn-status-cancelled  { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
	.btn-status-refunded   { background: #ede9fe; color: #5b21b6; border-color: #ddd6fe; }

	.items-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}

	.items-table th {
		text-align: left;
		padding: var(--space-xs) var(--space-sm);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border-color);
		white-space: nowrap;
	}

	.items-table td {
		padding: var(--space-sm);
		border-bottom: 1px solid var(--border-color);
		vertical-align: middle;
	}

	.items-table tfoot td {
		border-bottom: none;
		border-top: 2px solid var(--border-color);
		padding-top: var(--space-md);
	}

	.product-link {
		color: var(--text-primary);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.product-link:hover { color: var(--color-copperwood); }

	.fw { font-weight: 600; }
	.subtotal-label { text-align: right; color: var(--text-secondary); font-size: var(--text-small); }
	.subtotal-amount { font-weight: 700; font-size: var(--text-body); white-space: nowrap; }
</style>
