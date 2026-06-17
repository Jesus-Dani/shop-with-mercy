import type { PageServerLoad } from './$types';

function dateFrom(range: string): string | null {
	const now = new Date();
	switch (range) {
		case 'today': { const d = new Date(now); d.setHours(0,0,0,0); return d.toISOString(); }
		case '7d':  return new Date(now.getTime() - 7  * 86_400_000).toISOString();
		case '30d': return new Date(now.getTime() - 30 * 86_400_000).toISOString();
		default:    return null;
	}
}

function buildViewSeries(
	range: string,
	from: string | null,
	map: Map<string, number>
): Array<{ label: string; count: number }> {
	if (range === 'all') {
		return [...map.entries()]
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([key, count]) => ({
				label: new Date(key + '-01').toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }),
				count
			}));
	}

	const result: Array<{ label: string; count: number }> = [];
	if (range === 'today') {
		for (let h = 0; h < 24; h++) {
			const d = new Date(); d.setHours(h, 0, 0, 0);
			const key = d.toISOString().slice(0, 13).replace('T', ' ') + ':00';
			result.push({ label: `${String(h).padStart(2,'0')}:00`, count: map.get(key) ?? 0 });
		}
		return result;
	}

	const end = new Date(); end.setHours(23, 59, 59, 999);
	const start = from ? new Date(from) : new Date(end.getTime() - 30 * 86_400_000);
	const cur = new Date(start); cur.setHours(0, 0, 0, 0);
	while (cur <= end) {
		const key = cur.toISOString().slice(0, 10);
		result.push({
			label: cur.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
			count: map.get(key) ?? 0
		});
		cur.setDate(cur.getDate() + 1);
	}
	return result;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const range = url.searchParams.get('range') ?? '30d';
	const from  = dateFrom(range);

	// All queries use supabaseAdmin (service role) because page_events has RLS
	// with no SELECT policies — only service role can read it.
	const adminDb = locals.supabaseAdmin;

	function eventsOf(type: string) {
		let q = adminDb
			.from('page_events')
			.select('product_id, created_at')
			.eq('event_type', type);
		if (from) q = q.gte('created_at', from);
		return q;
	}

	// Parallel: one query per event type + products table for name resolution
	const [viewsRes, cartsRes, checkoutsRes, purchasesRes] = await Promise.all([
		eventsOf('product_view'),
		eventsOf('add_to_cart'),
		eventsOf('checkout_started'),
		eventsOf('purchase')
	]);

	const views     = (viewsRes.data     ?? []) as any[];
	const carts     = (cartsRes.data     ?? []) as any[];
	const checkouts = (checkoutsRes.data ?? []) as any[];
	const purchases = (purchasesRes.data ?? []) as any[];

	// ── Funnel ───────────────────────────────────────────────────────────────
	const funnel = {
		views:     views.length,
		carts:     carts.length,
		checkouts: checkouts.length,
		purchases: purchases.length
	};

	// ── Views over time ───────────────────────────────────────────────────────
	const viewMap = new Map<string, number>();
	for (const e of views) {
		const key = range === 'all'
			? e.created_at.slice(0, 7)
			: range === 'today'
				? e.created_at.slice(0, 13).replace('T', ' ') + ':00'
				: e.created_at.slice(0, 10);
		viewMap.set(key, (viewMap.get(key) ?? 0) + 1);
	}
	const viewsOverTime = buildViewSeries(range, from, viewMap);

	// ── Viewed not bought ────────────────────────────────────────────────────
	const viewCountMap  = new Map<string, number>();
	const cartCountMap  = new Map<string, number>();

	for (const e of views) {
		if (e.product_id) viewCountMap.set(e.product_id, (viewCountMap.get(e.product_id) ?? 0) + 1);
	}
	for (const e of carts) {
		if (e.product_id) cartCountMap.set(e.product_id, (cartCountMap.get(e.product_id) ?? 0) + 1);
	}

	// Top 15 most-viewed products
	const topViewed = [...viewCountMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 15);

	// Resolve product names
	let viewedNotBought: Array<{name: string; views: number; carts: number; cartRate: number}> = [];
	if (topViewed.length > 0) {
		const ids = topViewed.map(([id]) => id);
		const { data: products } = await locals.supabaseAdmin
			.from('products')
			.select('id, name')
			.in('id', ids);

		const nameMap = new Map((products ?? []).map((p: any) => [p.id, p.name]));

		viewedNotBought = topViewed.map(([productId, viewCount]) => {
			const cartCount = cartCountMap.get(productId) ?? 0;
			return {
				name: (nameMap.get(productId) as string) ?? 'Unknown',
				views: viewCount,
				carts: cartCount,
				cartRate: viewCount > 0 ? Math.round((cartCount / viewCount) * 100) : 0
			};
		});
	}

	return { range, funnel, viewsOverTime, viewedNotBought };
};
