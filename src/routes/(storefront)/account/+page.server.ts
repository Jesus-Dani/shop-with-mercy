import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.safeGetSession();

	if (!session) {
		throw redirect(303, `/auth/sign-in?next=${encodeURIComponent(url.pathname)}`);
	}

	const meta = session.user.user_metadata ?? {};
	const fullName = ((meta.full_name ?? meta.name ?? '') as string);

	const { data: ordersRaw } = await locals.supabaseAdmin
		.from('orders')
		.select(`
			id,
			order_number,
			status,
			subtotal,
			created_at,
			order_items (
				product_name, colour_name, size, quantity, unit_price,
				product_variants (
					product_colours (
						product_images ( cloudinary_public_id, sort_order )
					)
				)
			)
		`)
		.eq('user_id', session.user.id)
		.order('created_at', { ascending: false })
		.limit(20);

	const orders = (ordersRaw ?? []).map((o: any) => ({
		id: o.id,
		orderNumber: o.order_number,
		status: o.status as string,
		subtotal: o.subtotal as number,
		createdAt: o.created_at as string,
		items: (o.order_items ?? []).map((item: any) => {
			const images: any[] = item.product_variants?.product_colours?.product_images ?? [];
			const sorted = [...images].sort((a: any, b: any) => a.sort_order - b.sort_order);
			return {
				product_name: item.product_name as string,
				colour_name: item.colour_name as string,
				size: item.size as string,
				quantity: item.quantity as number,
				unit_price: item.unit_price as number,
				imagePublicId: (sorted[0]?.cloudinary_public_id ?? null) as string | null
			};
		})
	}));

	return {
		user: {
			id: session.user.id,
			email: session.user.email ?? '',
			full_name: fullName
		},
		orders
	};
};
