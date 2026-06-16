<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId = $state<string | null>(null);
</script>

<svelte:head><title>Categories — SWM Admin</title></svelte:head>

<div class="page-head">
	<h1 class="page-title">Categories</h1>
</div>

{#if (form as any)?.error}
	<p class="alert-error" role="alert">{(form as any).error}</p>
{/if}

<div class="layout">
	<!-- Category list -->
	<div class="card">
		<h2 class="section-title">All categories ({data.categories.length})</h2>

		{#if data.categories.length === 0}
			<p class="empty-note">No categories yet.</p>
		{:else}
			<ul class="cat-list">
				{#each data.categories as cat}
					<li class="cat-item">
						{#if editingId === cat.id}
							<form method="POST" action="?/rename" class="rename-form" use:enhance={() => () => { editingId = null; }}>
								<input type="hidden" name="id" value={cat.id} />
								<input type="text" name="name" class="input" value={cat.name} required autofocus />
								<button type="submit" class="btn btn-primary btn-sm">Save</button>
								<button type="button" class="btn btn-ghost btn-sm" onclick={() => (editingId = null)}>Cancel</button>
							</form>
						{:else}
							<span class="cat-name">{cat.name}</span>
							<div class="cat-actions">
								<button type="button" class="btn-link" onclick={() => (editingId = cat.id)}>Rename</button>
								<form method="POST" action="?/delete" use:enhance onsubmit={(e) => { if (!confirm(`Delete "${cat.name}"? Products in this category will be uncategorised.`)) e.preventDefault(); }}>
									<input type="hidden" name="id" value={cat.id} />
									<button type="submit" class="btn-link danger">Delete</button>
								</form>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Add category -->
	<div class="card">
		<h2 class="section-title">Add category</h2>
		<form method="POST" action="?/create" class="add-form" use:enhance>
			<div class="field">
				<label for="name">Category name</label>
				<input id="name" name="name" type="text" class="input" placeholder="e.g. Tops" required />
			</div>
			<button type="submit" class="btn btn-primary">Add category</button>
		</form>
	</div>
</div>

<style>
	.page-head { margin-bottom: var(--space-xl); }
	.page-title { font-size: var(--text-h1); }

	.alert-error {
		background: rgba(188, 108, 37, 0.10); color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.30); border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md); font-size: var(--text-small);
		margin-bottom: var(--space-lg); max-width: none;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: var(--space-xl);
		align-items: start;
	}

	@media (max-width: 768px) {
		.layout { grid-template-columns: 1fr; }
	}

	.card {
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex; flex-direction: column; gap: var(--space-md);
	}

	.section-title { font-size: var(--text-h3); font-weight: 600; }

	.empty-note { color: var(--text-secondary); font-size: var(--text-small); }

	.cat-list { list-style: none; display: flex; flex-direction: column; gap: 0; }

	.cat-item {
		display: flex; align-items: center; justify-content: space-between; gap: var(--space-md);
		padding: var(--space-sm) 0;
		border-bottom: 1px solid var(--border-color);
	}
	.cat-item:last-child { border-bottom: none; }

	.cat-name { font-size: var(--text-small); font-weight: 500; }

	.cat-actions { display: flex; gap: var(--space-sm); flex-shrink: 0; }

	.rename-form { display: flex; gap: var(--space-sm); flex: 1; align-items: center; flex-wrap: wrap; }
	.rename-form .input { flex: 1; min-width: 120px; }

	.btn-sm { padding: 5px 12px; font-size: var(--text-micro); }

	.btn-link {
		font-size: var(--text-micro); font-weight: 500;
		background: none; border: none; cursor: pointer; padding: 0;
		text-decoration: underline; text-underline-offset: 2px; color: var(--text-secondary);
	}
	.btn-link:hover { color: var(--text-primary); }
	.btn-link.danger { color: var(--color-copperwood); }

	.add-form { display: flex; flex-direction: column; gap: var(--space-md); }
	.field { display: flex; flex-direction: column; gap: var(--space-xs); }
	label { font-size: var(--text-small); font-weight: 500; color: var(--text-secondary); }
</style>
