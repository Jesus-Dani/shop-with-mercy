import { fail } from '@sveltejs/kit';
import { logAudit } from '$lib/audit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get('q') ?? '';

	let query = locals.supabase
		.from('products')
		.select(
			'id, name, price, sale_price, published, created_at, categories(name), product_colours(id, product_images(cloudinary_public_id, sort_order))'
		)
		.order('created_at', { ascending: false });

	if (q) query = query.ilike('name', `%${q}%`);

	const { data: products, error } = await query;
	if (error) console.error('[admin/products] load:', error.message);

	return { products: (products ?? []) as any[], q };
};

export const actions: Actions = {
	togglePublished: async ({ request, locals }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const published = form.get('published') === 'true';

		const { error } = await locals.supabase
			.from('products')
			.update({ published: !published })
			.eq('id', id);

		if (error) return fail(500, { error: error.message });
		logAudit(locals.supabaseAdmin, !published ? 'product.publish' : 'product.unpublish', 'products', id);
		return { success: true };
	},

	deleteProduct: async ({ request, locals }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');

		const { error } = await locals.supabase.from('products').delete().eq('id', id);
		if (error) return fail(500, { error: error.message });
		logAudit(locals.supabaseAdmin, 'product.delete', 'products', id);
		return { success: true };
	}
};
