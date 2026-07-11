import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

function sortSizes(variants: { id: string; size: string; stock_quantity: number }[]) {
	return [...variants].sort((a, b) => {
		const ai = SIZE_ORDER.indexOf(a.size);
		const bi = SIZE_ORDER.indexOf(b.size);
		if (ai === -1 && bi === -1) return a.size.localeCompare(b.size);
		if (ai === -1) return 1;
		if (bi === -1) return -1;
		return ai - bi;
	});
}

type ProductDetail = {
	id: string;
	name: string;
	description: string | null;
	price: number;
	sale_price: number | null;
	category: { id: string; name: string } | null;
	product_colours: Array<{
		id: string;
		colour_name: string;
		colour_hex: string | null;
		sort_order: number;
		product_images: Array<{ id: string; cloudinary_public_id: string; sort_order: number }>;
		product_variants: Array<{ id: string; size: string; stock_quantity: number }>;
	}>;
};

type ReviewRow = { id: string; rating: number; body: string | null; created_at: string };

// Supabase stub types lack Relationships — cast at query boundary
type QueryResult<T> = { data: T | null; error: { message: string } | null };

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.safeGetSession();

	const [productResult, reviewsResult] = (await Promise.all([
		locals.supabase
			.from('products')
			.select(
				`
				id, name, description, price, sale_price,
				category:categories ( id, name ),
				product_colours (
					id, colour_name, colour_hex, sort_order,
					product_images ( id, cloudinary_public_id, sort_order ),
					product_variants ( id, size, stock_quantity )
				)
			`
			)
			.eq('id', params.id)
			.eq('published', true)
			.single(),

		locals.supabase
			.from('reviews')
			.select('id, rating, body, created_at')
			.eq('product_id', params.id)
			.eq('is_visible', true)
			.order('created_at', { ascending: false })
			.limit(20)
	])) as unknown as [QueryResult<ProductDetail>, QueryResult<ReviewRow[]>];

	if (productResult.error || !productResult.data) {
		throw error(404, 'Product not found');
	}

	const raw = productResult.data;

	const colours = [...raw.product_colours]
		.sort((a, b) => a.sort_order - b.sort_order)
		.map((c) => ({
			id: c.id,
			name: c.colour_name,
			hex: c.colour_hex,
			images: [...c.product_images].sort((a, b) => a.sort_order - b.sort_order),
			variants: sortSizes(c.product_variants)
		}));

	const reviews = (reviewsResult.data ?? []) as ReviewRow[];
	const avgRating =
		reviews.length > 0
			? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
			: null;

	let wishlistedVariantIds: string[] = [];
	if (session?.user) {
		const variantIds = colours.flatMap((c) => c.variants.map((v) => v.id));
		if (variantIds.length > 0) {
			const { data: wl } = await locals.supabase
				.from('wishlist_items')
				.select('product_variant_id')
				.eq('user_id', session.user.id)
				.in('product_variant_id', variantIds);
			wishlistedVariantIds = (wl ?? []).map((r: any) => r.product_variant_id);
		}
	}

	return {
		product: {
			id: raw.id,
			name: raw.name,
			description: raw.description,
			price: raw.price,
			salePrice: raw.sale_price,
			category: raw.category
		},
		colours,
		reviews,
		avgRating,
		reviewCount: reviews.length,
		wishlistedVariantIds,
		user: session?.user ? { id: session.user.id } : null
	};
};
