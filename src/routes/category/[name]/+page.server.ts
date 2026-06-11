import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data } = await locals.supabase
		.from('categories')
		.select('id')
		.ilike('name', params.name)
		.maybeSingle();

	if (data) {
		redirect(302, `/shop?category=${encodeURIComponent(params.name.toLowerCase())}`);
	}

	redirect(302, '/shop');
};
