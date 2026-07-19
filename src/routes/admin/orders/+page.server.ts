import { fail } from '@sveltejs/kit';
import { logAudit } from '$lib/audit';
import type { PageServerLoad, Actions } from './$types';

const VALID_TRANSITIONS: Record<string, string[]> = {
	pending: ['paid', 'cancelled'],
	paid: ['fulfilled', 'cancelled'],
	fulfilled: ['delivered', 'cancelled'],
	delivered: ['refunded'],
	cancelled: ['refunded'],
	refunded: []
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const status = url.searchParams.get('status') ?? 'all';
	const q = url.searchParams.get('q') ?? '';
	const from = url.searchParams.get('from') ?? '';
	const to = url.searchParams.get('to') ?? '';

	let query = locals.supabaseAdmin
		.from('orders')
		.select('id, order_number, customer_name, customer_email, customer_phone, status, subtotal, delivery_type, created_at, order_items(product_name, colour_name, size, quantity)')
		.order('created_at', { ascending: false });

	if (status !== 'all') query = query.eq('status', status as any);
	if (q) query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%`);
	if (from) query = query.gte('created_at', from);
	if (to) query = query.lte('created_at', to + 'T23:59:59.999Z');

	const { data: orders, error } = await query;
	if (error) console.error('[admin/orders] load:', error.message);

	return { orders: (orders ?? []) as any[], status, q, from, to };
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const newStatus = String(form.get('status') ?? '');

		const { data: order, error: fetchErr } = await locals.supabaseAdmin
			.from('orders')
			.select('status')
			.eq('id', id)
			.single();

		if (fetchErr || !order) return fail(404, { error: 'Order not found.' });

		const allowed = VALID_TRANSITIONS[order.status] ?? [];
		if (!allowed.includes(newStatus)) {
			return fail(400, { error: `Cannot move from ${order.status} to ${newStatus}.` });
		}

		const { error } = await locals.supabaseAdmin
			.from('orders')
			.update({ status: newStatus as any, updated_at: new Date().toISOString() })
			.eq('id', id);

		if (error) return fail(500, { error: error.message });

		logAudit(locals.supabaseAdmin, `order.${newStatus}`, 'orders', id, {
			old: { status: order.status },
			new: { status: newStatus }
		});

		return { success: true };
	}
};
