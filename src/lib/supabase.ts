import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Database } from './database.types';

export function createSupabaseBrowserClient() {
	return createBrowserClient<Database>(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function createSupabaseServerClient(
	fetch: typeof globalThis.fetch,
	cookies: import('@sveltejs/kit').Cookies
) {
	return createServerClient<Database>(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		global: { fetch },
		cookies: {
			getAll() {
				return cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});
}