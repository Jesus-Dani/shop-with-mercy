<svelte:head>
	<title>Privacy Policy — Shop With Mercy</title>
	<meta name="description" content="How Shop With Mercy collects, uses, and protects your data." />
</svelte:head>

<div class="page-container privacy-page">
	<h1>Privacy Policy</h1>
	<p class="updated">Last updated: June 2026</p>

	<section>
		<h2>Who we are</h2>
		<p>
			Shop With Mercy is a Nigerian women's clothing store. Our contact email is
			<a href="mailto:support@shopwithmercywears.com">support@shopwithmercywears.com</a>.
		</p>
	</section>

	<section>
		<h2>What data we collect</h2>

		<h3>When you place an order</h3>
		<p>
			We collect your name, email address, and phone number to fulfil your order and contact you
			about delivery. Order details (items, sizes, total) are stored so we can track your purchase.
		</p>

		<h3>When you create an account</h3>
		<p>
			We store your email address and display name via Supabase Auth (a secure third-party
			authentication provider). Passwords are hashed — we never store them in plain text.
		</p>

		<h3>Browsing activity</h3>
		<p>
			We record anonymised events (product views, add-to-cart, checkout started) to understand
			which products are popular. These events are linked to your account ID if you are signed in,
			or stored without any personal identifier if you are not.
		</p>

		<h3>Cookies</h3>
		<p>
			We use a single authentication session cookie if you sign in. We do not use third-party
			advertising cookies. The session cookie is HttpOnly and expires after 30 days.
		</p>
	</section>

	<section>
		<h2>How we use your data</h2>
		<ul>
			<li>To fulfil and update you on your orders</li>
			<li>To personalise your shopping experience (wishlist, saved items)</li>
			<li>To improve our product selection based on what people browse</li>
			<li>We do not sell your data to any third party</li>
			<li>We do not use your data for advertising on external platforms</li>
		</ul>
	</section>

	<section>
		<h2>Third-party services</h2>
		<ul>
			<li>
				<strong>Supabase</strong> — hosts our database and authentication.
				<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>
			</li>
			<li>
				<strong>Cloudinary</strong> — hosts product images.
				<a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer">Cloudinary Privacy Policy</a>
			</li>
			<li>
				<strong>Netlify</strong> — hosts this website.
				<a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">Netlify Privacy Policy</a>
			</li>
		</ul>
	</section>

	<section>
		<h2>Your rights</h2>
		<p>
			You can request to view, correct, or delete your personal data at any time. Email us at
			<a href="mailto:support@shopwithmercywears.com">support@shopwithmercywears.com</a> and we
			will respond within 14 days.
		</p>
	</section>

	<section>
		<h2>Data retention</h2>
		<p>
			Order records are kept for 3 years for business and tax purposes. Account data is kept until
			you request deletion. Browsing event data is retained for up to 12 months.
		</p>
	</section>

	<section>
		<h2>Changes to this policy</h2>
		<p>
			We may update this policy occasionally. The "Last updated" date above will reflect any
			changes. Continued use of the site after a change constitutes acceptance.
		</p>
	</section>
</div>

<style>
	.privacy-page {
		padding-block: var(--space-xl) var(--space-2xl);
		max-width: 680px;
	}

	h1 {
		font-size: var(--text-h1);
		margin-bottom: var(--space-xs);
	}

	.updated {
		font-size: var(--text-small);
		color: var(--text-secondary);
		margin-bottom: var(--space-xl);
	}

	section {
		margin-bottom: var(--space-xl);
	}

	h2 {
		font-size: var(--text-h2);
		margin-bottom: var(--space-md);
		padding-bottom: var(--space-sm);
		border-bottom: 1px solid var(--border-color);
	}

	h3 {
		font-size: var(--text-body);
		font-weight: 600;
		margin-top: var(--space-md);
		margin-bottom: var(--space-xs);
		color: var(--text-secondary);
	}

	p {
		font-size: var(--text-body);
		line-height: var(--leading-normal);
		color: var(--text-primary);
		margin-bottom: var(--space-sm);
		max-width: none;
	}

	ul {
		list-style: disc;
		padding-left: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	li {
		font-size: var(--text-body);
		line-height: var(--leading-normal);
		color: var(--text-primary);
	}

	a {
		color: var(--color-copperwood);
		text-decoration: underline;
	}

	a:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
		border-radius: 2px;
	}
</style>
