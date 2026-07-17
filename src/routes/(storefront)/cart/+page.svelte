<script lang="ts">
	import { cart } from '$lib/cart.svelte';
	import { cdnUrl, uploadToCloudinary } from '$lib/cloudinary';
	import { formatNaira } from '$lib/format';
	import { track } from '$lib/track';
	import { env } from '$env/dynamic/public';

	let { data } = $props<{ data: { user: { full_name: string } | null } }>();

	const ACCOUNT_NUMBER = '9049435149';
	const WHATSAPP = '2349049435149';

	// Payment form state
	let phone = $state('');
	let paymentRef = $state('');
	let receiptPublicId = $state<string | null>(null);
	let receiptPreviewUrl = $state<string | null>(null);
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);
	let submitting = $state(false);
	let orderError = $state<string | null>(null);
	let copied = $state(false);
	let successOrder = $state<{ orderNumber: string; whatsappUrl: string } | null>(null);

	const canProceed = $derived(
		!!data.user &&
		phone.trim().length >= 7 &&
		paymentRef.trim().length > 0 &&
		receiptPublicId !== null &&
		!submitting &&
		cart.items.length > 0
	);

	function copyAccount() {
		navigator.clipboard.writeText(ACCOUNT_NUMBER).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	async function handleReceiptUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		uploading = true;
		uploadError = null;
		try {
			const publicId = await uploadToCloudinary(file, 'shop-with-mercy');
			if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
			receiptPublicId = publicId;
			receiptPreviewUrl = URL.createObjectURL(file);
		} catch {
			uploadError = 'Upload failed. Please try again.';
		} finally {
			uploading = false;
		}
	}

	function clearReceipt() {
		if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
		receiptPublicId = null;
		receiptPreviewUrl = null;
	}

	async function handleCheckout() {
		if (!canProceed) return;
		submitting = true;
		orderError = null;

		// Snapshot before clearing
		const snapshot = [...cart.items];
		const total = cart.total;

		try {
			const res = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: snapshot,
					subtotal: total,
					paymentRef: paymentRef.trim(),
					receiptPublicId,
					phone: phone.trim()
				})
			});
			const result = await res.json();
			if (!res.ok) throw new Error(result.message ?? 'Could not place order');

			// Use server-verified subtotal (may differ if prices changed since cart was loaded)
			const verifiedTotal = result.subtotal ?? total;

			const itemsList = snapshot
				.map(
					(i) =>
						`• ${i.name} (${i.colourName}, Size ${i.size}) x${i.quantity} — ${formatNaira(i.price * i.quantity)}`
				)
				.join('\n');

			const receiptUrl = `https://res.cloudinary.com/${env.PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${receiptPublicId}`;

			const msg = encodeURIComponent(
				`Hi! My name is ${data.user!.full_name}. I just placed an order:\n\n${itemsList}\n\nTotal: ${formatNaira(verifiedTotal)}\nPayment ref: ${paymentRef.trim()}\nPhone: ${phone.trim()}\nReceipt: ${receiptUrl}\nOrder: ${result.orderNumber}`
			);

			const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${msg}`;
			successOrder = { orderNumber: result.orderNumber, whatsappUrl };
			cart.clear();
			track('order_placed', { meta: { total: verifiedTotal, item_count: snapshot.length } });
		} catch (err) {
			orderError = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Your Cart — Shop With Mercy</title>
</svelte:head>

<div class="page-container cart-page">
	<h1 class="page-title">Your Cart</h1>

	{#if successOrder}
		<div class="order-success">
			<div class="success-icon" aria-hidden="true">✓</div>
			<h2 class="success-heading">Order placed!</h2>
			<p class="success-sub">Order <strong>#{successOrder.orderNumber}</strong> is confirmed and pending payment review.</p>
			<p class="success-sub">Tap the button below to open WhatsApp and send your details to us.</p>
			<a
				href={successOrder.whatsappUrl}
				class="btn btn-primary whatsapp-btn"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
					<path d="M11 12l1 1l2 -2" />
				</svg>
				Open WhatsApp to confirm →
			</a>
			<a href="/account" class="btn btn-outline">View my orders</a>
		</div>
	{:else if cart.items.length === 0}
		<div class="empty-state">
			<p>Your cart is empty.</p>
			<a href="/shop" class="btn btn-primary">Browse the Collection</a>
		</div>
	{:else}
		<div class="cart-layout">
			<!-- Item list -->
			<ul class="item-list" role="list">
				{#each cart.items as item (item.variantId)}
					<li class="cart-item">
						<a href="/shop/{item.productId}" class="item-img-wrap">
							{#if item.imagePublicId}
								<img
									src={cdnUrl(item.imagePublicId, { width: 120, height: 150, crop: 'fill' })}
									alt={item.name}
									width="120"
									height="150"
									class="item-img"
								/>
							{:else}
								<div class="item-img-placeholder" aria-hidden="true"></div>
							{/if}
						</a>

						<div class="item-body">
							<div class="item-top">
								<div class="item-meta-wrap">
									<a href="/shop/{item.productId}" class="item-name">{item.name}</a>
									<p class="item-meta">{item.colourName} · Size {item.size}</p>
								</div>
								<button
									class="remove-btn"
									aria-label="Remove {item.name}"
									onclick={() => cart.remove(item.variantId)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
										<path d="M18 6l-12 12" /><path d="M6 6l12 12" />
									</svg>
								</button>
							</div>

							<div class="item-bottom">
								<div class="qty-control" role="group" aria-label="Quantity for {item.name}">
									<button class="qty-btn" aria-label="Decrease" onclick={() => cart.updateQty(item.variantId, item.quantity - 1)}>−</button>
									<span class="qty-val">{item.quantity}</span>
									<button class="qty-btn" aria-label="Increase" onclick={() => cart.updateQty(item.variantId, item.quantity + 1)}>+</button>
								</div>
								<p class="item-price">{formatNaira(item.price * item.quantity)}</p>
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<!-- Order summary + payment -->
			<aside class="summary">
				<h2 class="summary-title">Order Summary</h2>

				<div class="summary-rows">
					<div class="summary-row">
						<span>Subtotal ({cart.count} {cart.count === 1 ? 'item' : 'items'})</span>
						<span>{formatNaira(cart.total)}</span>
					</div>
					<div class="summary-row">
						<span>Delivery</span>
						<span class="delivery-note">Discussed on WhatsApp</span>
					</div>
				</div>

				<div class="summary-total">
					<span>Total</span>
					<span class="total-val">{formatNaira(cart.total)}</span>
				</div>

				<!-- ── PAYMENT ── -->
				{#if !data.user}
					<div class="auth-gate">
						<p>Sign in to complete your order.</p>
						<a href="/auth/sign-in?next=/cart" class="btn btn-primary">Sign in to order</a>
					</div>
				{:else}
					<div class="payment-section">

						<!-- Step 1: bank details -->
						<div class="pay-step">
							<p class="step-label">
								<span class="step-num">1</span>
								Transfer to this account
							</p>
							<div class="bank-card">
								<div class="bank-row">
									<span class="bk">Account</span>
									<span class="bv mono">{ACCOUNT_NUMBER}</span>
									<button type="button" class="copy-btn" onclick={copyAccount}>
										{copied ? '✓ Copied' : 'Copy'}
									</button>
								</div>
								<div class="bank-row">
									<span class="bk">Bank</span>
									<span class="bv">Opay</span>
								</div>
								<div class="bank-row">
									<span class="bk">Name</span>
									<span class="bv">Olufe Anuoluwapo Asepeoluwa</span>
								</div>
								<div class="bank-row amount-row">
									<span class="bk">Amount</span>
									<span class="bv amount">{formatNaira(cart.total)}</span>
								</div>
							</div>
						</div>

						<!-- Step 2: proof of payment -->
						<div class="pay-step">
							<p class="step-label">
								<span class="step-num">2</span>
								Send proof of payment
							</p>

							<div class="field">
								<label for="phone">Your phone number</label>
								<input
									id="phone"
									type="tel"
									class="input"
									placeholder="e.g. 08012345678"
									bind:value={phone}
								/>
							</div>

							<div class="field">
								<label for="ref">Transaction Number / Session ID</label>
								<input
									id="ref"
									type="text"
									class="input"
									bind:value={paymentRef}
								/>
								<em class="field-hint">Check your bank app or SMS receipt — it's usually labelled "Transaction ID", "Session ID", or "Reference".</em>
							</div>

							<div class="field">
								<label>Receipt screenshot</label>
								{#if receiptPublicId && receiptPreviewUrl}
									<div class="receipt-preview-wrap">
										<img
											src={receiptPreviewUrl}
											alt="Payment receipt"
											class="receipt-preview"
										/>
										<button type="button" class="btn-link" onclick={clearReceipt}>
											Change photo
										</button>
									</div>
								{:else}
									<label class="upload-label" class:uploading>
										{#if uploading}
											<span class="upload-spinner" aria-hidden="true"></span>
											Uploading…
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
												<path d="M12 5v14M5 12l7-7 7 7"/>
											</svg>
											Upload screenshot
										{/if}
										<input
											type="file"
											accept="image/*"
											style="display:none"
											disabled={uploading}
											onchange={handleReceiptUpload}
										/>
									</label>
								{/if}
								{#if uploadError}
									<p class="field-error">{uploadError}</p>
								{/if}
							</div>
						</div>
					</div>

					{#if orderError}
						<p class="alert-error" role="alert">{orderError}</p>
					{/if}

					<button
						type="button"
						class="btn btn-primary checkout-btn"
						disabled={!canProceed}
						onclick={handleCheckout}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
							<path d="M11 12l1 1l2 -2" />
						</svg>
						{submitting ? 'Placing order…' : 'Proceed to WhatsApp →'}
					</button>

					{#if !canProceed && !submitting}
						<p class="proceed-hint">
							{#if !phone.trim() || !paymentRef.trim() || !receiptPublicId}
								Fill in your phone number, transaction number, and upload your receipt to proceed.
							{/if}
						</p>
					{/if}
				{/if}

				<a href="/shop" class="btn btn-outline continue-btn">Continue Shopping</a>
			</aside>
		</div>
	{/if}
</div>

<style>
	.cart-page {
		padding-block: var(--space-xl) var(--space-2xl);
	}

	.page-title {
		font-size: var(--text-h1);
		margin-bottom: var(--space-xl);
	}

	.order-success {
		padding: var(--space-2xl) 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-md);
		max-width: 480px;
	}

	.success-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: #22c55e;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		font-weight: 700;
	}

	.success-heading {
		font-size: var(--text-h2);
		margin: 0;
	}

	.success-sub {
		color: var(--text-secondary);
		margin: 0;
	}

	.whatsapp-btn {
		margin-top: var(--space-sm);
	}

	.empty-state {
		padding: var(--space-2xl) 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-lg);
	}

	.empty-state p { color: var(--text-secondary); }

	/* Layout */
	.cart-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
		align-items: start;
	}

	@media (min-width: 768px) {
		.cart-layout {
			grid-template-columns: 1fr 380px;
		}
	}

	/* Items */
	.item-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.cart-item {
		display: flex;
		gap: var(--space-md);
		padding-block: var(--space-lg);
		border-bottom: 1px solid var(--border-color);
	}

	.item-img-wrap {
		flex-shrink: 0;
		width: 96px;
		height: 120px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--bg-card);
		display: block;
	}

	@media (min-width: 480px) {
		.item-img-wrap {
			width: 110px;
			height: 138px;
		}
	}

	.item-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.item-img-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--color-olive-leaf) 0%, var(--color-black-forest) 100%);
		opacity: 0.2;
	}

	.item-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--space-sm);
	}

	.item-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-sm);
	}

	.item-meta-wrap {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.item-name {
		font-size: var(--text-body);
		font-weight: 500;
		color: var(--text-primary);
		text-decoration: none;
		line-height: var(--leading-tight);
	}

	.item-name:hover { color: var(--color-copperwood); }

	.item-meta {
		font-size: var(--text-small);
		color: var(--text-secondary);
		max-width: none;
	}

	.remove-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		color: var(--text-secondary);
		border-radius: var(--radius-sm);
		transition: color var(--transition-fast);
	}

	.remove-btn:hover { color: var(--color-copperwood); }
	.remove-btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }

	.item-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
	}

	.qty-control {
		display: flex;
		align-items: center;
		border: 1.5px solid var(--border-color);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.qty-btn {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		color: var(--text-primary);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.qty-btn:hover { background: var(--bg-card); }
	.qty-btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -2px; }

	.qty-val {
		min-width: 36px;
		text-align: center;
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
		border-left: 1.5px solid var(--border-color);
		border-right: 1.5px solid var(--border-color);
		line-height: 40px;
	}

	.item-price {
		font-size: var(--text-body);
		font-weight: 700;
		color: var(--text-primary);
		max-width: none;
	}

	/* Summary sidebar */
	.summary {
		background: var(--bg-card);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		position: sticky;
		top: calc(var(--nav-height) + var(--space-md));
	}

	.summary-title {
		font-size: var(--text-h3);
		font-weight: 600;
	}

	.summary-rows {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-small);
		color: var(--text-secondary);
	}

	.delivery-note { font-style: italic; }

	.summary-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: var(--space-md);
		border-top: 1px solid var(--border-color);
		font-size: var(--text-body);
		font-weight: 600;
		color: var(--text-primary);
	}

	.total-val { font-size: var(--text-h2); }

	/* Auth gate */
	.auth-gate {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--bg-page);
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-color);
	}

	.auth-gate p {
		font-size: var(--text-small);
		color: var(--text-secondary);
		max-width: none;
	}

	/* Payment section */
	.payment-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		border-top: 1px solid var(--border-color);
		padding-top: var(--space-md);
	}

	.pay-step {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.step-label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--text-primary);
		max-width: none;
	}

	.step-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--color-black-forest);
		color: var(--color-cornsilk);
		font-size: 11px;
		font-weight: 700;
		flex-shrink: 0;
	}

	/* Bank details card */
	.bank-card {
		background: var(--bg-page);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.bank-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-small);
	}

	.bk {
		width: 64px;
		flex-shrink: 0;
		color: var(--text-secondary);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.bv {
		flex: 1;
		color: var(--text-primary);
		font-weight: 500;
	}

	.mono { font-family: monospace; letter-spacing: 0.06em; font-size: var(--text-body); }

	.amount-row { padding-top: var(--space-sm); border-top: 1px solid var(--border-color); }
	.amount { font-size: var(--text-h3); font-weight: 700; color: var(--color-copperwood); }

	.copy-btn {
		flex-shrink: 0;
		font-size: var(--text-micro);
		font-weight: 600;
		padding: 4px 10px;
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		background: var(--bg-card);
		color: var(--text-secondary);
		cursor: pointer;
		transition: color var(--transition-fast), border-color var(--transition-fast);
	}

	.copy-btn:hover { color: var(--text-primary); border-color: var(--text-secondary); }

	/* Form fields */
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	label {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--text-secondary);
	}

	.field-hint {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		display: block;
		margin-top: 4px;
	}

	.field-error {
		font-size: var(--text-micro);
		color: var(--color-copperwood);
		max-width: none;
	}

	/* Receipt upload */
	.upload-label {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		height: 56px;
		border: 2px dashed var(--border-color);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		color: var(--text-secondary);
		cursor: pointer;
		transition: border-color var(--transition-fast), color var(--transition-fast);
	}

	.upload-label:hover { border-color: var(--text-secondary); color: var(--text-primary); }
	.upload-label.uploading { opacity: 0.6; cursor: not-allowed; }

	.receipt-preview-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.receipt-preview {
		width: 100%;
		max-height: 160px;
		object-fit: contain;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-color);
		background: var(--bg-page);
	}

	.btn-link {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		padding: 0;
		align-self: flex-start;
	}

	@keyframes spin { to { transform: rotate(360deg); } }

	.upload-spinner {
		width: 18px;
		height: 18px;
		border: 2px solid var(--border-color);
		border-top-color: var(--text-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		flex-shrink: 0;
	}

	/* Alerts */
	.alert-error {
		background: rgba(188, 108, 37, 0.10);
		color: var(--color-copperwood);
		border: 1px solid rgba(188, 108, 37, 0.30);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-small);
		max-width: none;
	}

	/* Checkout button */
	.checkout-btn {
		width: 100%;
		gap: var(--space-sm);
	}

	.checkout-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.proceed-hint {
		font-size: var(--text-micro);
		color: var(--text-secondary);
		text-align: center;
		max-width: none;
	}

	.continue-btn {
		width: 100%;
		text-align: center;
	}
</style>
