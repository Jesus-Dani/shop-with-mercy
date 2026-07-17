<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showPw = $state(false);
	let loading = $state(false);


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

	<p class="switch-msg">
		Don't have an account? <a href="/auth/sign-up?next={encodeURIComponent(data.next)}">Create one</a>
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
