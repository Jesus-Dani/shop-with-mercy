import { fail } from '@sveltejs/kit';
import { logAudit } from '$lib/audit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: reviews, error } = await locals.supabaseAdmin
		.from('reviews')
		.select('*, products(name)')
		.order('created_at', { ascending: false });

	if (error) console.error('[admin/reviews] load:', error.message);
	return { reviews: (reviews ?? []) as any[] };
};

export const actions: Actions = {
	toggleVisibility: async ({ request, locals }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const visible = form.get('is_visible') === 'true';

		const { error } = await locals.supabaseAdmin
			.from('reviews')
			.update({ is_visible: !visible })
			.eq('id', id);

		if (error) return fail(500, { error: error.message });
		logAudit(locals.supabaseAdmin, !visible ? 'review.show' : 'review.hide', 'reviews', id);
		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');

		const { error } = await locals.supabaseAdmin.from('reviews').delete().eq('id', id);
		if (error) return fail(500, { error: error.message });
		logAudit(locals.supabaseAdmin, 'review.delete', 'reviews', id);
		return { success: true };
	}
};
