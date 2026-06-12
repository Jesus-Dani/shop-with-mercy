<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Forgot Password — Shop With Mercy</title>
</svelte:head>

<div class="auth-body">
	<div class="heading-group">
		<h1 class="auth-heading">Forgot password?</h1>
		<p class="auth-sub">Enter your email and we'll send a reset link.</p>
	</div>

	{#if form?.success}
		<div class="alert-success" role="status">
			<p>Check your inbox. If an account exists for that email, a reset link is on its way.</p>
		</div>
		<a href="/auth/sign-in" class="btn btn-outline full-btn">Back to sign in</a>
	{:else}
		{#if form?.error}
			<p class="alert-error" role="alert">{form.error}</p>
		{/if}

		<form
			method="POST"
			class="form"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => { loading = false; await update(); };
			}}
		>
			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					class="input"
					autocomplete="email"
					required
					placeholder="you@example.com"
				/>
			</div>

			<button type="submit" class="btn btn-primary full-btn" disabled={loading}>
				{loading ? 'Sending…' : 'Send reset link'}
			</button>
		</form>

		<a href="/auth/sign-in" class="back-link">← Back to sign in</a>
	{/if}
</div>

<style>
	.auth-body { display: flex; flex-direction: column; gap: var(--space-lg); }
	.heading-group { display: flex; flex-direction: column; gap: var(--space-xs); text-align: center; }
	.auth-heading { font-size: var(--text-h1); }
	.auth-sub { font-size: var(--text-small); color: var(--text-secondary); max-width: none; }

	.alert-error {
		background: rgba(188, 108, 37, 0.10);
		color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.30);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-small);
		max-width: none;
	}

	.alert-success {
		background: rgba(96, 108, 56, 0.10);
		color: var(--color-olive-leaf);
		border: 1px solid rgba(96, 108, 56, 0.30);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		font-size: var(--text-small);
	}

	.alert-success p { max-width: none; }
	.form { display: flex; flex-direction: column; gap: var(--space-md); }
	.field { display: flex; flex-direction: column; gap: var(--space-xs); }
	.full-btn { width: 100%; }

	.back-link {
		text-align: center;
		font-size: var(--text-small);
		color: var(--text-secondary);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color var(--transition-fast);
	}

	.back-link:hover { color: var(--text-primary); }
</style>
