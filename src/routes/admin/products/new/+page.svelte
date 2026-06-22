<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { data, form }: { data: any; form: ActionData } = $props();

	let showNewCategory = $state(false);
	let loading = $state(false);
</script>

<svelte:head><title>New Product — SWM Admin</title></svelte:head>

<div class="breadcrumb">
	<a href="/admin/products">Products</a>
	<span>/ New Product</span>
</div>

<h1 class="page-title">New Product</h1>
<p class="page-sub">After saving, you'll be taken to the product page to add colours, images, and stock.</p>

{#if form?.error}
	<p class="alert-error" role="alert">{form.error}</p>
{/if}

<form
	method="POST"
	action="?/create"
	class="product-form"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => { loading = false; await update(); };
	}}
>
	<div class="form-section">
		<h2 class="section-title">Basic Info</h2>

		<div class="field">
			<label for="name">Product name <span class="req">*</span></label>
			<input id="name" name="name" type="text" class="input" value={form?.fields?.name ?? ''} required placeholder="e.g. Wrap Midi Skirt" />
		</div>

		<div class="field">
			<label for="description">Description</label>
			<textarea id="description" name="description" class="input textarea" rows="4" placeholder="Describe the product…">{form?.fields?.description ?? ''}</textarea>
		</div>

		<div class="field">
			<label for="category_id">Category</label>
			{#if !showNewCategory}
				<div class="cat-row">
					<select id="category_id" name="category_id" class="input select">
						<option value="">— No category —</option>
						{#each data.categories as cat}
							<option value={cat.id}>{cat.name}</option>
						{/each}
					</select>
					<button type="button" class="btn btn-ghost" onclick={() => (showNewCategory = true)}>+ New</button>
				</div>
			{:else}
				<div class="cat-row">
					<input name="new_category" type="text" class="input" placeholder="Category name" autofocus />
					<button type="button" class="btn btn-ghost" onclick={() => (showNewCategory = false)}>Cancel</button>
				</div>
			{/if}
		</div>
	</div>

	<div class="form-section">
		<h2 class="section-title">Pricing <span class="hint">(enter in Naira — stored as kobo internally)</span></h2>

		<div class="price-row">
			<div class="field">
				<label for="price">Selling price ₦ <span class="req">*</span></label>
				<input id="price" name="price" type="number" min="1" step="1" class="input" placeholder="5000" required />
			</div>
			<div class="field">
				<label for="sale_price">Sale price ₦ <span class="hint">(optional)</span></label>
				<input id="sale_price" name="sale_price" type="number" min="1" step="1" class="input" placeholder="4000" />
			</div>
			<div class="field">
				<label for="cost_price">Cost price ₦ <span class="hint">(private)</span></label>
				<input id="cost_price" name="cost_price" type="number" min="1" step="1" class="input" placeholder="2000" />
			</div>
		</div>
	</div>

	<div class="form-section">
		<div class="publish-row">
			<label class="toggle-label">
				<input type="checkbox" name="published" class="toggle-input" />
				<span class="toggle-track">
					<span class="toggle-thumb"></span>
				</span>
				Publish immediately
			</label>
			<p class="toggle-hint">Unpublished products are only visible to you in the admin.</p>
		</div>
	</div>

	<div class="form-actions">
		<a href="/admin/products" class="btn btn-outline">Cancel</a>
		<button type="submit" class="btn btn-primary" disabled={loading}>
			{loading ? 'Creating…' : 'Create & add photos →'}
		</button>
	</div>
</form>

<style>
	.breadcrumb {
		font-size: var(--text-small);
		color: var(--text-secondary);
		margin-bottom: var(--space-md);
	}
	.breadcrumb a { color: var(--text-secondary); text-decoration: underline; }

	.page-title { font-size: var(--text-h1); margin-bottom: var(--space-xs); }
	.page-sub { font-size: var(--text-small); color: var(--text-secondary); margin-bottom: var(--space-xl); }

	.alert-error {
		background: rgba(188, 108, 37, 0.10);
		color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.30);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-small);
		margin-bottom: var(--space-lg);
		max-width: none;
	}

	.product-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		max-width: 640px;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
	}

	.section-title {
		font-size: var(--text-h3);
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.field { display: flex; flex-direction: column; gap: var(--space-xs); }

	label {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
	}

	.req { color: var(--color-copperwood); }
	.hint { font-size: var(--text-micro); font-weight: 400; color: var(--text-secondary); }

	.textarea { resize: vertical; min-height: 96px; }

	.select { appearance: none; cursor: pointer; }

	.cat-row { display: flex; gap: var(--space-sm); }
	.cat-row .input { flex: 1; }

	.price-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: var(--space-md);
	}

	@media (max-width: 600px) {
		.price-row { grid-template-columns: 1fr; }
	}

	.publish-row { display: flex; flex-direction: column; gap: var(--space-xs); }

	.toggle-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		cursor: pointer;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-primary);
	}

	.toggle-input { display: none; }

	.toggle-track {
		width: 40px;
		height: 22px;
		background: var(--border-color);
		border-radius: 11px;
		position: relative;
		flex-shrink: 0;
		transition: background var(--transition-fast);
	}

	.toggle-input:checked + .toggle-track { background: var(--color-olive-leaf); }

	.toggle-thumb {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 16px;
		height: 16px;
		background: white;
		border-radius: 50%;
		transition: transform var(--transition-fast);
	}

	.toggle-input:checked + .toggle-track .toggle-thumb { transform: translateX(18px); }

	.toggle-hint { font-size: var(--text-micro); color: var(--text-secondary); margin-left: 52px; }

	.form-actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}
</style>
