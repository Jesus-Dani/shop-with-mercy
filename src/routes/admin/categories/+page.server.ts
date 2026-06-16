import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: categories, error } = await locals.supabase
		.from('categories')
		.select('id, name, sort_order')
		.order('sort_order');

	if (error) console.error('[admin/categories] load:', error.message);
	return { categories: (categories ?? []) as any[] };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (!name) return fail(400, { action: 'create', error: 'Name is required.' });

		const { data: existing } = await locals.supabase
			.from('categories')
			.select('sort_order')
			.order('sort_order', { ascending: false })
			.limit(1);

		const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;
		const { error } = await locals.supabase.from('categories').insert({ name, sort_order: sortOrder });
		if (error) return fail(500, { action: 'create', error: error.message });
		return { action: 'create', success: true };
	},

	rename: async ({ request, locals }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const name = String(form.get('name') ?? '').trim();
		if (!name) return fail(400, { action: 'rename', error: 'Name is required.' });

		const { error } = await locals.supabase.from('categories').update({ name }).eq('id', id);
		if (error) return fail(500, { action: 'rename', error: error.message });
		return { action: 'rename', success: true };
	},

	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');

		// Unlink products from this category first
		await locals.supabase.from('products').update({ category_id: null }).eq('category_id', id);

		const { error } = await locals.supabase.from('categories').delete().eq('id', id);
		if (error) return fail(500, { action: 'delete', error: error.message });
		return { action: 'delete', success: true };
	}
};
