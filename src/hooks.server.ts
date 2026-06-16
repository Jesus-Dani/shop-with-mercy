import { createSupabaseServerClient, createSupabaseServiceClient } from '$lib/supabase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient(event.fetch, event.cookies);
	event.locals.supabaseAdmin = createSupabaseServiceClient(event.fetch);

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

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
