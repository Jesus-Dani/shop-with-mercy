<script lang="ts">
	import { enhance } from '$app/forms';
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { cdnUrl, uploadToCloudinary } from '$lib/cloudinary';
	import type { ActionData } from './$types';

	let { data, form }: { data: any; form: ActionData } = $props();

	const product = $derived(data.product as any);
	const colours = $derived((product.product_colours ?? []) as any[]);

	// ── Image upload state ──
	let uploadingColourId = $state<string | null>(null);
	let uploadError = $state<string | null>(null);

	async function handleImageFiles(colourId: string, files: FileList | null) {
		if (!files?.length) return;
		uploadError = null;
		uploadingColourId = colourId;

		for (const file of Array.from(files)) {
			try {
				const publicId = await uploadToCloudinary(file, data.uploadPreset);

				const fd = new FormData();
				fd.append('colour_id', colourId);
				fd.append('public_id', publicId);

				const res = await fetch('?/addImage', { method: 'POST', body: fd });
				const result = deserialize(await res.text());
				await applyAction(result);
			} catch (e) {
				uploadError = e instanceof Error ? e.message : 'Upload failed';
				break;
			}
		}

		uploadingColourId = null;
		await invalidateAll();
	}

	// ── Tabs ──
	type Tab = 'details' | 'colours' | 'stock';
	let activeTab = $state<Tab>('details');

	let detailsSaving = $state(false);
	let detailsError = $state<string | null>(null);
	let stockSaving = $state(false);
	let stockError = $state<string | null>(null);

	let isPattern = $state(false);
</script>

<svelte:head><title>{product.name} — SWM Admin</title></svelte:head>

<div class="breadcrumb">
	<a href="/admin/products">Products</a>
	<span>/ {product.name}</span>
</div>

<div class="page-head">
	<h1 class="page-title">{product.name}</h1>
	<form method="POST" action="?/deleteProduct" use:enhance onsubmit={(e) => { if (!confirm('Delete this product permanently?')) e.preventDefault(); }}>
		<button type="submit" class="btn-danger">Delete product</button>
	</form>
</div>

<!-- Step indicator -->
<div class="tab-bar">
	{#each (['details', 'colours', 'stock'] as Tab[]) as tab, i}
		<button
			class="tab-btn"
			class:active={activeTab === tab}
			class:completed={
				(tab === 'details' && (activeTab === 'colours' || activeTab === 'stock')) ||
				(tab === 'colours' && activeTab === 'stock')
			}
			onclick={() => (activeTab = tab)}
		>
			<span class="tab-num">{i + 1}</span>
			{tab === 'details' ? 'Details' : tab === 'colours' ? 'Colours & Images' : 'Stock'}
		</button>
	{/each}
</div>

<!-- ── DETAILS TAB ── -->
{#if activeTab === 'details'}
<form
	method="POST"
	action="?/updateProduct"
	class="product-form"
	use:enhance={() => {
		detailsSaving = true;
		detailsError = null;
		return async ({ result }) => {
			detailsSaving = false;
			if (result.type === 'success') {
				await invalidateAll();
				activeTab = 'colours';
			} else if (result.type === 'failure') {
				detailsError = (result.data as any)?.error ?? 'Could not save details.';
			}
		};
	}}
>
	{#if detailsError}
		<p class="alert-error" role="alert">{detailsError}</p>
	{/if}

	<div class="form-section">
		<div class="field">
			<label for="name">Product name *</label>
			<input id="name" name="name" type="text" class="input" value={product.name} required />
		</div>
		<div class="field">
			<label for="description">Description</label>
			<textarea id="description" name="description" class="input textarea" rows="4">{product.description ?? ''}</textarea>
		</div>
		<div class="field">
			<label for="category_id">Category</label>
			<select id="category_id" name="category_id" class="input select">
				<option value="">— No category —</option>
				{#each data.categories as cat}
					<option value={cat.id} selected={cat.id === (product.categories as any)?.id}>{cat.name}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="form-section">
		<h2 class="section-title">Pricing (₦)</h2>
		<div class="price-row">
			<div class="field">
				<label for="price">Selling price *</label>
				<input id="price" name="price" type="number" min="1" step="1" class="input" value={product.price} required />
			</div>
			<div class="field">
				<label for="sale_price">Sale price</label>
				<input id="sale_price" name="sale_price" type="number" min="1" step="1" class="input" value={product.sale_price ?? ''} />
			</div>
			<div class="field">
				<label for="cost_price">Cost price <span class="hint">(private)</span></label>
				<input id="cost_price" name="cost_price" type="number" min="1" step="1" class="input" value={product.cost_price ?? ''} />
			</div>
		</div>
	</div>

	<div class="form-section">
		<label class="toggle-label">
			<input type="checkbox" name="published" class="toggle-input" checked={product.published} />
			<span class="toggle-track"><span class="toggle-thumb"></span></span>
			Published (visible on storefront)
		</label>
	</div>

	<button type="submit" class="btn btn-primary btn-next" disabled={detailsSaving}>
		{detailsSaving ? 'Saving…' : 'Next: Colours & Images →'}
	</button>
</form>
{/if}

<!-- ── COLOURS & IMAGES TAB ── -->
{#if activeTab === 'colours'}
<div class="colours-section">
	{#if uploadError}
		<p class="alert-error" role="alert">{uploadError}</p>
	{/if}

	{#if colours.length === 0}
		<div class="empty-colours">
			<p>No colours yet. Add at least one colour to attach images and stock.</p>
		</div>
	{:else}
		{#each colours as colour}
			<div class="colour-card">
				<div class="colour-head">
					{#if colour.colour_hex}
						<span class="colour-swatch" style="background: {colour.colour_hex}"></span>
					{:else}
						<span class="colour-swatch pattern-swatch" aria-label="Pattern"></span>
					{/if}
					<strong class="colour-name">{colour.colour_name}</strong>
					<form method="POST" action="?/deleteColour" use:enhance onsubmit={(e) => { if (!confirm(`Delete "${colour.colour_name}" and all its images?`)) e.preventDefault(); }}>
						<input type="hidden" name="colour_id" value={colour.id} />
						<button type="submit" class="btn-link danger">Remove colour</button>
					</form>
				</div>

				<!-- Images -->
				<div class="images-grid">
					{#each (colour.product_images ?? []) as img}
						<div class="img-wrap">
							<img src={cdnUrl(img.cloudinary_public_id, { width: 120, height: 120, crop: 'fill' })} alt="" class="img-thumb" />
							<form method="POST" action="?/deleteImage" use:enhance>
								<input type="hidden" name="image_id" value={img.id} />
								<button type="submit" class="img-delete" aria-label="Delete image">×</button>
							</form>
						</div>
					{/each}

					<!-- Upload slot -->
					<label class="upload-slot" class:loading={uploadingColourId === colour.id}>
						{#if uploadingColourId === colour.id}
							<span class="upload-spinner"></span>
							<span>Uploading…</span>
						{:else}
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
							<span>Add photos</span>
						{/if}
						<input
							type="file"
							accept="image/*"
							multiple
							disabled={uploadingColourId !== null}
							style="display:none"
							onchange={(e) => handleImageFiles(colour.id, (e.target as HTMLInputElement).files)}
						/>
					</label>
				</div>
			</div>
		{/each}
	{/if}

	<!-- Add colour form -->
	<div class="add-colour-card">
		<h3 class="section-title">Add a colour / pattern</h3>
		<form method="POST" action="?/addColour" class="add-colour-form" use:enhance onsubmit={() => { isPattern = false; }}>
			<div class="field">
				<label for="colour_name">Name</label>
				<input id="colour_name" name="colour_name" type="text" class="input" placeholder="e.g. Dusty Rose, Floral Print, Tie-Dye" required />
			</div>

			<label class="pattern-check-label">
				<input type="checkbox" bind:checked={isPattern} />
				Pattern / print (no colour swatch)
			</label>

			{#if !isPattern}
				<div class="field">
					<label for="colour_hex">Colour swatch</label>
					<input id="colour_hex" name="colour_hex" type="color" class="colour-picker" value="#b08080" />
				</div>
			{/if}

			<button type="submit" class="btn btn-primary">Add</button>
		</form>
	</div>

	<button type="button" class="btn btn-primary btn-next" onclick={() => (activeTab = 'stock')}>
		Next: Stock →
	</button>
</div>
{/if}

<!-- ── STOCK TAB ── -->
{#if activeTab === 'stock'}
<div class="stock-section">
	{#if stockError}
		<p class="alert-error" role="alert">{stockError}</p>
	{/if}

	{#if colours.length === 0}
		<p class="empty-note">Add colours first, then set stock quantities here.</p>
		<button type="button" class="btn btn-outline" onclick={() => (activeTab = 'colours')}>← Back to Colours</button>
	{:else}
		<form
			method="POST"
			action="?/updateStock"
			use:enhance={() => {
				stockSaving = true;
				stockError = null;
				return async ({ result }) => {
					stockSaving = false;
					if (result.type === 'success') {
						await goto('/admin/products');
					} else if (result.type === 'failure') {
						stockError = (result.data as any)?.error ?? 'Could not save stock.';
					}
				};
			}}
		>
			<div class="stock-table-wrap">
				<table class="stock-table">
					<thead>
						<tr>
							<th>Size</th>
							{#each colours as colour}
								<th>
									{#if colour.colour_hex}
										<span class="colour-swatch-sm" style="background:{colour.colour_hex}"></span>
									{/if}
									{colour.colour_name}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data.sizes as size}
							<tr>
								<td class="size-label">{size}</td>
								{#each colours as colour}
									{@const variant = (colour.product_variants ?? []).find((v: any) => v.size === size)}
									<td>
										{#if variant}
											<input
												type="number"
												name="variant_{variant.id}"
												value={variant.stock_quantity}
												min="0"
												class="stock-input"
											/>
										{:else}
											<span class="no-variant">—</span>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<button type="submit" class="btn btn-primary btn-next" disabled={stockSaving}>
				{stockSaving ? 'Saving…' : 'Save & finish ✓'}
			</button>
		</form>
	{/if}
</div>
{/if}

<style>
	.breadcrumb {
		font-size: var(--text-small);
		color: var(--text-secondary);
		margin-bottom: var(--space-md);
	}
	.breadcrumb a { color: var(--text-secondary); text-decoration: underline; }

	.page-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		flex-wrap: wrap;
	}

	.page-title { font-size: var(--text-h1); }

	.btn-danger {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-copperwood);
		background: none;
		border: 1px solid rgba(188, 108, 37, 0.3);
		border-radius: var(--radius-sm);
		padding: 6px 14px;
		cursor: pointer;
		transition: background var(--transition-fast);
	}
	.btn-danger:hover { background: rgba(188, 108, 37, 0.08); }

	/* Tabs / steps */
	.tab-bar {
		display: flex;
		border-bottom: 1px solid var(--border-color);
		margin-bottom: var(--space-xl);
		overflow-x: auto;
		scrollbar-width: none;
	}
	.tab-bar::-webkit-scrollbar { display: none; }

	.tab-btn {
		padding: var(--space-sm) var(--space-lg);
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		white-space: nowrap;
		min-height: 44px;
		margin-bottom: -1px;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		transition: color var(--transition-fast), border-color var(--transition-fast);
	}
	.tab-btn:hover { color: var(--text-primary); }
	.tab-btn.active { color: var(--text-primary); border-bottom-color: var(--color-black-forest); }
	.tab-btn.completed { color: var(--color-olive-leaf); }

	.tab-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		font-size: 11px;
		font-weight: 700;
		border: 1.5px solid var(--border-color);
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.tab-btn.active .tab-num {
		background: var(--color-black-forest);
		color: var(--color-cornsilk);
		border-color: var(--color-black-forest);
	}

	.tab-btn.completed .tab-num {
		background: var(--color-olive-leaf);
		color: white;
		border-color: var(--color-olive-leaf);
	}

	/* Next button */
	.btn-next {
		margin-top: var(--space-lg);
		align-self: flex-start;
	}

	/* Details form */
	.product-form { display: flex; flex-direction: column; gap: var(--space-lg); max-width: 640px; }
	.form-section {
		display: flex; flex-direction: column; gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
	}
	.section-title { font-size: var(--text-h3); font-weight: 600; }
	.field { display: flex; flex-direction: column; gap: var(--space-xs); }
	label { font-size: var(--text-small); font-weight: 500; color: var(--text-secondary); }
	.hint { font-size: var(--text-micro); font-weight: 400; color: var(--text-secondary); }
	.textarea { resize: vertical; min-height: 96px; }
	.select { appearance: none; cursor: pointer; }
	.price-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md); }
	@media (max-width: 600px) { .price-row { grid-template-columns: 1fr; } }

	.toggle-label {
		display: flex; align-items: center; gap: var(--space-sm);
		cursor: pointer; font-size: var(--text-small); font-weight: 500; color: var(--text-primary);
	}
	.toggle-input { display: none; }
	.toggle-track {
		width: 40px; height: 22px; background: var(--border-color); border-radius: 11px;
		position: relative; flex-shrink: 0; transition: background var(--transition-fast);
	}
	.toggle-input:checked + .toggle-track { background: var(--color-olive-leaf); }
	.toggle-thumb {
		position: absolute; top: 3px; left: 3px; width: 16px; height: 16px;
		background: white; border-radius: 50%; transition: transform var(--transition-fast);
	}
	.toggle-input:checked + .toggle-track .toggle-thumb { transform: translateX(18px); }

	/* Alerts */
	.alert-error {
		background: rgba(188, 108, 37, 0.10); color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.30); border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md); font-size: var(--text-small); max-width: none;
	}

	/* Colours */
	.colours-section { display: flex; flex-direction: column; gap: var(--space-lg); }

	.empty-colours {
		padding: var(--space-2xl) var(--space-lg);
		text-align: center;
		color: var(--text-secondary);
		background: var(--bg-card);
		border: 1px dashed var(--border-color);
		border-radius: var(--radius-md);
	}

	.colour-card {
		padding: var(--space-lg);
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		display: flex; flex-direction: column; gap: var(--space-md);
	}

	.colour-head {
		display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap;
	}
	.colour-swatch {
		width: 20px; height: 20px; border-radius: 50%;
		border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0;
	}
	.pattern-swatch {
		background: repeating-linear-gradient(
			45deg,
			var(--border-color) 0px,
			var(--border-color) 3px,
			transparent 3px,
			transparent 8px
		);
	}
	.colour-name { font-size: var(--text-small); font-weight: 600; flex: 1; }

	.btn-link {
		font-size: var(--text-micro); font-weight: 500; background: none; border: none;
		cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 2px;
	}
	.btn-link.danger { color: var(--color-copperwood); }

	.images-grid {
		display: flex; flex-wrap: wrap; gap: var(--space-sm);
	}

	.img-wrap { position: relative; }
	.img-thumb {
		width: 80px; height: 80px; object-fit: cover;
		border-radius: var(--radius-sm); display: block;
	}
	.img-delete {
		position: absolute; top: -6px; right: -6px;
		width: 20px; height: 20px; border-radius: 50%;
		background: var(--color-copperwood); color: white;
		font-size: 14px; line-height: 1; border: none; cursor: pointer;
		display: flex; align-items: center; justify-content: center;
	}

	.upload-slot {
		width: 80px; height: 80px;
		border: 2px dashed var(--border-color); border-radius: var(--radius-sm);
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		gap: 4px; cursor: pointer; color: var(--text-secondary); font-size: 10px;
		transition: border-color var(--transition-fast), color var(--transition-fast);
	}
	.upload-slot:hover { border-color: var(--text-secondary); color: var(--text-primary); }
	.upload-slot.loading { opacity: 0.6; cursor: not-allowed; }

	@keyframes spin { to { transform: rotate(360deg); } }
	.upload-spinner {
		width: 20px; height: 20px; border: 2px solid var(--border-color);
		border-top-color: var(--text-primary); border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.add-colour-card {
		padding: var(--space-lg);
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		display: flex; flex-direction: column; gap: var(--space-md);
	}

	.pattern-check-label {
		display: flex; align-items: center; gap: var(--space-xs);
		font-size: var(--text-small); color: var(--text-secondary); cursor: pointer;
	}
	.pattern-check-label input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }

	.add-colour-form {
		display: flex; flex-direction: column; gap: var(--space-md);
	}
	.add-colour-form .field { min-width: 160px; }
	.colour-picker {
		width: 100%; height: 40px; padding: 2px 4px;
		border: 1px solid var(--border-color); border-radius: var(--radius-sm);
		cursor: pointer; background: var(--bg-card);
	}

	/* Stock */
	.stock-section { display: flex; flex-direction: column; gap: var(--space-md); }
	.empty-note { color: var(--text-secondary); font-size: var(--text-small); max-width: none; }

	.stock-table-wrap { overflow-x: auto; }

	.stock-table {
		width: 100%; border-collapse: collapse;
		font-size: var(--text-small);
	}

	.stock-table th, .stock-table td {
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--border-color);
		text-align: center;
	}

	.stock-table th {
		background: var(--bg-page);
		font-weight: 600;
		white-space: nowrap;
	}

	.colour-swatch-sm {
		display: inline-block;
		width: 10px; height: 10px; border-radius: 50%;
		border: 1px solid rgba(0,0,0,0.15);
		vertical-align: middle; margin-right: 4px;
	}

	.size-label { font-weight: 600; background: var(--bg-page); text-align: left; }

	.stock-input {
		width: 72px; padding: 6px 8px; text-align: center;
		border: 1px solid var(--border-color); border-radius: var(--radius-sm);
		background: var(--bg-card); color: var(--text-primary); font-size: var(--text-small);
	}

	.no-variant { color: var(--text-secondary); }
</style>
