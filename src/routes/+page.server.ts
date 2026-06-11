import type { PageServerLoad } from './$types';

type CategoryRow = { id: string; name: string };

type ProductWithColours = {
	id: string;
	name: string;
	price: number;
	sale_price: number | null;
	product_colours: Array<{
		colour_name: string;
		colour_hex: string | null;
		sort_order: number;
		product_images: Array<{ cloudinary_public_id: string; sort_order: number }>;
		product_variants: Array<{ stock_quantity: number }>;
	}>;
};

// Supabase stub types lack Relationships — cast at query boundary
type QR<T> = { data: T | null; error: unknown };

export const load: PageServerLoad = async ({ locals }) => {
	const [categoriesResult, productsResult] = (await Promise.all([
		locals.supabase.from('categories').select('id, name').order('sort_order'),
		locals.supabase
			.from('products')
			.select(
				`
				id, name, price, sale_price,
				product_colours (
					colour_name, colour_hex, sort_order,
					product_images ( cloudinary_public_id, sort_order ),
					product_variants ( stock_quantity )
				)
			`
			)
			.eq('published', true)
			.order('created_at', { ascending: false })
			.limit(8)
	])) as unknown as [QR<CategoryRow[]>, QR<ProductWithColours[]>];

	const raw = productsResult.data ?? [];

	const featuredProducts = raw.map((p) => {
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

	return {
		categories: categoriesResult.data ?? [],
		featuredProducts
	};
};
