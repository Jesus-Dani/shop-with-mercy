import type { PageServerLoad } from './$types';

const PAGE_SIZE = 30;

export const load: PageServerLoad = async ({ locals, url }) => {
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
	const from = (page - 1) * PAGE_SIZE;
	const to   = from + PAGE_SIZE - 1;

	const { data: rows, count } = await locals.supabaseAdmin
		.from('admin_audit_log')
		.select('id, action, target_table, target_id, old_value, new_value, created_at', { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(from, to);

	const total      = count ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	return {
		rows:       rows ?? [],
		total,
		page,
		totalPages
	};
};
