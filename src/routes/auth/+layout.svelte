<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
</script>

<div class="auth-wrap">
	<div class="auth-card">
		<a href="/" class="auth-logo">Shop With Mercy</a>
		{@render children()}
	</div>
</div>

<style>
	.auth-wrap {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl) var(--page-gutter-mobile);
	}

	.auth-card {
		width: 100%;
		max-width: 440px;
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.auth-logo {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 400;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-primary);
		text-decoration: none;
		text-align: center;
		display: block;
		transition: color var(--transition-fast);
	}

	.auth-logo:hover {
		color: var(--color-copperwood);
	}
</style>
