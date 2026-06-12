import { createSupabaseServerClient } from '$lib/supabase';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';

console.log('[hooks.server] module loaded');
// These must be set in Netlify → Site settings → Environment variables.
// If blank, every request throws "URL and Key are required" → 500.
console.log('[hooks.server] SUPABASE_URL:', PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING — add PUBLIC_SUPABASE_URL to Netlify env vars and redeploy');
console.log('[hooks.server] SUPABASE_KEY:', PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'MISSING — add PUBLIC_SUPABASE_PUBLISHABLE_KEY to Netlify env vars and redeploy');

export const handle: Handle = async ({ event, resolve }) => {
	try {
		event.locals.supabase = createSupabaseServerClient(event.fetch, event.cookies);
	} catch (err) {
		console.error('[hooks] createSupabaseServerClient threw:', err);
		throw err;
	}

	// safeGetSession validates the session JWT before trusting it.
	// Returns null (unauthenticated) on any error — never throws.
	event.locals.safeGetSession = async () => {
		try {
			const {
				data: { session }
			} = await event.locals.supabase.auth.getSession();

			if (!session) return null;

			const {
				data: { user },
				error
			} = await event.locals.supabase.auth.getUser();

			if (error || !user) return null;

			return { ...session, user };
		} catch (err) {
			console.error('[hooks] safeGetSession threw:', err);
			return null;
		}
	};

	try {
		return await resolve(event, {
			filterSerializedResponseHeaders(name) {
				return name === 'content-range' || name === 'x-supabase-api-version';
			}
		});
	} catch (err) {
		console.error('[hooks] resolve threw:', err);
		throw err;
	}
};
