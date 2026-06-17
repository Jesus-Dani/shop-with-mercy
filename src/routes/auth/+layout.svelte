<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
	const year = new Date().getFullYear();
</script>

<div class="auth-shell">
	<div class="auth-wrap">
		<div class="auth-card">
			<a href="/" class="auth-logo" aria-label="Shop With Mercy, home">Shop With Mercy</a>
			{@render children()}
		</div>
	</div>

	<footer class="auth-footer">
		<p>
			&copy; {year} Shop With Mercy &middot;
			<a href="/privacy">Privacy Policy</a> &middot;
			<a href="/refund-policy">Refund Policy</a>
		</p>
	</footer>
</div>

<style>
	.auth-shell {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.auth-wrap {
		flex: 1;
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

	.auth-footer {
		padding: var(--space-md) var(--page-gutter-mobile);
		text-align: center;
		border-top: 1px solid var(--border-color);
	}

	.auth-footer p {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		max-width: none;
	}

	.auth-footer a {
		color: var(--text-secondary);
		text-decoration: underline;
		transition: color var(--transition-fast);
	}

	.auth-footer a:hover {
		color: var(--text-primary);
	}

	.auth-footer a:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
		border-radius: 2px;
	}
</style>
