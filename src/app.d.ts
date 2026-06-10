import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<(Session & { user: User }) | null>;
		}
		interface PageData {
			user?: { full_name: string } | null;
			cartCount?: number;
			wishlistCount?: number;
		}
	}
}

export {};
