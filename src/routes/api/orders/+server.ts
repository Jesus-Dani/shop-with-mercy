import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.safeGetSession();
	if (!session?.user) return error(401, { message: 'Sign in to place an order' });

	const { items, subtotal, paymentRef, receiptPublicId, phone } = await request.json();

	if (!items?.length) return error(400, { message: 'Cart is empty' });
	if (!paymentRef?.trim()) return error(400, { message: 'Payment reference is required' });
	if (!receiptPublicId) return error(400, { message: 'Receipt is required' });
	if (!phone?.trim()) return error(400, { message: 'Phone number is required' });

	const meta = session.user.user_metadata ?? {};
	const customerName = (meta.full_name ?? meta.name ?? session.user.email ?? '') as string;
	const customerEmail = session.user.email ?? '';

	const { data: order, error: orderErr } = await locals.supabaseAdmin
		.from('orders')
		.insert({
			user_id: session.user.id,
			customer_name: customerName,
			customer_email: customerEmail,
			customer_phone: phone.trim(),
			delivery_type: 'within_run',
			status: 'pending',
			subtotal,
			paystack_reference: paymentRef.trim(),
			paystack_channel: 'manual_opay'
		})
		.select('id, order_number')
		.single();

	if (orderErr) return error(500, { message: orderErr.message });

	const orderItems = items.map((i: any) => ({
		order_id: order.id,
		product_variant_id: i.variantId || null,
		product_name: i.name,
		colour_name: i.colourName,
		size: i.size,
		quantity: i.quantity,
		unit_price: i.price,
		cost_price: null
	}));

	const { error: itemsErr } = await locals.supabaseAdmin.from('order_items').insert(orderItems);
	if (itemsErr) console.error('order_items insert failed:', itemsErr.message);

	return json({ orderId: order.id, orderNumber: order.order_number });
};
