import type { PageServerLoad } from './$types';

type TimeKey = string; // YYYY-MM-DD or YYYY-MM or YYYY-MM-DD HH

function dateFrom(range: string): string | null {
	const now = new Date();
	switch (range) {
		case 'today': {
			const d = new Date(now);
			d.setHours(0, 0, 0, 0);
			return d.toISOString();
		}
		case '7d':
			return new Date(now.getTime() - 7 * 86_400_000).toISOString();
		case '30d':
			return new Date(now.getTime() - 30 * 86_400_000).toISOString();
		default:
			return null;
	}
}

function timeKey(iso: string, range: string): TimeKey {
	if (range === 'all') return iso.slice(0, 7); // YYYY-MM
	if (range === 'today') return iso.slice(0, 13).replace('T', ' ') + ':00'; // YYYY-MM-DD HH:00
	return iso.slice(0, 10); // YYYY-MM-DD
}

function buildTimeSeries(
	range: string,
	from: string | null,
	map: Map<TimeKey, number>
): Array<{ label: string; revenue: number }> {
	if (range === 'all') {
		return [...map.entries()]
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([key, kobo]) => ({
				label: new Date(key + '-01').toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }),
				revenue: Math.round(kobo)
			}));
	}

	const result: Array<{ label: string; revenue: number }> = [];

	if (range === 'today') {
		for (let h = 0; h < 24; h++) {
			const d = new Date();
			d.setHours(h, 0, 0, 0);
			const key = d.toISOString().slice(0, 13).replace('T', ' ') + ':00';
			result.push({
				label: `${String(h).padStart(2, '0')}:00`,
				revenue: Math.round(map.get(key) ?? 0)
			});
		}
		return result;
	}

	const end = new Date();
	end.setHours(23, 59, 59, 999);
	const start = from ? new Date(from) : new Date(end.getTime() - 30 * 86_400_000);
	const cur = new Date(start);
	cur.setHours(0, 0, 0, 0);

	while (cur <= end) {
		const key = cur.toISOString().slice(0, 10);
		result.push({
			label: cur.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
			revenue: Math.round(map.get(key) ?? 0)
		});
		cur.setDate(cur.getDate() + 1);
	}
	return result;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const range = url.searchParams.get('range') ?? '30d';
	const from = dateFrom(range);

	// Parallel: paid orders in range, all-orders status counts, active products, low stock
	const [paidRes, allStatusRes, productsRes, lowStockRes] = await Promise.all([
		(() => {
			let q = locals.supabaseAdmin
				.from('orders')
				.select('id, subtotal, created_at')
				.in('status', ['paid', 'fulfilled', 'delivered']);
			if (from) q = q.gte('created_at', from);
			return q;
		})(),
		(() => {
			let q = locals.supabaseAdmin.from('orders').select('status');
			if (from) q = q.gte('created_at', from);
			return q;
		})(),
		locals.supabaseAdmin
			.from('products')
			.select('id', { count: 'exact', head: true })
			.eq('published', true),
		locals.supabaseAdmin
			.from('product_variants')
			.select('id, size, stock_quantity, product_colours(colour_name, products(name))')
			.lte('stock_quantity', 5)
			.order('stock_quantity', { ascending: true })
			.limit(10)
	]);

	const paidOrders = (paidRes.data ?? []) as any[];
	const allOrders = (allStatusRes.data ?? []) as any[];
	const activeProducts = productsRes.count ?? 0;
	const lowStockRows = (lowStockRes.data ?? []) as any[];

	// Fetch order items for the paid orders in range
	const orderIds = paidOrders.map((o: any) => o.id);
	let items: any[] = [];
	if (orderIds.length > 0) {
		const { data } = await locals.supabaseAdmin
			.from('order_items')
			.select(
				'product_name, quantity, unit_price, product_variants(product_colours(products(categories(name))))'
			)
			.in('order_id', orderIds);
		items = (data ?? []) as any[];
	}

	// ── Stat cards ──────────────────────────────────────────────────────────
	const totalRevenue = paidOrders.reduce((s: number, o: any) => s + o.subtotal, 0);
	const orderCount = paidOrders.length;
	const aov = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

	// ── Revenue over time ────────────────────────────────────────────────────
	const revenueMap = new Map<TimeKey, number>();
	for (const o of paidOrders) {
		const key = timeKey(o.created_at, range);
		revenueMap.set(key, (revenueMap.get(key) ?? 0) + o.subtotal);
	}
	const revenueByTime = buildTimeSeries(range, from, revenueMap);

	// ── Best sellers ─────────────────────────────────────────────────────────
	const unitMap = new Map<string, number>();
	const revItemMap = new Map<string, number>();
	for (const item of items) {
		unitMap.set(item.product_name, (unitMap.get(item.product_name) ?? 0) + item.quantity);
		revItemMap.set(
			item.product_name,
			(revItemMap.get(item.product_name) ?? 0) + item.unit_price * item.quantity
		);
	}
	const bestByUnits = [...unitMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 8)
		.map(([name, units]) => ({ name, units }));
	const bestByRevenue = [...revItemMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 8)
		.map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }));

	// ── Order status breakdown ────────────────────────────────────────────────
	const statusMap = new Map<string, number>();
	for (const o of allOrders) statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
	const statusBreakdown = (
		['pending', 'paid', 'fulfilled', 'delivered', 'cancelled', 'refunded'] as const
	)
		.map((s) => ({ status: s, count: statusMap.get(s) ?? 0 }))
		.filter((s) => s.count > 0);

	// ── Revenue by category ──────────────────────────────────────────────────
	const catMap = new Map<string, number>();
	for (const item of items) {
		const cat =
			item.product_variants?.product_colours?.products?.categories?.name ?? 'Uncategorised';
		catMap.set(cat, (catMap.get(cat) ?? 0) + item.unit_price * item.quantity);
	}
	const revenueByCategory = [...catMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.map(([name, kobo]) => ({ name, revenue: Math.round(kobo) }));

	// ── Low-stock alerts ──────────────────────────────────────────────────────
	const lowStock = lowStockRows.map((v: any) => ({
		product: v.product_colours?.products?.name ?? '?',
		colour: v.product_colours?.colour_name ?? '?',
		size: v.size,
		stock: v.stock_quantity
	}));

	return {
		range,
		stats: { totalRevenue, orderCount, aov, activeProducts },
		revenueByTime,
		bestByUnits,
		bestByRevenue,
		statusBreakdown,
		revenueByCategory,
		lowStock
	};
};
