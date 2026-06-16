<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let showPw = $state(false);
	let loading = $state(false);

</script>

<svelte:head>
	<title>Create Account — Shop With Mercy</title>
</svelte:head>

<div class="auth-body">
	<h1 class="auth-heading">Create account</h1>

	{#if form?.success}
		<div class="alert-success" role="status">
			<p>Account created! Check <strong>{form.email}</strong> for a confirmation link, then sign in.</p>
			<a href="/auth/sign-in" class="btn btn-primary" style="margin-top: var(--space-md)">Go to sign in</a>
		</div>
	{:else}
		{#if form?.error}
			<p class="alert-error" role="alert">{form.error}</p>
		{/if}

		<form
			method="POST"
			action="?/signup"
			class="form"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => { loading = false; await update(); };
			}}
		>
			<div class="field">
				<label for="name">Full name</label>
				<input
					id="name"
					name="name"
					type="text"
					class="input"
					value={form?.name ?? ''}
					autocomplete="name"
					required
					placeholder="Mercy Adeyemi"
				/>
			</div>

			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					class="input"
					value={form?.email ?? ''}
					autocomplete="email"
					required
					placeholder="you@example.com"
				/>
			</div>

			<div class="field">
				<label for="password">Password <span class="hint">(min. 8 characters)</span></label>
				<div class="pw-wrap">
					<input
						id="password"
						name="password"
						type={showPw ? 'text' : 'password'}
						class="input pw-input"
						autocomplete="new-password"
						required
						minlength="8"
						placeholder="••••••••"
					/>
					<button type="button" class="show-pw-btn" onclick={() => (showPw = !showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>
						{showPw ? 'Hide' : 'Show'}
					</button>
				</div>
			</div>

			<button type="submit" class="btn btn-primary full-btn" disabled={loading}>
				{loading ? 'Creating account…' : 'Create account'}
			</button>
		</form>

		<p class="switch-msg">
			Already have an account? <a href="/auth/sign-in">Sign in</a>
		</p>
	{/if}
</div>

<style>
	.auth-body { display: flex; flex-direction: column; gap: var(--space-lg); }
	.auth-heading { font-size: var(--text-h1); text-align: center; }

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
		display: flex;
		flex-direction: column;
		font-size: var(--text-small);
	}

	.alert-success p { max-width: none; }

	.form { display: flex; flex-direction: column; gap: var(--space-md); }
	.field { display: flex; flex-direction: column; gap: var(--space-xs); }

	.hint { font-size: var(--text-micro); color: var(--text-secondary); font-weight: 400; }

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

	.switch-msg a { color: var(--text-primary); font-weight: 500; text-decoration: underline; text-underline-offset: 2px; }
</style>
