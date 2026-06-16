<script lang="ts">
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	function fmtDate(iso: string) {
		return new Date(iso).toLocaleString('en-NG', {
			day:    'numeric',
			month:  'short',
			year:   'numeric',
			hour:   '2-digit',
			minute: '2-digit'
		});
	}

	function fmtJson(val: unknown) {
		if (val === null || val === undefined) return '—';
		try { return JSON.stringify(val, null, 2); } catch { return String(val); }
	}

	const ACTION_COLOURS: Record<string, string> = {
		create: 'act-green',
		update: 'act-blue',
		delete: 'act-red',
		publish:   'act-green',
		unpublish: 'act-amber',
		approve:   'act-green',
		hide:      'act-amber',
		login:     'act-gray',
		logout:    'act-gray'
	};

	function actColour(action: string) {
		for (const [key, cls] of Object.entries(ACTION_COLOURS)) {
			if (action.toLowerCase().includes(key)) return cls;
		}
		return 'act-gray';
	}
</script>

<svelte:head>
	<title>Audit Log — Shop With Mercy Admin</title>
</svelte:head>

<div class="page-header">
	<h1 class="page-title">Audit Log</h1>
	<span class="count-badge">{data.total.toLocaleString()} entries</span>
</div>

{#if data.rows.length === 0}
	<p class="empty-note">No audit log entries yet.</p>
{:else}
	<div class="table-card">
		<table class="data-table">
			<thead>
				<tr>
					<th>Time</th>
					<th>Action</th>
					<th>Table</th>
					<th>Record ID</th>
					<th>Changes</th>
				</tr>
			</thead>
			<tbody>
				{#each data.rows as row}
					<tr>
						<td class="time-cell">{fmtDate(row.created_at)}</td>
						<td>
							<span class="act-chip {actColour(row.action)}">{row.action}</span>
						</td>
						<td class="mono">{row.target_table}</td>
						<td class="mono id-cell" title={row.target_id}>{row.target_id.slice(0, 8)}…</td>
						<td class="changes-cell">
							{#if row.old_value !== null || row.new_value !== null}
								<details class="diff-details">
									<summary class="diff-summary">Show diff</summary>
									<div class="diff-body">
										{#if row.old_value !== null}
											<div class="diff-section">
												<span class="diff-label diff-old">Before</span>
												<pre class="diff-pre">{fmtJson(row.old_value)}</pre>
											</div>
										{/if}
										{#if row.new_value !== null}
											<div class="diff-section">
												<span class="diff-label diff-new">After</span>
												<pre class="diff-pre">{fmtJson(row.new_value)}</pre>
											</div>
										{/if}
									</div>
								</details>
							{:else}
								<span class="no-diff">—</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if data.totalPages > 1}
		<nav class="pagination" aria-label="Audit log pagination">
			{#if data.page > 1}
				<a href="?page={data.page - 1}" class="page-btn">← Previous</a>
			{:else}
				<span class="page-btn page-btn-disabled" aria-disabled="true">← Previous</span>
			{/if}

			<span class="page-info">Page {data.page} of {data.totalPages}</span>

			{#if data.page < data.totalPages}
				<a href="?page={data.page + 1}" class="page-btn">Next →</a>
			{:else}
				<span class="page-btn page-btn-disabled" aria-disabled="true">Next →</span>
			{/if}
		</nav>
	{/if}
{/if}

<style>
	.page-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.page-title { font-size: 1.5rem; font-weight: 700; }

	.count-badge {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		background: #f3f4f6;
		border-radius: 9999px;
		padding: 2px 10px;
	}

	.table-card {
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 1px 4px rgba(0,0,0,0.06);
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.data-table th {
		text-align: left;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e5e7eb;
		white-space: nowrap;
	}

	.data-table td {
		padding: 0.625rem 1rem;
		border-bottom: 1px solid #f3f4f6;
		color: #374151;
		vertical-align: top;
	}

	.data-table tr:last-child td { border-bottom: none; }

	.time-cell {
		color: #9ca3af;
		white-space: nowrap;
		font-size: 0.8125rem;
	}

	.mono {
		font-family: 'ui-monospace', 'SFMono-Regular', monospace;
		font-size: 0.8125rem;
	}

	.id-cell {
		color: #9ca3af;
		cursor: default;
	}

	/* Action chips */
	.act-chip {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 9999px;
		font-size: 0.7rem;
		font-weight: 600;
		white-space: nowrap;
		text-transform: lowercase;
	}

	.act-green  { background: #d1fae5; color: #065f46; }
	.act-blue   { background: #dbeafe; color: #1e40af; }
	.act-red    { background: #fee2e2; color: #991b1b; }
	.act-amber  { background: #fef3c7; color: #92400e; }
	.act-gray   { background: #f3f4f6; color: #6b7280; }

	/* Diff */
	.diff-details { max-width: 400px; }

	.diff-summary {
		font-size: 0.75rem;
		color: #7e6c5a;
		cursor: pointer;
		user-select: none;
		padding: 2px 0;
	}

	.diff-summary:hover { text-decoration: underline; }

	.diff-body {
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.diff-section {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.diff-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.diff-old { color: #991b1b; }
	.diff-new { color: #065f46; }

	.diff-pre {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 0.5rem 0.625rem;
		font-family: 'ui-monospace', 'SFMono-Regular', monospace;
		font-size: 0.7125rem;
		color: #374151;
		overflow-x: auto;
		white-space: pre;
		max-height: 200px;
		overflow-y: auto;
	}

	.no-diff { color: #d1d5db; }

	/* Pagination */
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.page-btn {
		padding: 6px 16px;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		background: #fff;
		color: #374151;
		border: 1px solid #e5e7eb;
		text-decoration: none;
		transition: background 0.15s;
		display: inline-block;
	}

	.page-btn:hover { background: #f9fafb; }

	.page-btn-disabled {
		opacity: 0.4;
		cursor: not-allowed;
		pointer-events: none;
	}

	.page-info {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.empty-note {
		color: #9ca3af;
		font-size: 0.875rem;
		padding: 2rem 0;
	}
	.changes-cell { min-width: 120px; }
</style>
