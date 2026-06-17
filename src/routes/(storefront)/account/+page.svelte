<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const firstName = $derived(data.user.full_name.split(' ')[0] || data.user.email.split('@')[0]);

	const tabs = ['Orders', 'Wishlist', 'Profile'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Orders');
</script>

<svelte:head>
	<title>My Account — Shop With Mercy</title>
</svelte:head>

<div class="page-container account-page">
	<div class="account-head">
		<div>
			<h1 class="page-title">Hi, {firstName}</h1>
			<p class="email-label">{data.user.email}</p>
		</div>
		<form method="POST" action="/auth/signout">
			<button type="submit" class="btn btn-outline signout-btn">Sign out</button>
		</form>
	</div>

	<!-- Tab bar -->
	<div class="tab-bar" role="tablist">
		{#each tabs as tab}
			<button
				role="tab"
				class="tab-btn"
				class:tab-active={activeTab === tab}
				aria-selected={activeTab === tab}
				onclick={() => (activeTab = tab)}
			>{tab}</button>
		{/each}
	</div>

	<!-- Tab panels -->
	<div class="tab-panel">
		{#if activeTab === 'Orders'}
			<div class="coming-soon">
				<p class="coming-label">Orders</p>
				<p class="coming-sub">Your order history will appear here once you've made a purchase.</p>
				<a href="/shop" class="btn btn-primary">Browse the Collection</a>
			</div>

		{:else if activeTab === 'Wishlist'}
			<div class="coming-soon">
				<p class="coming-label">Wishlist</p>
				<p class="coming-sub">Save items you love and come back to them any time.</p>
				<a href="/shop" class="btn btn-outline">Start Shopping</a>
			</div>

		{:else if activeTab === 'Profile'}
			<div class="profile-section">
				<div class="profile-row">
					<span class="profile-key">Name</span>
					<span class="profile-val">{data.user.full_name || '—'}</span>
				</div>
				<div class="profile-row">
					<span class="profile-key">Email</span>
					<span class="profile-val">{data.user.email}</span>
				</div>
				<p class="profile-note">Profile editing coming soon.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.account-page {
		padding-block: var(--space-xl) var(--space-2xl);
	}

	.account-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
		flex-wrap: wrap;
	}

	.page-title { font-size: var(--text-h1); }

	.email-label {
		font-size: var(--text-small);
		color: var(--text-secondary);
		margin-top: 4px;
		max-width: none;
	}

	.signout-btn { min-width: 100px; }

	/* Tabs */
	.tab-bar {
		display: flex;
		gap: 0;
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
		transition: color var(--transition-fast), border-color var(--transition-fast);
		white-space: nowrap;
		min-height: 44px;
		margin-bottom: -1px;
	}

	.tab-btn:hover { color: var(--text-primary); }

	.tab-active {
		color: var(--text-primary);
		border-bottom-color: var(--color-black-forest);
	}

	[data-theme="dark"] .tab-active {
		border-bottom-color: var(--color-cornsilk);
	}

	/* Coming soon panels */
	.coming-soon {
		padding: var(--space-2xl) 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-md);
	}

	.coming-label {
		font-size: var(--text-h2);
		font-weight: 600;
		color: var(--text-primary);
		max-width: none;
	}

	.coming-sub {
		color: var(--text-secondary);
	}

	/* Profile */
	.profile-section {
		display: flex;
		flex-direction: column;
		gap: 0;
		max-width: 480px;
	}

	.profile-row {
		display: flex;
		gap: var(--space-xl);
		padding-block: var(--space-md);
		border-bottom: 1px solid var(--border-color);
	}

	.profile-key {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
		min-width: 80px;
		flex-shrink: 0;
	}

	.profile-val {
		font-size: var(--text-small);
		color: var(--text-primary);
	}

	.profile-note {
		font-size: var(--text-small);
		color: var(--text-secondary);
		margin-top: var(--space-lg);
	}
</style>
