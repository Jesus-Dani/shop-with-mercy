<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	let menuOpen = $state(false);

	const links = [
		{ href: '/admin',            label: 'Dashboard' },
		{ href: '/admin/products',   label: 'Products' },
		{ href: '/admin/orders',     label: 'Orders' },
		{ href: '/admin/inventory',  label: 'Inventory' },
		{ href: '/admin/categories', label: 'Categories' },
		{ href: '/admin/reviews',    label: 'Reviews' },
		{ href: '/admin/analytics',  label: 'Analytics' },
		{ href: '/admin/customers',  label: 'Customers' },
		{ href: '/admin/audit',      label: 'Audit Log' },
	];

	function isCurrent(href: string) {
		const path = $page.url.pathname;
		return href === '/admin' ? path === '/admin' : path.startsWith(href);
	}

	const currentLabel = $derived(
		links.find(l => isCurrent(l.href))?.label ?? 'Admin'
	);
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-shell">
	<header class="admin-nav">
		<a href="/admin" class="admin-brand">SWM Admin</a>

		<!-- Desktop nav -->
		<nav class="admin-links desktop-links" aria-label="Admin navigation">
			{#each links.slice(1) as link}
				<a
					href={link.href}
					class="admin-link"
					aria-current={isCurrent(link.href) ? 'page' : undefined}
				>{link.label}</a>
			{/each}
		</nav>

		<!-- Mobile menu button -->
		<div class="mobile-right">
			<button
				class="menu-btn"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span class="menu-current">{currentLabel}</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
					class:rotated={menuOpen}
				>
					<path d="M6 9l6 6l6 -6" />
				</svg>
			</button>

			<div class="admin-user">
				<form method="POST" action="/admin/logout">
					<button type="submit" class="sign-out-btn">Sign out</button>
				</form>
			</div>
		</div>
	</header>

	<!-- Mobile dropdown -->
	{#if menuOpen}
		<button
			class="mobile-backdrop"
			aria-label="Close menu"
			onclick={() => (menuOpen = false)}
			tabindex="-1"
		></button>
		<nav class="mobile-dropdown" aria-label="Admin navigation">
			{#each links as link}
				<a
					href={link.href}
					class="mobile-link"
					aria-current={isCurrent(link.href) ? 'page' : undefined}
					onclick={() => (menuOpen = false)}
				>{link.label}</a>
			{/each}
		</nav>
	{/if}

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

	/* ── Header ───────────────────────────────────────────────── */
	.admin-nav {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-black-forest);
		border-bottom: 1px solid rgba(254, 250, 224, 0.10);
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

	/* ── Desktop links ────────────────────────────────────────── */
	.desktop-links {
		display: none;
		gap: var(--space-md);
		flex: 1;
	}

	@media (min-width: 900px) {
		.desktop-links { display: flex; flex-wrap: wrap; }
	}

	.admin-link {
		font-size: var(--text-small);
		font-weight: 500;
		color: rgba(254, 250, 224, 0.60);
		text-decoration: none;
		transition: color var(--transition-fast);
		padding-block: var(--space-xs);
		white-space: nowrap;
	}

	.admin-link:hover { color: var(--color-cornsilk); }
	.admin-link[aria-current='page'] { color: var(--color-cornsilk); }

	/* ── Mobile right cluster ─────────────────────────────────── */
	.mobile-right {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-left: auto;
	}

	@media (min-width: 900px) {
		.mobile-right { margin-left: 0; }
	}

	.menu-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: rgba(254, 250, 224, 0.08);
		border: 1px solid rgba(254, 250, 224, 0.15);
		border-radius: var(--radius-sm);
		color: var(--color-cornsilk);
		padding: 6px 10px;
		cursor: pointer;
		font: inherit;
		font-size: var(--text-small);
		font-weight: 500;
		transition: background 0.15s;
	}

	.menu-btn:hover { background: rgba(254, 250, 224, 0.14); }

	@media (min-width: 900px) {
		.menu-btn { display: none; }
	}

	.menu-current {
		max-width: 90px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.rotated { transform: rotate(180deg); }

	/* ── Sign out ─────────────────────────────────────────────── */
	.admin-user {
		display: flex;
		align-items: center;
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
		white-space: nowrap;
		font: inherit;
	}

	.sign-out-btn:hover {
		color: var(--color-cornsilk);
		border-color: rgba(254, 250, 224, 0.50);
	}

	/* ── Mobile dropdown ──────────────────────────────────────── */
	.mobile-backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: transparent;
		border: none;
		cursor: default;
		width: 100%;
		height: 100%;
	}

	.mobile-dropdown {
		position: sticky;
		top: 49px;
		z-index: 45;
		background: #1c2610;
		border-bottom: 1px solid rgba(254, 250, 224, 0.10);
		display: flex;
		flex-direction: column;
	}

	@media (min-width: 900px) {
		.mobile-backdrop,
		.mobile-dropdown { display: none; }
	}

	.mobile-link {
		padding: 13px var(--space-lg);
		font-size: var(--text-small);
		font-weight: 500;
		color: rgba(254, 250, 224, 0.70);
		text-decoration: none;
		border-bottom: 1px solid rgba(254, 250, 224, 0.07);
		transition: background 0.12s, color 0.12s;
	}

	.mobile-link:last-child { border-bottom: none; }

	.mobile-link:hover {
		background: rgba(254, 250, 224, 0.06);
		color: var(--color-cornsilk);
	}

	.mobile-link[aria-current='page'] {
		color: var(--color-cornsilk);
		background: rgba(254, 250, 224, 0.08);
	}

	/* ── Main content ─────────────────────────────────────────── */
	.admin-main {
		flex: 1;
		padding: var(--space-xl) var(--space-lg);
		max-width: 1200px;
		margin-inline: auto;
		width: 100%;
	}
</style>
