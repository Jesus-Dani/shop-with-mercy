import { createSupabaseServerClient } from '$lib/supabase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient(event.fetch, event.cookies);

	/**
	 * safeGetSession validates the session JWT before trusting it.
	 * Always use this instead of getSession() on the server —
	 * getSession() alone does not re-validate the JWT against the auth server.
	 */
	event.locals.safeGetSession = async () => {
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
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
