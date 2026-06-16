<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const reviews = $derived(data.reviews as any[]);

	function stars(n: number) {
		return '★'.repeat(n) + '☆'.repeat(5 - n);
	}

	function formatDate(s: string) {
		return new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head><title>Reviews — SWM Admin</title></svelte:head>

<div class="page-head">
	<h1 class="page-title">Reviews</h1>
	<p class="page-sub">{reviews.length} total · {reviews.filter(r => r.is_visible).length} visible</p>
</div>

{#if reviews.length === 0}
	<div class="empty-state">
		<p>No reviews yet. Reviews appear here once customers submit them (Phase 6).</p>
	</div>
{:else}
	<div class="review-list">
		{#each reviews as review}
			<div class="review-card" class:hidden={!review.is_visible}>
				<div class="review-head">
					<span class="stars">{stars(review.rating)}</span>
					<span class="product-name">{(review.products as any)?.name ?? '—'}</span>
					<span class="review-date">{formatDate(review.created_at)}</span>
					{#if !review.is_visible}
						<span class="hidden-badge">Hidden</span>
					{/if}
				</div>

				{#if review.body}
					<p class="review-body">{review.body}</p>
				{/if}

				<div class="review-actions">
					<form method="POST" action="?/toggleVisibility" use:enhance>
						<input type="hidden" name="id" value={review.id} />
						<input type="hidden" name="is_visible" value={String(review.is_visible)} />
						<button type="submit" class="btn-link">
							{review.is_visible ? 'Hide' : 'Restore'}
						</button>
					</form>
					<form method="POST" action="?/delete" use:enhance onsubmit={(e) => { if (!confirm('Delete this review permanently?')) e.preventDefault(); }}>
						<input type="hidden" name="id" value={review.id} />
						<button type="submit" class="btn-link danger">Delete</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.page-head { margin-bottom: var(--space-xl); }
	.page-title { font-size: var(--text-h1); }
	.page-sub { font-size: var(--text-small); color: var(--text-secondary); margin-top: 4px; }

	.empty-state {
		padding: var(--space-2xl) 0;
		color: var(--text-secondary);
		text-align: center;
	}

	.review-list { display: flex; flex-direction: column; gap: var(--space-md); }

	.review-card {
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex; flex-direction: column; gap: var(--space-sm);
	}

	.review-card.hidden { opacity: 0.55; }

	.review-head {
		display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;
		font-size: var(--text-small);
	}

	.stars { color: #c8a84b; letter-spacing: 2px; }
	.product-name { font-weight: 600; }
	.review-date { color: var(--text-secondary); margin-left: auto; }

	.hidden-badge {
		font-size: var(--text-micro); font-weight: 600;
		background: rgba(188, 108, 37, 0.12); color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.25);
		border-radius: 100px; padding: 2px 8px;
	}

	.review-body {
		font-size: var(--text-small); color: var(--text-primary); max-width: none;
		line-height: 1.6;
	}

	.review-actions { display: flex; gap: var(--space-md); }

	.btn-link {
		font-size: var(--text-micro); font-weight: 500;
		background: none; border: none; cursor: pointer; padding: 0;
		text-decoration: underline; text-underline-offset: 2px; color: var(--text-secondary);
	}
	.btn-link:hover { color: var(--text-primary); }
	.btn-link.danger { color: var(--color-copperwood); }
</style>
