import { createSupabaseServerClient } from '$lib/supabase';
import type { Handle } from '@sveltejs/kit';

console.log('[hooks.server] module loaded');

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
