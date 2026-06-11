<style>
	.skeleton-card {
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--bg-card);
	}

	.skeleton-img {
		aspect-ratio: 4 / 5;
		background: var(--bg-card);
		position: relative;
		overflow: hidden;
	}

	.skeleton-body {
		padding: var(--space-sm) var(--space-sm) var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.skeleton-line {
		border-radius: var(--radius-sm);
		background: var(--border-color);
		position: relative;
		overflow: hidden;
	}

	.skeleton-line::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.15) 50%,
			transparent 100%
		);
		animation: shimmer 1.4s infinite;
	}

	.skeleton-img::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.08) 50%,
			transparent 100%
		);
		animation: shimmer 1.4s infinite;
	}

	.skeleton-name {
		height: 14px;
		width: 75%;
	}

	.skeleton-name-2 {
		height: 14px;
		width: 50%;
	}

	.skeleton-price {
		height: 13px;
		width: 35%;
		margin-top: 2px;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton-line::after,
		.skeleton-img::after {
			animation: none;
		}
	}
</style>

<div class="skeleton-card" aria-hidden="true">
	<div class="skeleton-img"></div>
	<div class="skeleton-body">
		<div class="skeleton-line skeleton-name"></div>
		<div class="skeleton-line skeleton-name-2"></div>
		<div class="skeleton-line skeleton-price"></div>
	</div>
</div>
