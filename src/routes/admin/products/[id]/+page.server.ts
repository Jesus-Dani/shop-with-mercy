import { fail, redirect, error } from '@sveltejs/kit';
import { logAudit } from '$lib/audit';
import type { PageServerLoad, Actions } from './$types';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const load: PageServerLoad = async ({ locals, params }) => {
	const [productRes, categoriesRes] = await Promise.all([
		locals.supabaseAdmin
			.from('products')
			.select(
				'*, categories(id, name), product_colours(*, product_images(*), product_variants(*))'
			)
			.eq('id', params.id)
			.single(),
		locals.supabaseAdmin.from('categories').select('id, name').order('sort_order')
	]);

	if (productRes.error || !productRes.data) throw error(404, 'Product not found');

	const product = productRes.data as any;
	for (const colour of product.product_colours ?? []) {
		colour.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order);
		colour.product_variants?.sort(
			(a: any, b: any) => SIZES.indexOf(a.size) - SIZES.indexOf(b.size)
		);
	}

	return {
		product,
		categories: categoriesRes.data ?? [],
		sizes: SIZES,
		// expose upload preset name to client (not secret — just a Cloudinary preset name)
		uploadPreset: 'shop-with-mercy'
	};
};

export const actions: Actions = {
	updateProduct: async ({ request, locals, params }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const description = String(form.get('description') ?? '').trim() || null;
		const categoryId = String(form.get('category_id') ?? '').trim() || null;
		const price = Math.round(parseFloat(String(form.get('price') ?? '0')));
		const salePriceRaw = String(form.get('sale_price') ?? '').trim();
		const salePrice = salePriceRaw ? Math.round(parseFloat(salePriceRaw)) : null;
		const costPriceRaw = String(form.get('cost_price') ?? '').trim();
		const costPrice = costPriceRaw ? Math.round(parseFloat(costPriceRaw)) : null;
		const published = form.get('published') === 'on';

		if (!name) return fail(400, { action: 'updateProduct', error: 'Name is required.' });
		if (!price || price <= 0)
			return fail(400, { action: 'updateProduct', error: 'Price must be greater than 0.' });

		const { error: err } = await locals.supabaseAdmin
			.from('products')
			.update({
				name,
				description,
				category_id: categoryId,
				price,
				sale_price: salePrice,
				cost_price: costPrice,
				published,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (err) return fail(500, { action: 'updateProduct', error: err.message });
		logAudit(locals.supabaseAdmin, 'product.update', 'products', params.id, { new: { name, price, published } });
		return { action: 'updateProduct', success: true };
	},

	addColour: async ({ request, locals, params }) => {
		const form = await request.formData();
		const colourName = String(form.get('colour_name') ?? '').trim();
		const colourHex = String(form.get('colour_hex') ?? '#6b6b6b');

		if (!colourName)
			return fail(400, { action: 'addColour', error: 'Colour name is required.' });

		const { data: existing } = await locals.supabaseAdmin
			.from('product_colours')
			.select('sort_order')
			.eq('product_id', params.id)
			.order('sort_order', { ascending: false })
			.limit(1);

		const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

		const { data: colour, error: colErr } = await locals.supabaseAdmin
			.from('product_colours')
			.insert({
				product_id: params.id,
				colour_name: colourName,
				colour_hex: colourHex,
				sort_order: sortOrder
			})
			.select('id')
			.single();

		if (colErr) return fail(500, { action: 'addColour', error: colErr.message });

		// Create all size variants at 0 stock
		await locals.supabaseAdmin.from('product_variants').insert(
			SIZES.map((size) => ({ product_colour_id: colour.id, size, stock_quantity: 0 }))
		);

		logAudit(locals.supabaseAdmin, 'colour.add', 'product_colours', colour.id, { new: { colour_name: colourName } });
		return { action: 'addColour', success: true };
	},

	deleteColour: async ({ request, locals, params }) => {
		const form = await request.formData();
		const colourId = String(form.get('colour_id') ?? '');

		const { error: err } = await locals.supabaseAdmin
			.from('product_colours')
			.delete()
			.eq('id', colourId)
			.eq('product_id', params.id);

		if (err) return fail(500, { action: 'deleteColour', error: err.message });
		logAudit(locals.supabaseAdmin, 'colour.delete', 'product_colours', colourId);
		return { action: 'deleteColour', success: true };
	},

	addImage: async ({ request, locals }) => {
		const form = await request.formData();
		const colourId = String(form.get('colour_id') ?? '');
		const publicId = String(form.get('public_id') ?? '').trim();

		if (!publicId) return fail(400, { action: 'addImage', error: 'No image provided.' });

		const { data: existing } = await locals.supabaseAdmin
			.from('product_images')
			.select('sort_order')
			.eq('product_colour_id', colourId)
			.order('sort_order', { ascending: false })
			.limit(1);

		const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

		const { error: err } = await locals.supabaseAdmin
			.from('product_images')
			.insert({ product_colour_id: colourId, cloudinary_public_id: publicId, sort_order: sortOrder });

		if (err) return fail(500, { action: 'addImage', error: err.message });
		return { action: 'addImage', success: true };
	},

	deleteImage: async ({ request, locals }) => {
		const form = await request.formData();
		const imageId = String(form.get('image_id') ?? '');

		const { error: err } = await locals.supabaseAdmin
			.from('product_images')
			.delete()
			.eq('id', imageId);

		if (err) return fail(500, { action: 'deleteImage', error: err.message });
		return { action: 'deleteImage', success: true };
	},

	updateStock: async ({ request, locals, params }) => {
		const form = await request.formData();
		const entries = [...form.entries()].filter(([k]) => k.startsWith('variant_'));

		const results = await Promise.all(
			entries.map(([key, value]) =>
				locals.supabaseAdmin
					.from('product_variants')
					.update({
						stock_quantity: Math.max(0, parseInt(String(value), 10) || 0),
						updated_at: new Date().toISOString()
					})
					.eq('id', key.replace('variant_', ''))
			)
		);

		const failed = results.find((r) => r.error);
		if (failed?.error) return fail(500, { action: 'updateStock', error: failed.error.message });
		logAudit(locals.supabaseAdmin, 'stock.update', 'product_variants', params.id);
		return { action: 'updateStock', success: true };
	},

	deleteProduct: async ({ locals, params }) => {
		const { error: err } = await locals.supabaseAdmin
			.from('products')
			.delete()
			.eq('id', params.id);

		if (err) return fail(500, { action: 'deleteProduct', error: err.message });
		logAudit(locals.supabaseAdmin, 'product.delete', 'products', params.id);
		throw redirect(303, '/admin/products');
	}
};
