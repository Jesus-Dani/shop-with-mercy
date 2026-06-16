export type EventType = 'product_view' | 'add_to_cart' | 'checkout_started' | 'purchase';

export interface TrackPayload {
	product_id?: string;
	variant_id?: string;
	order_id?: string;
	meta?: Record<string, unknown>;
}

/**
 * Fire-and-forget event tracking. Uses sendBeacon so it never blocks
 * navigation or page renders. Never throws.
 */
export function track(type: EventType, payload?: TrackPayload): void {
	try {
		const body = JSON.stringify({ type, ...payload });
		if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
			navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }));
		} else {
			// sendBeacon not available — best-effort fetch with keepalive
			fetch('/api/event', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body,
				keepalive: true
			}).catch(() => {});
		}
	} catch {
		// tracking must never interrupt user flow
	}
}
