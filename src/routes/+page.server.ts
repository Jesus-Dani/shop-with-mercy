import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Smoke test: confirm Supabase is reachable.
	// A "relation does not exist" error means the migration hasn't run yet —
	// that's expected; any other error signals a config problem.
	const { error } = await locals.supabase
		.from('products')
		.select('id')
		.limit(1);

	if (error && !error.message.includes('does not exist')) {
		console.error('[Supabase smoke test] Unexpected error:', error.message);
		return { dbStatus: 'error' };
	}

	return { dbStatus: 'ok' };
};
