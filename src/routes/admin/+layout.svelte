<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-shell">
	<header class="admin-nav">
		<a href="/admin" class="admin-brand">SWM Admin</a>
		<nav class="admin-links">
			<a href="/admin/products" class="admin-link">Products</a>
			<a href="/admin/orders" class="admin-link">Orders</a>
			<a href="/admin/inventory" class="admin-link">Inventory</a>
			<a href="/admin/categories" class="admin-link">Categories</a>
			<a href="/admin/reviews" class="admin-link">Reviews</a>
		</nav>
		<div class="admin-user">
			<form method="POST" action="/admin/logout">
				<button type="submit" class="sign-out-btn">Sign out</button>
			</form>
		</div>
	</header>

	<main class="admin-main">
		{@render children()}
	</main>
</div>

<style>
	.admin-shell {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--bg-page);
	}

	.admin-nav {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-black-forest);
		border-bottom: 1px solid rgba(254, 250, 224, 0.10);
		flex-wrap: wrap;
	}

	.admin-brand {
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 400;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-cornsilk);
		text-decoration: none;
		flex-shrink: 0;
	}

	.admin-links {
		display: flex;
		gap: var(--space-md);
		flex: 1;
	}

	.admin-link {
		font-size: var(--text-small);
		font-weight: 500;
		color: rgba(254, 250, 224, 0.70);
		text-decoration: none;
		transition: color var(--transition-fast);
		padding-block: var(--space-xs);
	}

	.admin-link:hover { color: var(--color-cornsilk); }

	.admin-user {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-shrink: 0;
	}

	.sign-out-btn {
		font-size: var(--text-micro);
		font-weight: 500;
		color: rgba(254, 250, 224, 0.60);
		background: none;
		border: 1px solid rgba(254, 250, 224, 0.20);
		border-radius: var(--radius-sm);
		padding: 4px 10px;
		cursor: pointer;
		transition: color var(--transition-fast), border-color var(--transition-fast);
	}

	.sign-out-btn:hover {
		color: var(--color-cornsilk);
		border-color: rgba(254, 250, 224, 0.50);
	}

	.admin-main {
		flex: 1;
		padding: var(--space-xl) var(--space-lg);
		max-width: 1200px;
		margin-inline: auto;
		width: 100%;
	}
</style>
