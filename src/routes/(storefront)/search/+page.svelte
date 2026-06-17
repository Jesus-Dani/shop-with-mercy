<script lang="ts">
	import { goto } from '$app/navigation';
	import ProductCard from '$components/ProductCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let inputValue = $state('');
	$effect(() => {
		inputValue = data.q;
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const q = inputValue.trim();
		if (q) {
			goto(`/search?q=${encodeURIComponent(q)}`);
		}
	}
</script>

<svelte:head>
	<title>{data.q ? `"${data.q}" — Search` : 'Search'} — Shop With Mercy</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page-container search-page">
	<!-- Search form -->
	<form class="search-form" onsubmit={handleSubmit} role="search">
		<label for="search-input" class="search-label">Search products</label>
		<div class="search-input-wrap">
			<span class="search-icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
					<path d="M21 21l-6 -6" />
				</svg>
			</span>
			<input
				id="search-input"
				type="search"
				name="q"
				class="search-input"
				placeholder="Search for tops, skirts, dresses…"
				value={inputValue}
				oninput={(e) => {
					inputValue = (e.target as HTMLInputElement).value;
				}}
				autocomplete="off"
			/>
			{#if inputValue}
				<button
					type="submit"
					class="search-submit btn btn-primary"
					aria-label="Search"
				>Go</button>
			{/if}
		</div>
	</form>

	<!-- Results -->
	{#if data.q}
		<div class="results-header">
			{#if data.results.length > 0}
				<p class="results-count">
					{data.results.length} result{data.results.length !== 1 ? 's' : ''} for
					<strong>"{data.q}"</strong>
				</p>
			{:else}
				<p class="results-empty">
					No results for <strong>"{data.q}"</strong>. Try a different search or
					<a href="/shop">browse all products</a>.
				</p>
			{/if}
		</div>

		{#if data.results.length > 0}
			<ul class="product-grid" role="list">
				{#each data.results as product (product.id)}
					<li><ProductCard {...product} /></li>
				{/each}
			</ul>
		{/if}
	{:else}
		<p class="search-prompt">
			Start typing to search our collection, or <a href="/shop">browse all products</a>.
		</p>
	{/if}
</div>

<style>
	.search-page {
		padding-block: var(--space-xl) var(--space-2xl);
	}

	.search-form {
		margin-bottom: var(--space-xl);
	}

	.search-label {
		font-size: var(--text-h2);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--space-md);
		display: block;
	}

	.search-input-wrap {
		position: relative;
		display: flex;
		align-items: center;
		max-width: 640px;
	}

	.search-icon {
		position: absolute;
		left: var(--space-md);
		color: var(--text-secondary);
		pointer-events: none;
		display: flex;
	}

	.search-input {
		width: 100%;
		padding: 14px var(--space-md) 14px 48px;
		font: inherit;
		font-size: var(--text-body);
		color: var(--text-primary);
		background: var(--bg-card);
		border: 1.5px solid var(--border-color);
		border-radius: var(--radius-md);
		outline: none;
		min-height: 52px;
		transition: border-color var(--transition-fast);
	}

	.search-input:focus {
		border-color: var(--input-focus);
		border-width: 2px;
	}

	/* Remove browser default search cancel button */
	.search-input::-webkit-search-cancel-button {
		display: none;
	}

	.search-submit {
		position: absolute;
		right: var(--space-xs);
		padding: 8px 16px;
		min-height: 36px;
	}

	.results-header {
		margin-bottom: var(--space-lg);
	}

	.results-count {
		font-size: var(--text-body);
		color: var(--text-secondary);
		max-width: none;
	}

	.results-empty {
		font-size: var(--text-body);
		color: var(--text-secondary);
		max-width: none;
	}

	.results-empty a,
	.search-prompt a {
		color: var(--color-copperwood);
		text-decoration: underline;
	}

	.search-prompt {
		color: var(--text-secondary);
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.product-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-lg);
		}
	}

	@media (min-width: 1280px) {
		.product-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
