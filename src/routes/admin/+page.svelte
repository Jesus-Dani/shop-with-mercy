<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Canvas references
	let revenueCanvas: HTMLCanvasElement;
	let unitsCanvas: HTMLCanvasElement;
	let revCanvas: HTMLCanvasElement;
	let statusCanvas: HTMLCanvasElement;
	let catCanvas: HTMLCanvasElement;

	let chartInstances: any[] = [];

	const RANGE_LABELS: Record<string, string> = { today: 'Today', '7d': '7 days', '30d': '30 days', all: 'All time' };

	const STATUS_COLORS: Record<string, string> = {
		pending: '#9ca3af', paid: '#60a5fa', fulfilled: '#fbbf24',
		delivered: '#34d399', cancelled: '#f87171', refunded: '#a78bfa'
	};

	const PALETTE = ['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444','#06b6d4','#f97316','#84cc16'];

	function fmt(kobo: number) {
		return '₦' + (kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });
	}

	function makeHBar(canvas: HTMLCanvasElement, Chart: any, labels: string[], values: number[], palette: string | string[], labelStr: string, tickFmt?: (v: any) => string) {
		return new Chart(canvas, {
			type: 'bar',
			data: {
				labels,
				datasets: [{
					label: labelStr,
					data: values,
					backgroundColor: palette,
					borderRadius: 4
				}]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				scales: {
					x: {
						beginAtZero: true,
						ticks: tickFmt ? { callback: tickFmt } : { precision: 0 },
						grid: { color: 'rgba(0,0,0,0.05)' }
					},
					y: { grid: { display: false } }
				}
			}
		});
	}

	onMount(async () => {
		const { Chart, registerables } = await import('chart.js');
		Chart.register(...registerables);

		// Revenue over time — line/area
		if (revenueCanvas && data.revenueByTime.length > 0) {
			chartInstances.push(new Chart(revenueCanvas, {
				type: 'line',
				data: {
					labels: data.revenueByTime.map((d: any) => d.label),
					datasets: [{
						label: 'Revenue (₦)',
						data: data.revenueByTime.map((d: any) => d.revenue),
						borderColor: '#3b82f6',
						backgroundColor: 'rgba(59,130,246,0.10)',
						fill: true,
						tension: 0.35,
						pointRadius: data.revenueByTime.length > 20 ? 0 : 3,
						borderWidth: 2
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						y: {
							beginAtZero: true,
							ticks: { callback: (v: any) => '₦' + Number(v).toLocaleString() },
							grid: { color: 'rgba(0,0,0,0.05)' }
						},
						x: { ticks: { maxTicksLimit: 10 }, grid: { display: false } }
					}
				}
			}));
		}

		// Best sellers by units
		if (unitsCanvas && data.bestByUnits.length > 0) {
			chartInstances.push(makeHBar(
				unitsCanvas, Chart,
				data.bestByUnits.map((d: any) => d.name),
				data.bestByUnits.map((d: any) => d.units),
				PALETTE,
				'Units sold'
			));
		}

		// Best sellers by revenue
		if (revCanvas && data.bestByRevenue.length > 0) {
			chartInstances.push(makeHBar(
				revCanvas, Chart,
				data.bestByRevenue.map((d: any) => d.name),
				data.bestByRevenue.map((d: any) => d.revenue),
				PALETTE,
				'Revenue (₦)',
				(v: any) => '₦' + Number(v).toLocaleString()
			));
		}

		// Order status — 100% stacked horizontal bar
		if (statusCanvas && data.statusBreakdown.length > 0) {
			const total = data.statusBreakdown.reduce((s: number, d: any) => s + d.count, 0);
			chartInstances.push(new Chart(statusCanvas, {
				type: 'bar',
				data: {
					labels: ['Orders'],
					datasets: data.statusBreakdown.map((s: any) => ({
						label: s.status.charAt(0).toUpperCase() + s.status.slice(1),
						data: [s.count],
						backgroundColor: STATUS_COLORS[s.status] ?? '#9ca3af',
						borderRadius: 3
					}))
				},
				options: {
					indexAxis: 'y',
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
						tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} (${Math.round((Number(ctx.raw) / total) * 100)}%)` } }
					},
					scales: {
						x: { stacked: true, display: false },
						y: { stacked: true, display: false }
					}
				}
			}));
		}

		// Revenue by category — 100% stacked horizontal bar
		if (catCanvas && data.revenueByCategory.length > 0) {
			const total = data.revenueByCategory.reduce((s: number, d: any) => s + d.revenue, 0);
			chartInstances.push(new Chart(catCanvas, {
				type: 'bar',
				data: {
					labels: ['Revenue'],
					datasets: data.revenueByCategory.map((c: any, i: number) => ({
						label: c.name,
						data: [c.revenue],
						backgroundColor: PALETTE[i % PALETTE.length],
						borderRadius: 3
					}))
				},
				options: {
					indexAxis: 'y',
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
						tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ₦${Number(ctx.raw).toLocaleString()} (${Math.round((Number(ctx.raw) / total) * 100)}%)` } }
					},
					scales: {
						x: { stacked: true, display: false },
						y: { stacked: true, display: false }
					}
				}
			}));
		}
	});

	onDestroy(() => {
		chartInstances.forEach((c) => c.destroy());
	});
</script>

<svelte:head>
	<title>Dashboard — SWM Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="dashboard">

	<!-- Header + range selector -->
	<div class="dash-header">
		<h1 class="dash-title">Dashboard</h1>
		<nav class="range-tabs" aria-label="Date range">
			{#each Object.entries(RANGE_LABELS) as [key, label]}
				<a href="?range={key}" class="range-tab" class:active={data.range === key}>{label}</a>
			{/each}
		</nav>
	</div>

	<!-- Stat cards -->
	<div class="stat-grid">
		<div class="stat-card">
			<span class="stat-label">Revenue</span>
			<span class="stat-value">{fmt(data.stats.totalRevenue)}</span>
			<span class="stat-sub">paid orders only</span>
		</div>
		<div class="stat-card">
			<span class="stat-label">Orders</span>
			<span class="stat-value">{data.stats.orderCount.toLocaleString()}</span>
			<span class="stat-sub">paid, fulfilled, delivered</span>
		</div>
		<div class="stat-card">
			<span class="stat-label">Avg. order value</span>
			<span class="stat-value">{fmt(data.stats.aov)}</span>
			<span class="stat-sub">per paid order</span>
		</div>
		<div class="stat-card">
			<span class="stat-label">Active products</span>
			<span class="stat-value">{data.stats.activeProducts.toLocaleString()}</span>
			<span class="stat-sub">published in catalogue</span>
		</div>
	</div>

	<!-- Revenue over time -->
	<section class="chart-section">
		<h2 class="section-title">Revenue over time</h2>
		{#if data.revenueByTime.some((d: any) => d.revenue > 0)}
			<div class="chart-wrap chart-tall">
				<canvas bind:this={revenueCanvas}></canvas>
			</div>
		{:else}
			<p class="empty-chart">No revenue data for this period.</p>
		{/if}
	</section>

	<!-- Best sellers -->
	<div class="two-col">
		<section class="chart-section">
			<h2 class="section-title">Best sellers — units</h2>
			{#if data.bestByUnits.length > 0}
				<div class="chart-wrap" style="height: {Math.max(180, data.bestByUnits.length * 36)}px">
					<canvas bind:this={unitsCanvas}></canvas>
				</div>
			{:else}
				<p class="empty-chart">No sales data yet.</p>
			{/if}
		</section>

		<section class="chart-section">
			<h2 class="section-title">Best sellers — revenue</h2>
			{#if data.bestByRevenue.length > 0}
				<div class="chart-wrap" style="height: {Math.max(180, data.bestByRevenue.length * 36)}px">
					<canvas bind:this={revCanvas}></canvas>
				</div>
			{:else}
				<p class="empty-chart">No sales data yet.</p>
			{/if}
		</section>
	</div>

	<!-- Status + category breakdown -->
	<div class="two-col">
		<section class="chart-section">
			<h2 class="section-title">Order status split</h2>
			{#if data.statusBreakdown.length > 0}
				<div class="chart-wrap chart-stacked">
					<canvas bind:this={statusCanvas}></canvas>
				</div>
			{:else}
				<p class="empty-chart">No orders in this period.</p>
			{/if}
		</section>

		<section class="chart-section">
			<h2 class="section-title">Revenue by category</h2>
			{#if data.revenueByCategory.length > 0}
				<div class="chart-wrap chart-stacked">
					<canvas bind:this={catCanvas}></canvas>
				</div>
			{:else}
				<p class="empty-chart">No sales data yet.</p>
			{/if}
		</section>
	</div>

	<!-- Low stock alerts -->
	{#if data.lowStock.length > 0}
		<section class="alert-section">
			<h2 class="section-title">
				<span class="alert-dot"></span>
				Low stock alerts
			</h2>
			<div class="alert-table-wrap">
				<table class="alert-table">
					<thead>
						<tr>
							<th>Product</th>
							<th>Colour</th>
							<th>Size</th>
							<th>In stock</th>
						</tr>
					</thead>
					<tbody>
						{#each data.lowStock as row}
							<tr class={row.stock === 0 ? 'row-out' : 'row-low'}>
								<td>{row.product}</td>
								<td>{row.colour}</td>
								<td class="fw">{row.size}</td>
								<td>
									<span class="stock-badge {row.stock === 0 ? 'badge-out' : 'badge-low'}">
										{row.stock === 0 ? 'Out' : row.stock}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<a href="/admin/inventory" class="inv-link">View full inventory →</a>
		</section>
	{/if}

	<!-- Quick links -->
	<nav class="quick-links" aria-label="Quick access">
		<a href="/admin/products" class="quick-link">Products</a>
		<a href="/admin/orders" class="quick-link">Orders</a>
		<a href="/admin/inventory" class="quick-link">Inventory</a>
		<a href="/admin/categories" class="quick-link">Categories</a>
		<a href="/admin/reviews" class="quick-link">Reviews</a>
		<a href="/" class="quick-link">← Storefront</a>
	</nav>

</div>

<style>
	.dashboard { display: flex; flex-direction: column; gap: var(--space-xl); }

	/* Header */
	.dash-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-md);
	}

	.dash-title { font-size: var(--text-h1); }

	.range-tabs { display: flex; gap: 2px; }

	.range-tab {
		padding: 6px 14px;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast), color var(--transition-fast);
	}

	.range-tab:hover { background: var(--bg-raised); color: var(--text-primary); }
	.range-tab.active { background: var(--color-black-forest); color: var(--color-cornsilk); }

	/* Stat cards */
	.stat-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);
	}

	@media (min-width: 720px) {
		.stat-grid { grid-template-columns: repeat(4, 1fr); }
	}

	.stat-card {
		background: var(--bg-raised);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.stat-label {
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.stat-value {
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.stat-sub {
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	/* Charts */
	.two-col {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
	}

	@media (min-width: 800px) {
		.two-col { grid-template-columns: 1fr 1fr; }
	}

	.chart-section {
		background: var(--bg-raised);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.section-title {
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.chart-wrap { position: relative; width: 100%; }
	.chart-tall { height: 220px; }
	.chart-stacked { height: 200px; }

	.empty-chart {
		font-size: var(--text-small);
		color: var(--text-secondary);
		padding: var(--space-lg) 0;
		max-width: none;
	}

	/* Low stock alerts */
	.alert-section {
		background: #fff9f0;
		border: 1px solid #fde68a;
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.alert-dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #f59e0b;
	}

	.alert-table-wrap { overflow-x: auto; }

	.alert-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}

	.alert-table th {
		text-align: left;
		padding: var(--space-xs) var(--space-sm);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
		border-bottom: 1px solid #fde68a;
	}

	.alert-table td {
		padding: var(--space-sm);
		border-bottom: 1px solid rgba(253, 230, 138, 0.4);
	}

	.row-out td { background: #fff5f5; }
	.fw { font-weight: 600; }

	.stock-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 999px;
		font-size: var(--text-micro);
		font-weight: 700;
	}

	.badge-out { background: #fee2e2; color: #991b1b; }
	.badge-low { background: #fef3c7; color: #92400e; }

	.inv-link {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		align-self: flex-start;
	}

	.inv-link:hover { color: var(--text-primary); text-decoration: underline; }

	/* Quick links */
	.quick-links {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		padding-top: var(--space-sm);
		border-top: 1px solid var(--border-color);
	}

	.quick-link {
		padding: 6px 14px;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		transition: color var(--transition-fast), border-color var(--transition-fast);
	}

	.quick-link:hover { color: var(--text-primary); border-color: var(--text-secondary); }
</style>
