import { fail, error } from '@sveltejs/kit';
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

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: order, error: err } = await locals.supabase
		.from('orders')
		.select('*, order_items(*)')
		.eq('id', params.id)
		.single();

	if (err || !order) throw error(404, 'Order not found.');

	return {
		order: order as any,
		validNext: VALID_TRANSITIONS[(order as any).status] ?? []
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals, params }) => {
		const form = await request.formData();
		const newStatus = String(form.get('status') ?? '');

		const { data: order, error: fetchErr } = await locals.supabase
			.from('orders')
			.select('status')
			.eq('id', params.id)
			.single();

		if (fetchErr || !order) return fail(404, { error: 'Order not found.' });

		const allowed = VALID_TRANSITIONS[order.status] ?? [];
		if (!allowed.includes(newStatus)) {
			return fail(400, { error: `Cannot move from "${order.status}" to "${newStatus}".` });
		}

		const { error: updateErr } = await locals.supabase
			.from('orders')
			.update({ status: newStatus as any, updated_at: new Date().toISOString() })
			.eq('id', params.id);

		if (updateErr) return fail(500, { error: updateErr.message });

		logAudit(locals.supabaseAdmin, `order.${newStatus}`, 'orders', params.id, {
			old: { status: order.status },
			new: { status: newStatus }
		});

		return { success: true, newStatus };
	}
};
