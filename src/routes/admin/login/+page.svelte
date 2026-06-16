<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let showPw = $state(false);
</script>

<svelte:head>
	<title>Admin</title>
</svelte:head>

<div class="gate">
	<div class="gate-card">
		<p class="gate-label">Admin access</p>

		{#if form?.error}
			<p class="gate-error" role="alert">{form.error}</p>
		{/if}

		<form
			method="POST"
			class="gate-form"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => { loading = false; await update(); };
			}}
		>
			<div class="pw-wrap">
				<input
					type={showPw ? 'text' : 'password'}
					name="password"
					class="gate-input"
					class:shake={!!form?.error}
					placeholder="Password"
					autocomplete="current-password"
					required
					autofocus
				/>
				<button type="button" class="show-btn" onclick={() => (showPw = !showPw)} aria-label={showPw ? 'Hide' : 'Show'}>
					{showPw ? 'Hide' : 'Show'}
				</button>
			</div>

			<button type="submit" class="gate-btn" disabled={loading}>
				{loading ? 'Checking…' : 'Enter'}
			</button>
		</form>
	</div>
</div>

<style>
	:global(body) { background: var(--color-black-forest); }

	.gate {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg);
	}

	.gate-card {
		width: 100%;
		max-width: 340px;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.gate-label {
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.10em;
		text-transform: uppercase;
		color: rgba(254, 250, 224, 0.40);
		text-align: center;
		max-width: none;
	}

	.gate-error {
		font-size: var(--text-small);
		color: #e57373;
		text-align: center;
		max-width: none;
	}

	.gate-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.pw-wrap { position: relative; }

	.gate-input {
		width: 100%;
		background: rgba(254, 250, 224, 0.06);
		border: 1px solid rgba(254, 250, 224, 0.15);
		border-radius: var(--radius-sm);
		padding: 12px 60px 12px var(--space-md);
		color: var(--color-cornsilk);
		font-size: var(--text-body);
		outline: none;
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
	}

	.gate-input:focus { border-color: rgba(254, 250, 224, 0.40); }

	.gate-input::placeholder { color: rgba(254, 250, 224, 0.25); }

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		20%, 60% { transform: translateX(-6px); }
		40%, 80% { transform: translateX(6px); }
	}

	.gate-input.shake { animation: shake 0.35s ease; }

	.show-btn {
		position: absolute;
		right: var(--space-md);
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--text-micro);
		font-weight: 600;
		color: rgba(254, 250, 224, 0.35);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		transition: color var(--transition-fast);
	}

	.show-btn:hover { color: rgba(254, 250, 224, 0.70); }

	.gate-btn {
		width: 100%;
		padding: 12px;
		background: rgba(254, 250, 224, 0.10);
		border: 1px solid rgba(254, 250, 224, 0.20);
		border-radius: var(--radius-sm);
		color: var(--color-cornsilk);
		font-size: var(--text-small);
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: background var(--transition-fast), border-color var(--transition-fast);
	}

	.gate-btn:hover:not(:disabled) {
		background: rgba(254, 250, 224, 0.16);
		border-color: rgba(254, 250, 224, 0.35);
	}

	.gate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
