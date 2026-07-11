import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.safeGetSession();
	const meta = session?.user?.user_metadata ?? {};
	const fullName = (meta.full_name ?? meta.name ?? '') as string;

	let wishlistCount = 0;
	if (session?.user) {
		const { count } = await locals.supabase
			.from('wishlist_items')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', session.user.id);
		wishlistCount = count ?? 0;
	}

	return {
		user: session?.user ? { full_name: fullName } : null,
		wishlistCount
	};
};
