<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showPw = $state(false);
	let loading = $state(false);
	let googleLoading = $state(false);

	const errorMsg = $derived(form?.error ?? data.urlError ?? null);
</script>

<svelte:head>
	<title>Sign In — Shop With Mercy</title>
</svelte:head>

<div class="auth-body">
	<h1 class="auth-heading">Sign in</h1>

	{#if errorMsg}
		<p class="alert-error" role="alert">{errorMsg}</p>
	{/if}

	<form
		method="POST"
		action="?/email"
		class="form"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => { loading = false; await update(); };
		}}
	>
		<input type="hidden" name="next" value={data.next} />

		<div class="field">
			<label for="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				class="input"
				class:error={!!form?.error}
				value={form?.email ?? ''}
				autocomplete="email"
				required
				placeholder="you@example.com"
			/>
		</div>

		<div class="field">
			<div class="label-row">
				<label for="password">Password</label>
				<a href="/auth/forgot-password" class="subtle-link">Forgot password?</a>
			</div>
			<div class="pw-wrap">
				<input
					id="password"
					name="password"
					type={showPw ? 'text' : 'password'}
					class="input pw-input"
					class:error={!!form?.error}
					autocomplete="current-password"
					required
					placeholder="••••••••"
				/>
				<button type="button" class="show-pw-btn" onclick={() => (showPw = !showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>
					{showPw ? 'Hide' : 'Show'}
				</button>
			</div>
		</div>

		<button type="submit" class="btn btn-primary full-btn" disabled={loading}>
			{loading ? 'Signing in…' : 'Sign in'}
		</button>
	</form>

	<div class="or-divider"><span>or</span></div>

	<form
		method="POST"
		action="?/google"
		use:enhance={() => {
			googleLoading = true;
			return async ({ update }) => { googleLoading = false; await update(); };
		}}
	>
		<button type="submit" class="btn btn-outline full-btn google-btn" disabled={googleLoading}>
			<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
				<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
				<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
				<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
			</svg>
			{googleLoading ? 'Redirecting…' : 'Continue with Google'}
		</button>
	</form>

	<p class="switch-msg">
		Don't have an account? <a href="/auth/sign-up">Create one</a>
	</p>
</div>

<style>
	.auth-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.auth-heading {
		font-size: var(--text-h1);
		text-align: center;
	}

	.alert-error {
		background: rgba(188, 108, 37, 0.10);
		color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.30);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-small);
		max-width: none;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.subtle-link {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color var(--transition-fast);
	}

	.subtle-link:hover { color: var(--color-copperwood); }

	.pw-wrap { position: relative; }

	.pw-input { padding-right: 60px; }

	.show-pw-btn {
		position: absolute;
		right: var(--space-md);
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--text-micro);
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		transition: color var(--transition-fast);
	}

	.show-pw-btn:hover { color: var(--text-primary); }

	.full-btn { width: 100%; }

	.or-divider {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		font-size: var(--text-small);
		color: var(--text-secondary);
	}

	.or-divider::before,
	.or-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border-color);
	}

	.google-btn { gap: var(--space-sm); }

	.switch-msg {
		text-align: center;
		font-size: var(--text-small);
		color: var(--text-secondary);
		max-width: none;
	}

	.switch-msg a {
		color: var(--text-primary);
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.input.error { border-color: var(--color-copperwood); }
</style>
