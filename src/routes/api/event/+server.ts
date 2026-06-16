import type { RequestHandler } from './$types';

const VALID_TYPES = new Set(['product_view', 'add_to_cart', 'checkout_started', 'purchase']);

export const POST: RequestHandler = async ({ request, locals }) => {
	// Always return 204 immediately — tracking must never block the client
	try {
		const body = await request.json().catch(() => null);
		if (!body || !VALID_TYPES.has(String(body.type ?? ''))) {
			return new Response(null, { status: 204 });
		}

		const session = await locals.safeGetSession();

		// Fire-and-forget write via service role (bypasses RLS)
		locals.supabaseAdmin
			.from('page_events')
			.insert({
				event_type: String(body.type),
				user_id: session?.user.id ?? null,
				product_id: body.product_id ?? null,
				variant_id: body.variant_id ?? null,
				order_id: body.order_id ?? null,
				meta: body.meta ?? null
			})
			.then(({ error }) => {
				if (error) console.error('[event]', body.type, error.message);
			});
	} catch {
		// silently swallow — tracking must never surface errors to the client
	}

	return new Response(null, { status: 204 });
};
