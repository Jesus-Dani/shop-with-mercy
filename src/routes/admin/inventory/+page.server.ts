import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const filter = url.searchParams.get('filter') ?? 'all'; // all | low | out

	let query = locals.supabase
		.from('product_variants')
		.select(
			'id, size, stock_quantity, product_colours(colour_name, colour_hex, products(id, name, published, categories(name)))'
		)
		.order('stock_quantity', { ascending: true });

	if (filter === 'out') query = query.eq('stock_quantity', 0);
	if (filter === 'low') query = query.gt('stock_quantity', 0).lte('stock_quantity', 5);

	const { data: variants, error } = await query;
	if (error) console.error('[admin/inventory] load:', error.message);

	const rows = (variants ?? []) as any[];

	const outCount = rows.filter((v: any) => v.stock_quantity === 0).length;
	const lowCount = rows.filter((v: any) => v.stock_quantity > 0 && v.stock_quantity <= 5).length;
	const healthyCount = rows.filter((v: any) => v.stock_quantity > 5).length;

	return { variants: rows, filter, outCount, lowCount, healthyCount };
};
