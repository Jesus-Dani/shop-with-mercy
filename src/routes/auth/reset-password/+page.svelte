<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let showPw = $state(false);
	let loading = $state(false);
</script>

<svelte:head>
	<title>Reset Password — Shop With Mercy</title>
</svelte:head>

<div class="auth-body">
	<div class="heading-group">
		<h1 class="auth-heading">Set new password</h1>
		<p class="auth-sub">Choose a strong password for your account.</p>
	</div>

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
			<label for="password">New password <span class="hint">(min. 8 characters)</span></label>
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

		<div class="field">
			<label for="confirm">Confirm new password</label>
			<input
				id="confirm"
				name="confirm"
				type={showPw ? 'text' : 'password'}
				class="input"
				autocomplete="new-password"
				required
				minlength="8"
				placeholder="••••••••"
			/>
		</div>

		<button type="submit" class="btn btn-primary full-btn" disabled={loading}>
			{loading ? 'Updating…' : 'Update password'}
		</button>
	</form>
</div>

<style>
	.auth-body { display: flex; flex-direction: column; gap: var(--space-lg); }
	.heading-group { display: flex; flex-direction: column; gap: var(--space-xs); text-align: center; }
	.auth-heading { font-size: var(--text-h1); }
	.auth-sub { font-size: var(--text-small); color: var(--text-secondary); max-width: none; }
	.hint { font-size: var(--text-micro); color: var(--text-secondary); font-weight: 400; }

	.alert-error {
		background: rgba(188, 108, 37, 0.10);
		color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.30);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-small);
		max-width: none;
	}

	.form { display: flex; flex-direction: column; gap: var(--space-md); }
	.field { display: flex; flex-direction: column; gap: var(--space-xs); }
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
</style>
