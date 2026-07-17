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
			order_items ( product_name, colour_name, size, quantity, unit_price )
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
		items: (o.order_items ?? []) as Array<{
			product_name: string;
			colour_name: string;
			size: string;
			quantity: number;
			unit_price: number;
		}>
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
