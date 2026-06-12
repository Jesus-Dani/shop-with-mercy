import { createSupabaseServerClient } from '$lib/supabase';
import type { Handle } from '@sveltejs/kit';

console.log('[hooks.server] module loaded');

// TEMP: surface errors in the browser response so we can diagnose the Netlify 500
function errorResponse(label: string, err: unknown): Response {
	const msg =
		`[DEBUG ${label}]\n` +
		String(err) +
		'\n' +
		(err instanceof Error ? err.stack ?? '' : '') +
		'\n\nprocess.env keys: ' +
		Object.keys(process.env)
			.filter((k) => k.startsWith('PUBLIC_') || k.startsWith('SUPABASE') || k.startsWith('NODE'))
			.sort()
			.join(', ');
	return new Response(msg, { status: 500, headers: { 'content-type': 'text/plain' } });
}

export const handle: Handle = async ({ event, resolve }) => {
	try {
		event.locals.supabase = createSupabaseServerClient(event.fetch, event.cookies);
	} catch (err) {
		console.error('[hooks] createSupabaseServerClient threw:', err);
		return errorResponse('createSupabaseServerClient', err);
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
		return errorResponse('resolve', err);
	}
};
