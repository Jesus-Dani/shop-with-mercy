<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const ranges = [
		{ value: 'today', label: 'Today' },
		{ value: '7d', label: '7 days' },
		{ value: '30d', label: '30 days' },
		{ value: 'all', label: 'All time' }
	];

	function pct(a: number, b: number) {
		if (b === 0) return 0;
		return Math.round((a / b) * 100);
	}

	const viewToCart   = $derived(pct(data.funnel.carts,     data.funnel.views));
	const cartToCheck  = $derived(pct(data.funnel.checkouts, data.funnel.carts));
	const checkToPurch = $derived(pct(data.funnel.purchases, data.funnel.checkouts));

	let chartCanvas: HTMLCanvasElement | undefined = $state();

	onMount(async () => {
		if (!chartCanvas || data.viewsOverTime.length === 0) return;

		const { Chart, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } =
			await import('chart.js');

		Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

		new Chart(chartCanvas, {
			type: 'line',
			data: {
				labels: data.viewsOverTime.map((p) => p.label),
				datasets: [
					{
						label: 'Product views',
						data: data.viewsOverTime.map((p) => p.count),
						fill: true,
						tension: 0.4,
						borderColor: '#7e6c5a',
						backgroundColor: 'rgba(126,108,90,0.12)',
						pointRadius: data.viewsOverTime.length > 60 ? 0 : 3,
						pointHoverRadius: 5
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							color: '#9ca3af',
							maxTicksLimit: data.viewsOverTime.length > 30 ? 8 : undefined,
							maxRotation: 0
						}
					},
					y: {
						beginAtZero: true,
						grid: { color: 'rgba(0,0,0,0.05)' },
						ticks: { color: '#9ca3af', precision: 0 }
					}
				}
			}
		});
	});
</script>

<svelte:head>
	<title>Analytics — Shop With Mercy Admin</title>
</svelte:head>

<div class="analytics-page">
	<div class="page-header">
		<h1 class="page-title">Behavioural Analytics</h1>

		<div class="range-tabs" role="tablist" aria-label="Date range">
			{#each ranges as r}
				<a
					href="?range={r.value}"
					class="range-tab"
					class:active={data.range === r.value}
					role="tab"
					aria-selected={data.range === r.value}
				>{r.label}</a>
			{/each}
		</div>
	</div>

	<!-- Funnel -->
	<section class="section">
		<h2 class="section-title">Conversion Funnel</h2>
		<div class="funnel-row">
			<div class="funnel-step">
				<span class="funnel-label">Product views</span>
				<span class="funnel-count">{data.funnel.views.toLocaleString()}</span>
			</div>

			<div class="funnel-arrow" aria-hidden="true">
				<span class="arrow-rate">{viewToCart}%</span>
				<svg width="32" height="20" viewBox="0 0 32 20" fill="none">
					<path d="M0 10 H28 M20 2 L28 10 L20 18" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>

			<div class="funnel-step">
				<span class="funnel-label">Added to cart</span>
				<span class="funnel-count">{data.funnel.carts.toLocaleString()}</span>
			</div>

			<div class="funnel-arrow" aria-hidden="true">
				<span class="arrow-rate">{cartToCheck}%</span>
				<svg width="32" height="20" viewBox="0 0 32 20" fill="none">
					<path d="M0 10 H28 M20 2 L28 10 L20 18" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>

			<div class="funnel-step">
				<span class="funnel-label">Checkout started</span>
				<span class="funnel-count">{data.funnel.checkouts.toLocaleString()}</span>
			</div>

			<div class="funnel-arrow" aria-hidden="true">
				<span class="arrow-rate">{checkToPurch}%</span>
				<svg width="32" height="20" viewBox="0 0 32 20" fill="none">
					<path d="M0 10 H28 M20 2 L28 10 L20 18" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>

			<div class="funnel-step funnel-step--last">
				<span class="funnel-label">Purchases</span>
				<span class="funnel-count">{data.funnel.purchases.toLocaleString()}</span>
			</div>
		</div>

		<!-- Mobile funnel (stacked) -->
		<div class="funnel-stack" aria-hidden="true">
			<div class="funnel-stack-step">
				<span class="funnel-label">Product views</span>
				<span class="funnel-count">{data.funnel.views.toLocaleString()}</span>
			</div>
			<div class="funnel-stack-rate">{viewToCart}% added to cart</div>
			<div class="funnel-stack-step">
				<span class="funnel-label">Added to cart</span>
				<span class="funnel-count">{data.funnel.carts.toLocaleString()}</span>
			</div>
			<div class="funnel-stack-rate">{cartToCheck}% started checkout</div>
			<div class="funnel-stack-step">
				<span class="funnel-label">Checkout started</span>
				<span class="funnel-count">{data.funnel.checkouts.toLocaleString()}</span>
			</div>
			<div class="funnel-stack-rate">{checkToPurch}% purchased</div>
			<div class="funnel-stack-step funnel-step--last">
				<span class="funnel-label">Purchases</span>
				<span class="funnel-count">{data.funnel.purchases.toLocaleString()}</span>
			</div>
		</div>
	</section>

	<!-- Views over time -->
	<section class="section">
		<h2 class="section-title">Product Views Over Time</h2>
		{#if data.viewsOverTime.every((p) => p.count === 0)}
			<p class="empty-note">No views recorded in this range.</p>
		{:else}
			<div class="chart-wrap">
				<canvas bind:this={chartCanvas}></canvas>
			</div>
		{/if}
	</section>

	<!-- Viewed not bought -->
	<section class="section">
		<h2 class="section-title">Viewed Often, Rarely Added to Cart</h2>
		<p class="section-sub">Top 15 most-viewed products — low cart rate may signal pricing or photo issues.</p>

		{#if data.viewedNotBought.length === 0}
			<p class="empty-note">No product view data in this range.</p>
		{:else}
			<div class="table-wrap">
				<table class="data-table">
					<thead>
						<tr>
							<th>Product</th>
							<th class="num-col">Views</th>
							<th class="num-col">Added to cart</th>
							<th class="num-col">Cart rate</th>
						</tr>
					</thead>
					<tbody>
						{#each data.viewedNotBought as row}
							<tr class:low-rate={row.cartRate < 10}>
								<td class="product-name">{row.name}</td>
								<td class="num-col">{row.views.toLocaleString()}</td>
								<td class="num-col">{row.carts.toLocaleString()}</td>
								<td class="num-col">
									<span class="rate-badge" class:rate-bad={row.cartRate < 5} class:rate-ok={row.cartRate >= 5 && row.cartRate < 20} class:rate-good={row.cartRate >= 20}>
										{row.cartRate}%
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>

<style>
	.analytics-page {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.page-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.page-title {
		font-size: var(--text-h1);
		font-weight: 700;
		color: var(--text-primary);
	}

	.range-tabs {
		display: flex;
		gap: 0.25rem;
		background: var(--bg-page);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 4px;
	}

	.range-tab {
		padding: 6px 14px;
		border-radius: 6px;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		transition: all 0.15s;
	}

	.range-tab:hover {
		color: var(--text-primary);
		background: var(--bg-card);
	}

	.range-tab.active {
		background: var(--bg-card);
		color: var(--text-primary);
		box-shadow: 0 1px 3px rgba(0,0,0,0.12);
	}

	.section {
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		padding: 1.5rem;
	}

	.section-title {
		font-size: var(--text-h3);
		font-weight: 600;
		margin-bottom: 1.25rem;
		color: var(--text-primary);
	}

	.section-sub {
		font-size: var(--text-small);
		color: var(--text-secondary);
		margin-top: -0.75rem;
		margin-bottom: 1.25rem;
		max-width: none;
	}

	/* Funnel (desktop) */
	.funnel-row {
		display: none;
		align-items: center;
		gap: 0.5rem;
	}

	@media (min-width: 700px) {
		.funnel-row { display: flex; }
		.funnel-stack { display: none; }
	}

	.funnel-step {
		flex: 1;
		min-width: 0;
		background: var(--bg-page);
		border-radius: 10px;
		padding: 1rem 0.75rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid var(--border-color);
	}

	.funnel-step--last {
		background: rgba(221, 161, 94, 0.10);
		border-color: rgba(221, 161, 94, 0.35);
	}

	.funnel-label {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		text-align: center;
		line-height: 1.3;
	}

	.funnel-count {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.funnel-arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.arrow-rate {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	/* Funnel (mobile stacked) */
	.funnel-stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
	}

	.funnel-stack-step {
		width: 100%;
		background: var(--bg-page);
		border-radius: 10px;
		padding: 0.875rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border: 1px solid var(--border-color);
	}

	.funnel-stack-step.funnel-step--last {
		background: rgba(221, 161, 94, 0.10);
		border-color: rgba(221, 161, 94, 0.35);
	}

	.funnel-stack-rate {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		padding: 0.25rem 0;
	}

	/* Chart */
	.chart-wrap {
		height: 280px;
		position: relative;
	}

	/* Table */
	.table-wrap {
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}

	.data-table th {
		text-align: left;
		font-size: var(--text-micro);
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--border-color);
	}

	.data-table td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--border-color);
		color: var(--text-primary);
	}

	.data-table tr:last-child td { border-bottom: none; }

	.data-table tr.low-rate td { background: rgba(221, 161, 94, 0.06); }

	.num-col { text-align: right; }

	.product-name {
		font-weight: 500;
		max-width: 280px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rate-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 9999px;
		font-size: var(--text-micro);
		font-weight: 600;
	}

	.rate-bad  { background: rgba(153, 27, 27, 0.12); color: #c0392b; }
	.rate-ok   { background: rgba(146, 64, 14, 0.12); color: var(--color-copperwood); }
	.rate-good { background: rgba(96, 108, 56, 0.15); color: var(--color-olive-leaf); }

	.empty-note {
		color: var(--text-secondary);
		font-size: var(--text-small);
		text-align: center;
		padding: 2rem 0;
		max-width: none;
	}
</style>
