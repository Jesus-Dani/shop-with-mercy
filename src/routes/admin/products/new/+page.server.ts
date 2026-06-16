import { fail, redirect } from '@sveltejs/kit';
import { logAudit } from '$lib/audit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: categories } = await locals.supabase
		.from('categories')
		.select('id, name')
		.order('sort_order');

	return { categories: (categories ?? []) as any[] };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const description = String(form.get('description') ?? '').trim() || null;
		const categoryId = String(form.get('category_id') ?? '').trim() || null;
		const newCategory = String(form.get('new_category') ?? '').trim();
		const price = Math.round(parseFloat(String(form.get('price') ?? '0')) * 100);
		const salePriceRaw = String(form.get('sale_price') ?? '').trim();
		const salePrice = salePriceRaw ? Math.round(parseFloat(salePriceRaw) * 100) : null;
		const costPriceRaw = String(form.get('cost_price') ?? '').trim();
		const costPrice = costPriceRaw ? Math.round(parseFloat(costPriceRaw) * 100) : null;
		const published = form.get('published') === 'on';

		if (!name) return fail(400, { error: 'Product name is required.', fields: { name, description } });
		if (!price || price <= 0) return fail(400, { error: 'Price must be greater than 0.', fields: { name, description } });

		let finalCategoryId = categoryId;

		if (newCategory) {
			const { data: existing } = await locals.supabase
				.from('categories')
				.select('sort_order')
				.order('sort_order', { ascending: false })
				.limit(1);

			const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

			const { data: cat, error: catErr } = await locals.supabase
				.from('categories')
				.insert({ name: newCategory, sort_order: sortOrder })
				.select('id')
				.single();

			if (catErr) return fail(500, { error: 'Could not create category.', fields: { name, description } });
			finalCategoryId = cat.id;
		}

		const { data: product, error } = await locals.supabase
			.from('products')
			.insert({ name, description, category_id: finalCategoryId, price, sale_price: salePrice, cost_price: costPrice, published })
			.select('id')
			.single();

		if (error) {
			console.error('[admin/products/new]', error.message);
			return fail(500, { error: 'Could not create product. Please try again.', fields: { name, description } });
		}

		logAudit(locals.supabaseAdmin, 'product.create', 'products', product.id, { new: { name, price } });
		throw redirect(303, `/admin/products/${product.id}`);
	}
};
