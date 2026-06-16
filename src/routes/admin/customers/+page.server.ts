import type { PageServerLoad } from './$types';

interface CustomerRow {
	email: string;
	name: string;
	phone: string;
	user_id: string | null;
	orderCount: number;
	ltv: number;
	lastOrderAt: string;
	hasAccount: boolean;
}

export const load: PageServerLoad = async ({ locals }) => {
	const { data: orders } = await locals.supabaseAdmin
		.from('orders')
		.select('customer_email, customer_name, customer_phone, user_id, status, subtotal, created_at')
		.order('created_at', { ascending: false });

	const customerMap = new Map<string, CustomerRow>();

	for (const o of (orders ?? []) as any[]) {
		const key = (o.customer_email as string).toLowerCase();
		if (!customerMap.has(key)) {
			customerMap.set(key, {
				email: o.customer_email,
				name: o.customer_name,
				phone: o.customer_phone,
				user_id: o.user_id ?? null,
				orderCount: 0,
				ltv: 0,
				lastOrderAt: o.created_at,
				hasAccount: !!o.user_id
			});
		}
		const c = customerMap.get(key)!;
		c.orderCount++;
		if (['paid', 'fulfilled', 'delivered'].includes(o.status)) {
			c.ltv += o.subtotal as number;
		}
		if (o.user_id && !c.user_id) {
			c.user_id = o.user_id;
			c.hasAccount = true;
		}
	}

	const customers = [...customerMap.values()].sort((a, b) => b.ltv - a.ltv);

	return { customers };
};
