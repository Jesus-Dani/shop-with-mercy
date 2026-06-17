import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

function sortSizes(sizes: string[]): string[] {
	return [...sizes].sort((a, b) => {
		const ai = SIZE_ORDER.indexOf(a);
		const bi = SIZE_ORDER.indexOf(b);
		if (ai === -1 && bi === -1) return a.localeCompare(b);
		if (ai === -1) return 1;
		if (bi === -1) return -1;
		return ai - bi;
	});
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const categoryName = url.searchParams.get('category')?.toLowerCase() ?? null;
	const colourFilter = url.searchParams.get('colour')?.toLowerCase() ?? null;
	const sizeFilter = url.searchParams.get('size') ?? null;
	const saleOnly = url.searchParams.get('sale') === '1';
	const minPrice = url.searchParams.get('min') ? Number(url.searchParams.get('min')) : null;
	const maxPrice = url.searchParams.get('max') ? Number(url.searchParams.get('max')) : null;
	const sort = url.searchParams.get('sort') ?? 'newest';

	type CategoryRow = { id: string; name: string };
	type ProductRow = {
		id: string;
		name: string;
		price: number;
		sale_price: number | null;
		created_at: string;
		product_colours: Array<{
			colour_name: string;
			colour_hex: string | null;
			sort_order: number;
			product_images: Array<{ cloudinary_public_id: string; sort_order: number }>;
			product_variants: Array<{ stock_quantity: number; size: string }>;
		}>;
	};
	type QR<T> = { data: T | null; error: unknown };

	const { data: categories } = (await locals.supabase
		.from('categories')
		.select('id, name')
		.order('sort_order')) as unknown as QR<CategoryRow[]>;

	// Resolve category name → ID
	let categoryId: string | null = null;
	if (categoryName && categories) {
		const match = categories.find((c) => c.name.toLowerCase() === categoryName);
		categoryId = match?.id ?? null;
	}

	let query = locals.supabase
		.from('products')
		.select(
			`
			id, name, price, sale_price, created_at,
			product_colours (
				colour_name, colour_hex, sort_order,
				product_images ( cloudinary_public_id, sort_order ),
				product_variants ( stock_quantity, size )
			)
		`
		)
		.eq('published', true);

	if (categoryId) query = query.eq('category_id', categoryId);
	if (saleOnly) query = query.not('sale_price', 'is', null);

	if (sort === 'price_asc') {
		query = query.order('price', { ascending: true });
	} else if (sort === 'price_desc') {
		query = query.order('price', { ascending: false });
	} else {
		query = query.order('created_at', { ascending: false });
	}

	const { data: rawData, error: dbError } = (await query) as unknown as QR<ProductRow[]> & {
		error: { message: string } | null;
	};

	if (dbError) throw error(500, 'Could not load products');

	const products = (rawData ?? []) as ProductRow[];

	// JS-level filters (require traversing nested tables)
	let filtered = products;

	if (colourFilter) {
		filtered = filtered.filter((p) =>
			p.product_colours.some((c) => c.colour_name.toLowerCase() === colourFilter)
		);
	}
	if (sizeFilter) {
		filtered = filtered.filter((p) =>
			p.product_colours.some((c) => c.product_variants.some((v) => v.size === sizeFilter))
		);
	}
	if (minPrice !== null) {
		filtered = filtered.filter((p) => (p.sale_price ?? p.price) >= minPrice);
	}
	if (maxPrice !== null) {
		filtered = filtered.filter((p) => (p.sale_price ?? p.price) <= maxPrice);
	}

	// Available filter options from full (unfiltered) set
	const allColours = [
		...new Set(products.flatMap((p) => p.product_colours.map((c) => c.colour_name)))
	].sort();

	const allSizes = sortSizes([
		...new Set(
			products.flatMap((p) => p.product_colours.flatMap((c) => c.product_variants.map((v) => v.size)))
		)
	]);

	// Map to card data
	const cards = filtered.map((p) => {
		const colours = [...p.product_colours].sort((a, b) => a.sort_order - b.sort_order);
		const first = colours[0];
		const images = first ? [...first.product_images].sort((a, b) => a.sort_order - b.sort_order) : [];
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
		products: cards,
		categories: categories ?? [],
		availableColours: allColours,
		availableSizes: allSizes,
		filters: { categoryName, colourFilter, sizeFilter, saleOnly, minPrice, maxPrice, sort }
	};
};
