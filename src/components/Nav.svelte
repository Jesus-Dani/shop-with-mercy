<script lang="ts">
	import { theme, themeStore } from '$lib/theme';

	interface Props {
		cartCount?: number;
		wishlistCount?: number;
		user?: { full_name: string } | null;
	}

	let { cartCount = 0, wishlistCount = 0, user = null }: Props = $props();

	let drawerOpen = $state(false);

	function closeDrawer() {
		drawerOpen = false;
	}

	const navLinks = [
		{ href: '/shop', label: 'Shop' },
		{ href: '/shop?category=tops', label: 'Tops' },
		{ href: '/shop?category=skirts', label: 'Skirts' }
	];
</script>

<!-- Skip to main content -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<nav class="nav" aria-label="Main navigation">
	<div class="nav-inner page-container">
		<!-- Left: hamburger (mobile) + category links (desktop) -->
		<div class="nav-left">
			<button
				class="hamburger btn-ghost"
				aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={drawerOpen}
				aria-controls="nav-drawer"
				onclick={() => (drawerOpen = !drawerOpen)}
			>
				{#if drawerOpen}
					<!-- X icon -->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
						<path d="M18 6l-12 12" />
						<path d="M6 6l12 12" />
					</svg>
				{:else}
					<!-- Hamburger icon -->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
						<path d="M4 6l16 0" />
						<path d="M4 12l16 0" />
						<path d="M4 18l16 0" />
					</svg>
				{/if}
			</button>

			<ul class="desktop-links" role="list">
				{#each navLinks as link}
					<li><a href={link.href} class="nav-link">{link.label}</a></li>
				{/each}
			</ul>
		</div>

		<!-- Centre: wordmark -->
		<a href="/" class="wordmark" aria-label="Shop With Mercy — home">
			Shop With Mercy
		</a>

		<!-- Right: search, wishlist, cart, account, theme toggle -->
		<div class="nav-right">
			<!-- Search -->
			<a href="/search" class="nav-icon-btn" aria-label="Search">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
					<path d="M21 21l-6 -6" />
				</svg>
			</a>

			<!-- Wishlist -->
			<a href="/account/wishlist" class="nav-icon-btn" aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
				</svg>
			</a>

			<!-- Cart -->
			<a href="/cart" class="nav-icon-btn cart-btn" aria-label={cartCount > 0 ? `Your cart, ${cartCount} items` : 'Your cart'}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
					<path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
					<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2 -1.61l1.6 -8.39h-16.12" />
				</svg>
				{#if cartCount > 0}
					<span class="cart-badge" aria-hidden="true">{cartCount > 9 ? '9+' : cartCount}</span>
				{/if}
			</a>

			<!-- Account -->
			<a href={user ? '/account' : '/auth/sign-in'} class="nav-icon-btn" aria-label={user ? `Account — ${user.full_name}` : 'Sign in'}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
					<path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
					<path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
				</svg>
				{#if user}
					<span class="account-name">{user.full_name.split(' ')[0]}</span>
				{/if}
			</a>

			<!-- Theme toggle -->
			<button
				class="nav-icon-btn theme-toggle"
				aria-label={$themeStore === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
				onclick={theme.toggle}
			>
				{#if $themeStore === 'dark'}
					<!-- Sun icon -->
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
						<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
						<path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
					</svg>
				{:else}
					<!-- Moon icon -->
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
						<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
</nav>

<!-- Mobile drawer -->
{#if drawerOpen}
	<!-- Backdrop -->
	<button
		class="drawer-backdrop"
		aria-label="Close menu"
		onclick={closeDrawer}
		tabindex="-1"
	></button>
{/if}

<div
	id="nav-drawer"
	class="drawer"
	class:drawer-open={drawerOpen}
	aria-hidden={!drawerOpen}
>
	<nav aria-label="Mobile navigation">
		<ul role="list">
			{#each navLinks as link}
				<li>
					<a href={link.href} class="drawer-link" onclick={closeDrawer}>{link.label}</a>
				</li>
			{/each}
			<li class="drawer-divider"></li>
			<li>
				<a href="/search" class="drawer-link" onclick={closeDrawer}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline;vertical-align:-2px;margin-right:6px"><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/></svg>Search
				</a>
			</li>
			<li>
				<a href={user ? '/account' : '/auth/sign-in'} class="drawer-link" onclick={closeDrawer}>
					{user ? `My Account (${user.full_name.split(' ')[0]})` : 'Sign in'}
				</a>
			</li>
			<li>
				<a href="/refund-policy" class="drawer-link" onclick={closeDrawer}>Refund Policy</a>
			</li>
		</ul>
	</nav>
</div>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 100;
		background-color: var(--color-black-forest-nav);
		height: var(--nav-height);
		display: flex;
		align-items: center;
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		height: 100%;
	}

	.nav-left {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex: 1;
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-cornsilk);
		text-decoration: none;
		white-space: nowrap;
		flex: 1;
		text-align: center;
	}

	@media (min-width: 768px) {
		.wordmark {
			flex: 0 0 auto;
			text-align: left;
			font-size: 16px;
		}
	}

	.desktop-links {
		display: none;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.desktop-links {
			display: flex;
		}
	}

	.nav-link {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-cornsilk);
		text-decoration: none;
		transition: color var(--transition-fast);
		padding-block: var(--space-xs);
	}

	.nav-link:hover {
		color: var(--color-sunlit-clay);
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		flex: 1;
		justify-content: flex-end;
	}

	.nav-icon-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-cornsilk);
		padding: var(--space-sm);
		border-radius: var(--radius-md);
		min-width: 44px;
		min-height: 44px;
		justify-content: center;
		transition: color var(--transition-fast), background-color var(--transition-fast);
		position: relative;
		text-decoration: none;
		background: none;
		border: none;
		cursor: pointer;
		font: inherit;
	}

	.nav-icon-btn:hover {
		color: var(--color-sunlit-clay);
	}

	.nav-icon-btn:focus-visible {
		outline: 2px solid var(--color-sunlit-clay);
		outline-offset: 2px;
	}

	.account-name {
		font-size: var(--text-small);
		font-weight: 500;
		display: none;
	}

	@media (min-width: 768px) {
		.account-name {
			display: block;
		}
	}

	.cart-btn {
		position: relative;
	}

	.cart-badge {
		position: absolute;
		top: 4px;
		right: 4px;
		min-width: 16px;
		height: 16px;
		padding: 0 3px;
		background-color: var(--color-sunlit-clay);
		color: var(--color-black-forest);
		border-radius: 8px;
		font-size: 10px;
		font-weight: 700;
		line-height: 16px;
		text-align: center;
	}

	.hamburger {
		display: flex;
		color: var(--color-cornsilk);
	}

	@media (min-width: 768px) {
		.hamburger {
			display: none;
		}
	}

	/* ── Drawer ── */
	.drawer-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 99;
		border: none;
		cursor: pointer;
		width: 100%;
		height: 100%;
	}

	.drawer {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: min(280px, 85vw);
		background-color: var(--color-black-forest);
		z-index: 200;
		padding: var(--space-2xl) var(--space-lg) var(--space-lg);
		transform: translateX(-100%);
		transition: transform var(--transition-medium);
		overflow-y: auto;
	}

	.drawer-open {
		transform: translateX(0);
	}

	.drawer-link {
		display: block;
		padding: var(--space-md) 0;
		font-size: var(--text-body);
		font-weight: 500;
		color: var(--color-cornsilk);
		text-decoration: none;
		border-bottom: 1px solid rgba(254, 250, 224, 0.10);
		transition: color var(--transition-fast);
	}

	.drawer-link:hover {
		color: var(--color-sunlit-clay);
	}

	.drawer-divider {
		height: 1px;
		background: rgba(254, 250, 224, 0.20);
		margin-block: var(--space-sm);
	}
</style>
