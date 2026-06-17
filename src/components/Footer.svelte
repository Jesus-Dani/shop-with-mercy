<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="footer-inner page-container">
		<div class="footer-grid">
			<!-- Brand column -->
			<div class="footer-brand">
				<p class="footer-wordmark">Shop With Mercy</p>
				<p class="footer-tagline">Casual women's clothing. Campus and beyond.</p>
			</div>

			<!-- Links column -->
			<nav aria-label="Footer navigation">
				<ul role="list" class="footer-links">
					<li><a href="/shop?category=tops">Tops</a></li>
					<li><a href="/shop?category=skirts">Skirts</a></li>
					<li><a href="/refund-policy">Refund Policy</a></li>
					<li><a href="/privacy">Privacy Policy</a></li>
				</ul>
			</nav>

			<!-- Contact column -->
			<div class="footer-contact">
				<p class="footer-contact-heading">Get in touch</p>
				<ul role="list" class="footer-links">
					<li>
						<a
							href="https://wa.me/2349049435149"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Contact us on WhatsApp"
						>
							<!-- WhatsApp icon (Tabler) -->
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline;vertical-align:-2px;margin-right:6px;">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
								<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
								<path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
							</svg>
							WhatsApp
						</a>
					</li>
					<li>
						<a
							href="https://www.tiktok.com/@shopwithmercy_"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Follow us on TikTok"
						>
							<!-- TikTok icon (Tabler) -->
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline;vertical-align:-2px;margin-right:6px;">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
								<path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
							</svg>
							TikTok
						</a>
					</li>
					<li>
						<a href="mailto:support@shopwithmercywears.com">
							<!-- Mail icon (Tabler) -->
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline;vertical-align:-2px;margin-right:6px;">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
								<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
								<path d="M3 7l9 6l9 -6" />
							</svg>
							support@shopwithmercywears.com
						</a>
					</li>
				</ul>
			</div>
		</div>

		<div class="footer-bottom">
			<p>&copy; {year} Shop With Mercy. All rights reserved.</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		background-color: var(--color-black-forest);
		padding-block: var(--space-xl) var(--space-lg);
		margin-top: auto;
	}

	.footer-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
	}

	@media (min-width: 768px) {
		.footer-grid {
			grid-template-columns: 1fr 1fr 1fr;
			gap: var(--space-lg);
		}
	}

	.footer-wordmark {
		font-size: 18px;
		font-weight: 700;
		color: var(--footer-text-brand);
		margin-bottom: var(--space-sm);
	}

	.footer-tagline {
		font-size: var(--text-small);
		color: var(--footer-text);
		line-height: var(--leading-normal);
	}

	.footer-contact-heading {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--footer-text-brand);
		margin-bottom: var(--space-md);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.footer-links a {
		font-size: var(--text-small);
		color: var(--footer-text);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.footer-links a:hover {
		color: var(--footer-text-brand);
	}

	.footer-links a:focus-visible {
		outline: 2px solid var(--color-sunlit-clay);
		outline-offset: 2px;
		border-radius: 2px;
	}

	.footer-bottom {
		margin-top: var(--space-xl);
		padding-top: var(--space-lg);
		border-top: 1px solid rgba(254, 250, 224, 0.12);
	}

	.footer-bottom p {
		font-size: var(--text-small);
		color: var(--footer-text);
	}
</style>
