import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.safeGetSession();
	if (!session) throw error(401, 'Sign in to save items to your wishlist');

	const { variant_id } = await request.json();
	if (!variant_id) throw error(400, 'variant_id required');

	const userId = session.user.id;

	const { data: existing, error: findErr } = await locals.supabase
		.from('wishlist_items')
		.select('id')
		.eq('user_id', userId)
		.eq('product_variant_id', variant_id)
		.maybeSingle();

	if (findErr) return error(500, 'Could not check wishlist');

	if (existing) {
		const { error: delErr } = await locals.supabase
			.from('wishlist_items')
			.delete()
			.eq('id', existing.id);
		if (delErr) return error(500, 'Could not remove from wishlist');

		const { count } = await locals.supabase
			.from('wishlist_items')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', userId);
		return json({ action: 'removed', count: count ?? 0 });
	} else {
		const { error: insErr } = await locals.supabase
			.from('wishlist_items')
			.insert({ user_id: userId, product_variant_id: variant_id });
		if (insErr) return error(500, 'Could not add to wishlist');

		const { count } = await locals.supabase
			.from('wishlist_items')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', userId);
		return json({ action: 'added', count: count ?? 0 });
	}
};
