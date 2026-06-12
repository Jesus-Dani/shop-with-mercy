<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Shop With Mercy</title>
</svelte:head>

<div class="error-page page-container">
	<h1 class="error-status">{page.status}</h1>
	<p class="error-message">{page.error?.message ?? 'Something went wrong'}</p>
	{#if page.status === 500 && (page.error as { stack?: string })?.stack}
		<pre class="error-stack">{(page.error as { stack?: string }).stack}</pre>
	{/if}
	<a href="/" class="btn btn-primary" style="margin-top: var(--space-xl)">Go home</a>
</div>

<style>
	.error-page {
		padding-block: var(--space-2xl);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.error-status {
		font-size: 5rem;
		font-weight: 700;
		color: var(--color-black-forest);
		line-height: 1;
	}

	.error-message {
		font-size: var(--text-body);
		color: var(--text-secondary);
		max-width: 480px;
	}

	.error-stack {
		text-align: left;
		font-size: 12px;
		font-family: monospace;
		background: #f5f5f5;
		color: #333;
		padding: var(--space-md);
		border-radius: var(--radius-md);
		overflow-x: auto;
		max-width: 800px;
		width: 100%;
		white-space: pre-wrap;
	}
</style>
