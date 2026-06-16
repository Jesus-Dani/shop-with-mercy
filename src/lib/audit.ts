import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

type AdminSupabase = SupabaseClient<Database>;

/**
 * Fire-and-forget audit log write. Never throws — audit failures must not
 * block admin operations.
 */
export function logAudit(
	supabase: AdminSupabase,
	action: string,
	targetTable: string,
	targetId: string,
	details?: { old?: Record<string, unknown> | null; new?: Record<string, unknown> | null }
): void {
	supabase
		.from('admin_audit_log')
		.insert({
			admin_id: 'admin',
			action,
			target_table: targetTable,
			target_id: targetId,
			old_value: (details?.old ?? null) as import('./database.types').Json,
			new_value: (details?.new ?? null) as import('./database.types').Json
		})
		.then(({ error }) => {
			if (error) console.error('[audit] failed to write:', action, error.message);
		});
}
