import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.safeGetSession();
	if (!session) throw redirect(303, `/auth/sign-in?next=${encodeURIComponent(url.pathname)}`);

	const { data: items } = await locals.supabase
		.from('wishlist_items')
		.select(`
			id,
			added_at,
			product_variants (
				id,
				size,
				stock_quantity,
				product_colours (
					id,
					colour_name,
					colour_hex,
					product_images ( cloudinary_public_id, sort_order ),
					products ( id, name, price, sale_price )
				)
			)
		`)
		.eq('user_id', session.user.id)
		.order('added_at', { ascending: false });

	const wishlist = (items ?? []).map((item: any) => {
		const variant = item.product_variants;
		const colour = variant?.product_colours;
		const product = colour?.products;
		const images = [...(colour?.product_images ?? [])].sort(
			(a: any, b: any) => a.sort_order - b.sort_order
		);
		return {
			wishlistId: item.id,
			variantId: variant?.id ?? '',
			productId: product?.id ?? '',
			productName: product?.name ?? '',
			colourName: colour?.colour_name ?? '',
			colourHex: colour?.colour_hex ?? null,
			size: variant?.size ?? '',
			price: product?.price ?? 0,
			salePrice: product?.sale_price ?? null,
			inStock: (variant?.stock_quantity ?? 0) > 0,
			imagePublicId: images[0]?.cloudinary_public_id ?? null
		};
	});

	return { wishlist };
};
