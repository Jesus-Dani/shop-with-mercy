import type { PageServerLoad } from './$types';

type ProductRow = {
	id: string;
	name: string;
	price: number;
	sale_price: number | null;
	product_colours: Array<{
		colour_name: string;
		sort_order: number;
		product_images: Array<{ cloudinary_public_id: string; sort_order: number }>;
		product_variants: Array<{ stock_quantity: number }>;
	}>;
};

type QR<T> = { data: T | null; error: unknown };

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';

	if (!q) {
		return { q: '', results: [] };
	}

	const { data: raw } = (await locals.supabase
		.from('products')
		.select(
			`
			id, name, price, sale_price,
			product_colours (
				colour_name, sort_order,
				product_images ( cloudinary_public_id, sort_order ),
				product_variants ( stock_quantity )
			)
		`
		)
		.eq('published', true)
		.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
		.order('created_at', { ascending: false })
		.limit(48)) as unknown as QR<ProductRow[]>;

	const results = (raw ?? []).map((p) => {
		const colours = [...p.product_colours].sort((a, b) => a.sort_order - b.sort_order);
		const first = colours[0];
		const images = first
			? [...first.product_images].sort((a, b) => a.sort_order - b.sort_order)
			: [];
		const totalStock = p.product_colours
			.flatMap((c) => c.product_variants)
			.reduce((sum, v) => sum + v.stock_quantity, 0);

		return {
			id: p.id,
			name: p.name,
			price: p.price,
			salePrice: p.sale_price,
			coverPublicId: images[0]?.cloudinary_public_id ?? null,
			totalStock
		};
	});

	return { q, results };
};
