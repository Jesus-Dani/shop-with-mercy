<script lang="ts">
	import { theme, themeStore } from '$lib/theme';
	import { cart } from '$lib/cart.svelte';
	import { page } from '$app/stores';

	interface Props {
		wishlistCount?: number;
		user?: { full_name: string } | null;
	}

	let { wishlistCount = 0, user = null }: Props = $props();

	let drawerOpen  = $state(false);
	let infoOpen    = $state(false);
	let activeModal = $state<'refund' | 'privacy' | 'contact' | null>(null);

	function closeDrawer() { drawerOpen = false; }

	function openModal(type: 'refund' | 'privacy' | 'contact') {
		activeModal = type;
		infoOpen    = false;
		drawerOpen  = false;
	}
	function closeModal() { activeModal = null; }

	const navLinks = [
		{ href: '/shop',               label: 'Shop' },
		{ href: '/shop?category=tops',   label: 'Tops' },
		{ href: '/shop?category=skirts', label: 'Skirts' }
	];

	function isCurrent(href: string) {
		const path = $page.url.pathname;
		return href === '/shop' ? path === '/shop' : path.startsWith(href.split('?')[0]);
	}

	const isHome = $derived($page.url.pathname === '/');
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
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M18 6l-12 12" /><path d="M6 6l12 12" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" />
					</svg>
				{/if}
			</button>

			<ul class="desktop-links" role="list">
				{#if !isHome}
					<li>
						<a href="/" class="nav-link nav-link-home">← Home</a>
					</li>
				{/if}
				{#each navLinks as link}
					<li>
						<a
							href={link.href}
							class="nav-link"
							aria-current={isCurrent(link.href) ? 'page' : undefined}
						>{link.label}</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Centre: wordmark -->
		<a href="/" class="wordmark" aria-label="Shop With Mercy — home">
			Shop With Mercy
		</a>

		<!-- Right: search, wishlist, cart, account, theme toggle, info -->
		<div class="nav-right">
			<a href="/search" class="nav-icon-btn" aria-label="Search">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" />
				</svg>
			</a>

			<a href="/account/wishlist" class="nav-icon-btn" aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
				</svg>
			</a>

			<button
				class="nav-icon-btn cart-btn"
				aria-label={cart.count > 0 ? `Your cart, ${cart.count} items` : 'Your cart'}
				onclick={cart.toggle}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
					<path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
					<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2 -1.61l1.6 -8.39h-16.12" />
				</svg>
				{#if cart.count > 0}
					<span class="cart-badge" aria-hidden="true">{cart.count > 9 ? '9+' : cart.count}</span>
				{/if}
			</button>

			<a href={user ? '/account' : '/auth/sign-in'} class="nav-icon-btn" aria-label={user ? `Account — ${user.full_name}` : 'Sign in'}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
					<path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
					<path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
				</svg>
				{#if user}
					<span class="account-name">{user.full_name.split(' ')[0]}</span>
				{/if}
			</a>

			<button
				class="nav-icon-btn theme-toggle"
				aria-label={$themeStore === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
				onclick={theme.toggle}
			>
				{#if $themeStore === 'dark'}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
						<path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
					</svg>
				{/if}
			</button>

			<!-- Info menu (•••) -->
			<div class="info-wrap">
				<button
					class="nav-icon-btn"
					aria-label="More information"
					aria-expanded={infoOpen}
					onclick={() => (infoOpen = !infoOpen)}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
						<path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
						<path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
					</svg>
				</button>

				{#if infoOpen}
					<button
						class="info-backdrop"
						aria-label="Close menu"
						onclick={() => (infoOpen = false)}
						tabindex="-1"
					></button>
					<div class="info-dropdown" role="menu">
						<button class="info-item" role="menuitem" onclick={() => openModal('refund')}>Refund Policy</button>
						<button class="info-item" role="menuitem" onclick={() => openModal('privacy')}>Privacy Policy</button>
						<button class="info-item" role="menuitem" onclick={() => openModal('contact')}>Get in Touch</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</nav>

<!-- Mobile drawer -->
{#if drawerOpen}
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
	inert={!drawerOpen || undefined}
>
	<nav aria-label="Mobile navigation">
		<ul role="list">
			<li>
				<a href="/" class="drawer-link" aria-current={isHome ? 'page' : undefined} onclick={closeDrawer}>Home</a>
			</li>
			{#each navLinks as link}
				<li>
					<a href={link.href} class="drawer-link" aria-current={isCurrent(link.href) ? 'page' : undefined} onclick={closeDrawer}>{link.label}</a>
				</li>
			{/each}

			<li class="drawer-divider" role="separator"></li>

			<li>
				<a href="/search" class="drawer-link" onclick={closeDrawer}>Search</a>
			</li>
			{#if user}
				<li><a href="/account/wishlist" class="drawer-link" onclick={closeDrawer}>Wishlist</a></li>
				<li><a href="/account" class="drawer-link" onclick={closeDrawer}>My Account</a></li>
			{:else}
				<li><a href="/auth/sign-in" class="drawer-link" onclick={closeDrawer}>Sign in</a></li>
			{/if}

			<li class="drawer-divider" role="separator"></li>

			<li>
				<button class="drawer-link drawer-link-btn" onclick={() => openModal('refund')}>Refund Policy</button>
			</li>
			<li>
				<button class="drawer-link drawer-link-btn" onclick={() => openModal('privacy')}>Privacy Policy</button>
			</li>
			<li>
				<button class="drawer-link drawer-link-btn" onclick={() => openModal('contact')}>Get in Touch</button>
			</li>
		</ul>
	</nav>
</div>

<!-- ── Modals ──────────────────────────────────────────────────────────── -->
{#if activeModal}
	<div
		class="modal-overlay"
		role="dialog"
		aria-modal="true"
		aria-label={activeModal === 'refund' ? 'Refund Policy' : activeModal === 'privacy' ? 'Privacy Policy' : 'Get in Touch'}
		onclick={closeModal}
	>
		<div class="modal-card" onclick={(e) => e.stopPropagation()}>
			<button class="modal-close" aria-label="Close" onclick={closeModal}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M18 6l-12 12" /><path d="M6 6l12 12" />
				</svg>
			</button>

			{#if activeModal === 'refund'}
				<h2 class="modal-title">Refund Policy</h2>
				<div class="modal-body">
					<p>All sales are final.</p>
					<p>We inspect every item carefully before it leaves us. If your order arrives faulty, the wrong size, or significantly different from what was shown, contact us on WhatsApp within <strong>48 hours of delivery</strong> and we will make it right.</p>
					<p>We do not accept returns or exchanges for change of mind. Please check sizing carefully before placing your order.</p>
					<a href="https://wa.me/2349049435149" class="modal-cta" target="_blank" rel="noopener noreferrer">Contact us on WhatsApp</a>
				</div>

			{:else if activeModal === 'privacy'}
				<h2 class="modal-title">Privacy Policy</h2>
				<div class="modal-body">
					<p><strong>What we collect</strong><br>When you order: your name, email, and phone number. When you create an account: your email and display name via Supabase Auth. Browsing events (product views, cart adds) are collected anonymously or linked to your account if signed in.</p>
					<p><strong>How we use it</strong><br>To fulfil your orders, personalise your experience, and understand which products are popular. We do not sell your data or use it for external advertising.</p>
					<p><strong>Cookies</strong><br>One session cookie when signed in — no third-party advertising cookies.</p>
					<p><strong>Your rights</strong><br>Email us at <a href="mailto:support@shopwithmercywears.com">support@shopwithmercywears.com</a> to view, correct, or delete your data. We respond within 14 days.</p>
					<p class="modal-updated">Last updated June 2026</p>
				</div>

			{:else if activeModal === 'contact'}
				<h2 class="modal-title">Get in Touch</h2>
				<div class="modal-body">
					<p>We're always happy to hear from you. Reach us through any of these:</p>
					<ul class="contact-list">
						<li>
							<a href="https://wa.me/2349049435149" target="_blank" rel="noopener noreferrer" class="contact-link">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
									<path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
								</svg>
								WhatsApp
							</a>
						</li>
						<li>
							<a href="https://www.tiktok.com/@shopwithmercy_" target="_blank" rel="noopener noreferrer" class="contact-link">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
								</svg>
								TikTok — @shopwithmercy_
							</a>
						</li>
						<li>
							<a href="mailto:support@shopwithmercywears.com" class="contact-link">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
									<path d="M3 7l9 6l9 -6" />
								</svg>
								support@shopwithmercywears.com
							</a>
						</li>
					</ul>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* ── Nav shell ───────────────────────────────────────────── */
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
		font-size: 16px;
		font-weight: 400;
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
			font-size: 17px;
		}
	}

	.desktop-links {
		display: none;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.desktop-links { display: flex; }
	}

	.nav-link {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-cornsilk);
		text-decoration: none;
		transition: color var(--transition-fast);
		padding-block: var(--space-xs);
	}

	.nav-link:hover { color: var(--color-sunlit-clay); }

	.nav-link-home {
		color: rgba(254, 250, 224, 0.65);
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
	}

	.nav-link-home:hover { color: var(--color-sunlit-clay); }

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

	.nav-icon-btn:hover { color: var(--color-sunlit-clay); }

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
		.account-name { display: block; }
	}

	.cart-btn { position: relative; }

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
		.hamburger { display: none; }
	}

	/* ── Info dropdown ───────────────────────────────────────── */
	.info-wrap {
		position: relative;
	}

	.info-backdrop {
		position: fixed;
		inset: 0;
		z-index: 110;
		background: transparent;
		border: none;
		cursor: default;
	}

	.info-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		z-index: 120;
		background: #fff;
		border-radius: 10px;
		box-shadow: 0 8px 32px rgba(0,0,0,0.18);
		min-width: 180px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.info-item {
		padding: 12px 18px;
		font-size: var(--text-small);
		font-weight: 500;
		color: #283618;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		transition: background-color 0.15s;
		border-bottom: 1px solid #f3f4f6;
		font: inherit;
	}

	.info-item:last-child { border-bottom: none; }

	.info-item:hover { background: #f9fafb; }

	/* ── Drawer ──────────────────────────────────────────────── */
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

	.drawer-open { transform: translateX(0); }

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

	.drawer-link:hover { color: var(--color-sunlit-clay); }

	.drawer-link-btn {
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-bottom: 1px solid rgba(254, 250, 224, 0.10);
		cursor: pointer;
		font: inherit;
		padding: var(--space-md) 0;
		font-size: var(--text-body);
		font-weight: 500;
		color: var(--color-cornsilk);
		transition: color var(--transition-fast);
	}

	.drawer-link-btn:hover { color: var(--color-sunlit-clay); }

	.drawer-divider {
		height: 1px;
		background: rgba(254, 250, 224, 0.20);
		margin-block: var(--space-sm);
	}

	/* ── Modal ───────────────────────────────────────────────── */
	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		background: rgba(28, 38, 16, 0.35);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.modal-card {
		position: relative;
		background: #fff;
		border-radius: 16px;
		padding: 2rem;
		width: 100%;
		max-width: 480px;
		max-height: 85dvh;
		overflow-y: auto;
		box-shadow: 0 24px 64px rgba(0,0,0,0.25);
		animation: modal-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes modal-in {
		from { opacity: 0; transform: scale(0.94) translateY(8px); }
		to   { opacity: 1; transform: scale(1) translateY(0); }
	}

	.modal-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #f3f4f6;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #374151;
		transition: background 0.15s;
	}

	.modal-close:hover { background: #e5e7eb; }

	.modal-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111;
		margin-bottom: 1.25rem;
		padding-right: 2.5rem;
	}

	.modal-body {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.modal-body p {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: #374151;
		max-width: none;
	}

	.modal-body a {
		color: #bc6c25;
		text-decoration: underline;
	}

	.modal-body strong { color: #111; }

	.modal-updated {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.modal-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 10px 20px;
		background: #283618;
		color: #fefae0;
		border-radius: 8px;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		margin-top: 0.25rem;
		transition: background 0.15s;
		align-self: flex-start;
	}

	.modal-cta:hover { background: #3a4f24; }

	/* Get in Touch */
	.contact-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		list-style: none;
		padding: 0;
		margin-top: 0.25rem;
	}

	.contact-link {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #283618;
		text-decoration: none;
		padding: 12px 16px;
		border-radius: 10px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		transition: background 0.15s, border-color 0.15s;
	}

	.contact-link:hover {
		background: #f0f9f0;
		border-color: #606c38;
	}
</style>
