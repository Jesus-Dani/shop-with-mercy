import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
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

// Service-role client for server-only admin operations (bypasses RLS).
// Never import this in any client-reachable module.
export function createSupabaseServiceClient(fetch?: typeof globalThis.fetch) {
	return createClient<Database>(env.PUBLIC_SUPABASE_URL, privateEnv.SUPABASE_SECRET_KEY, {
		auth: { persistSession: false },
		global: { fetch: fetch ?? globalThis.fetch }
	});
}