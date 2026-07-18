import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const PHONE_RE = /^\+?[0-9]{7,15}$/;
const MAX_ORDERS_PER_HOUR = 5;
const MAX_ITEMS = 50;
const MAX_QTY = 100;

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.safeGetSession();
	if (!session?.user) return error(401, { message: 'Sign in to place an order' });

	const body = await request.json().catch(() => null);
	if (!body) return error(400, { message: 'Invalid request body' });

	const { items, paymentRef, receiptPublicId, phone } = body;

	// ── Input validation ─────────────────────────────────────────────────────
	if (!Array.isArray(items) || items.length === 0)
		return error(400, { message: 'Cart is empty' });
	if (items.length > MAX_ITEMS)
		return error(400, { message: 'Too many items in cart' });
	if (!paymentRef?.trim())
		return error(400, { message: 'Payment reference is required' });
	if (!receiptPublicId)
		return error(400, { message: 'Receipt is required' });
	if (!phone?.trim())
		return error(400, { message: 'Phone number is required' });
	if (!PHONE_RE.test(phone.trim()))
		return error(400, { message: 'Invalid phone number — use digits only, 7–15 characters' });

	for (const i of items) {
		if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > MAX_QTY)
			return error(400, { message: `Invalid quantity for ${i.name ?? 'item'}` });
	}

	// ── I1: Rate limit — 5 orders per hour per user ──────────────────────────
	const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
	const { count: recentCount } = await locals.supabaseAdmin
		.from('orders')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', session.user.id)
		.gte('created_at', hourAgo);

	if ((recentCount ?? 0) >= MAX_ORDERS_PER_HOUR)
		return error(429, { message: 'Too many orders placed recently. Please wait before trying again.' });

	// ── I2: paymentRef uniqueness ────────────────────────────────────────────
	const { data: dupOrder } = await locals.supabaseAdmin
		.from('orders')
		.select('id')
		.eq('paystack_reference', paymentRef.trim())
		.maybeSingle();

	if (dupOrder)
		return error(409, { message: 'This payment reference has already been used for another order.' });

	// ── C1: Verify prices against DB ─────────────────────────────────────────
	const variantIds = items.map((i: any) => i.variantId).filter(Boolean) as string[];
	const priceMap = new Map<string, number>();

	const stockMap = new Map<string, number>();

	if (variantIds.length > 0) {
		const { data: variants } = await locals.supabaseAdmin
			.from('product_variants')
			.select('id, stock_quantity, product_colours ( products ( price, sale_price ) )')
			.in('id', variantIds);

		for (const v of (variants ?? []) as any[]) {
			stockMap.set(v.id as string, Number(v.stock_quantity));
			const product = v.product_colours?.products;
			if (product) {
				const effectivePrice =
					product.sale_price != null && product.sale_price < product.price
						? product.sale_price
						: product.price;
				priceMap.set(v.id as string, effectivePrice as number);
			}
		}
	}

	// ── Stock availability check ──────────────────────────────────────────────
	for (const i of items) {
		if (!i.variantId) continue;
		const available = stockMap.get(i.variantId);
		if (available === undefined) continue; // variant deleted, allow through
		if (available < i.quantity) {
			return error(400, {
				message: `Sorry, only ${available} left in stock for ${i.name} (Size ${i.size}). Please update your cart.`
			});
		}
	}

	let verifiedSubtotal = 0;
	const verifiedItems = items.map((i: any) => {
		const dbPrice = priceMap.get(i.variantId);
		// Use DB price when available; fall back to client price only for deleted variants
		const unitPrice = dbPrice ?? (i.price as number);
		verifiedSubtotal += unitPrice * (i.quantity as number);
		return { ...i, price: unitPrice };
	});

	// ── Create order ─────────────────────────────────────────────────────────
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
			subtotal: verifiedSubtotal,
			paystack_reference: paymentRef.trim(),
			paystack_channel: 'manual_opay'
		})
		.select('id, order_number')
		.single();

	if (orderErr) return error(500, { message: orderErr.message });

	// ── C2: Insert items — rollback order if this fails ──────────────────────
	const orderItems = verifiedItems.map((i: any) => ({
		order_id: order.id,
		product_variant_id: i.variantId || null,
		product_name: i.name,
		colour_name: i.colourName,
		size: i.size,
		quantity: i.quantity,
		unit_price: i.price,
		cost_price: null
	}));

	const { error: itemsErr } = await locals.supabaseAdmin
		.from('order_items')
		.insert(orderItems);

	if (itemsErr) {
		await locals.supabaseAdmin.from('orders').delete().eq('id', order.id);
		return error(500, { message: 'Could not save order items. Please try again.' });
	}

	// ── Decrement stock ───────────────────────────────────────────────────────
	for (const i of verifiedItems as any[]) {
		if (!i.variantId) continue;
		const current = stockMap.get(i.variantId);
		if (current === undefined) continue;
		await locals.supabaseAdmin
			.from('product_variants')
			.update({ stock_quantity: Math.max(0, current - i.quantity) })
			.eq('id', i.variantId);
	}

	return json({
		orderId: order.id,
		orderNumber: order.order_number,
		subtotal: verifiedSubtotal
	});
};
