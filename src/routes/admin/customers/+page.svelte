<script lang="ts">
	import type { PageData } from './$types';
	import { formatNaira } from '$lib/format';

	const { data }: { data: PageData } = $props();

	let search = $state('');

	const filtered = $derived(
		search.trim().length < 2
			? data.customers
			: data.customers.filter((c) => {
					const q = search.toLowerCase();
					return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
				})
	);

	function fmtDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Customers — Shop With Mercy Admin</title>
</svelte:head>

<div class="page-header">
	<h1 class="page-title">Customers</h1>
	<span class="count-badge">{data.customers.length} total</span>
</div>

<div class="toolbar">
	<input
		type="search"
		class="search-input"
		placeholder="Search name or email…"
		bind:value={search}
	/>
</div>

{#if filtered.length === 0}
	<p class="empty-note">No customers found.</p>
{:else}
	<div class="table-wrap">
		<table class="data-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Email</th>
					<th>Phone</th>
					<th class="num-col">Orders</th>
					<th class="num-col">LTV</th>
					<th>Last order</th>
					<th>Account</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as c}
					<tr>
						<td class="name-cell">
							<a href="/admin/customers/{encodeURIComponent(c.email)}" class="name-link">{c.name}</a>
						</td>
						<td class="email-cell">{c.email}</td>
						<td class="phone-cell">{c.phone}</td>
						<td class="num-col">{c.orderCount}</td>
						<td class="num-col ltv-col">{formatNaira(c.ltv)}</td>
						<td class="date-cell">{fmtDate(c.lastOrderAt)}</td>
						<td>
							{#if c.hasAccount}
								<span class="badge badge-green">Registered</span>
							{:else}
								<span class="badge badge-gray">Guest</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.page-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.page-title { font-size: 1.5rem; font-weight: 700; }

	.count-badge {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		background: #f3f4f6;
		border-radius: 9999px;
		padding: 2px 10px;
	}

	.toolbar {
		margin-bottom: 1.25rem;
	}

	.search-input {
		width: 100%;
		max-width: 360px;
		padding: 8px 12px;
		border: 1.5px solid #e5e7eb;
		border-radius: 8px;
		font-size: 0.875rem;
		background: #fff;
		color: #111;
		outline: none;
		transition: border-color 0.15s;
	}

	.search-input:focus { border-color: #9ca3af; }

	.table-wrap {
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 1px 4px rgba(0,0,0,0.06);
		overflow-x: auto;
	}

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
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e5e7eb;
		white-space: nowrap;
	}

	.data-table td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f3f4f6;
		color: #374151;
		vertical-align: middle;
	}

	.data-table tr:last-child td { border-bottom: none; }

	.data-table tr:hover td { background: #f9fafb; }

	.num-col { text-align: right; }

	.name-link {
		font-weight: 600;
		color: #111;
		text-decoration: none;
	}

	.name-link:hover { color: #7e6c5a; text-decoration: underline; }

	.email-cell { color: #6b7280; }
	.phone-cell { color: #6b7280; }
	.date-cell  { color: #6b7280; white-space: nowrap; }

	.ltv-col { font-weight: 600; color: #111; }

	.badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 9999px;
		font-size: 0.7rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.badge-green { background: #d1fae5; color: #065f46; }
	.badge-gray  { background: #f3f4f6; color: #6b7280; }

	.empty-note {
		color: #9ca3af;
		font-size: 0.875rem;
		padding: 2rem 0;
	}
</style>
