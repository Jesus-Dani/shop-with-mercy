import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const PAID_STATUSES = ['pending', 'paid', 'fulfilled', 'delivered'];

export const load: PageServerLoad = async ({ params, locals }) => {
	const email = decodeURIComponent(params.email);
	const adminDb = locals.supabaseAdmin;

	// All orders for this email
	const { data: orders, error: ordersErr } = await adminDb
		.from('orders')
		.select('id, order_number, status, subtotal, created_at, user_id, delivery_type')
		.eq('customer_email', email)
		.order('created_at', { ascending: false });

	if (ordersErr) throw error(500, 'Failed to load customer orders');
	if (!orders || orders.length === 0) throw error(404, 'Customer not found');

	// Pull customer info from most recent order
	const { data: latestOrder } = await adminDb
		.from('orders')
		.select('customer_name, customer_email, customer_phone')
		.eq('customer_email', email)
		.order('created_at', { ascending: false })
		.limit(1)
		.single();

	// Find a user_id if they ever ordered with an account
	const user_id = (orders as any[]).find((o: any) => o.user_id)?.user_id ?? null;

	// LTV and stats
	const paidOrders = (orders as any[]).filter((o: any) => PAID_STATUSES.includes(o.status));
	const ltv = paidOrders.reduce((s: number, o: any) => s + (o.subtotal as number), 0);
	const avgOrder = paidOrders.length > 0 ? Math.round(ltv / paidOrders.length) : 0;

	// Profile (only for registered customers)
	let profile: { full_name: string; phone: string | null; created_at: string } | null = null;
	if (user_id) {
		const { data: p } = await adminDb
			.from('profiles')
			.select('full_name, phone, created_at')
			.eq('id', user_id)
			.single();
		profile = p ?? null;
	}

	// Wishlist saves (only for registered customers)
	let wishlist: Array<{ product_name: string; colour_name: string; size: string; added_at: string }> = [];
	if (user_id) {
		const { data: wItems } = await adminDb
			.from('wishlist_items')
			.select('added_at, product_variant_id')
			.eq('user_id', user_id)
			.order('added_at', { ascending: false });

		if (wItems && wItems.length > 0) {
			const variantIds = (wItems as any[]).map((w: any) => w.product_variant_id);
			const { data: variants } = await adminDb
				.from('product_variants')
				.select('id, size, product_colour_id, product_colours(colour_name, products(name))')
				.in('id', variantIds);

			const variantMap = new Map((variants ?? []).map((v: any) => [v.id, v]));

			wishlist = (wItems as any[]).map((w: any) => {
				const v = variantMap.get(w.product_variant_id) as any;
				return {
					product_name: v?.product_colours?.products?.name ?? 'Unknown',
					colour_name:  v?.product_colours?.colour_name ?? '—',
					size:         v?.size ?? '—',
					added_at:     w.added_at
				};
			});
		}
	}

	return {
		email,
		name:      (latestOrder as any)?.customer_name ?? email,
		phone:     (latestOrder as any)?.customer_phone ?? null,
		user_id,
		hasAccount: !!user_id,
		profile,
		ltv,
		avgOrder,
		orderCount: orders.length,
		paidCount:  paidOrders.length,
		firstOrderAt: (orders as any[]).at(-1)?.created_at ?? null,
		orders: (orders as any[]).map((o: any) => ({
			id:           o.id,
			order_number: o.order_number,
			status:       o.status,
			subtotal:     o.subtotal,
			created_at:   o.created_at
		})),
		wishlist
	};
};
