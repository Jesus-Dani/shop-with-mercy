/**
 * Weekly admin digest — runs every Monday at 07:00 UTC.
 * Required env vars: SUPABASE_URL (same as PUBLIC_SUPABASE_URL), SUPABASE_SECRET_KEY,
 *                    RESEND_API_KEY, ADMIN_EMAIL.
 * If any required var is missing the function exits silently (so deploy doesn't break
 * before credentials are set).
 */

export const config = { schedule: '0 7 * * 1' };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const PAID = ['paid', 'fulfilled', 'delivered'];

async function sbFetch(url, serviceKey, query) {
	const params = new URLSearchParams(query);
	const res = await fetch(`${url}/rest/v1/${params.toString() ? '?' + params : ''}`, {
		headers: {
			apikey:        serviceKey,
			Authorization: `Bearer ${serviceKey}`,
			'Content-Type': 'application/json'
		}
	});
	if (!res.ok) throw new Error(`Supabase REST ${res.status}: ${await res.text()}`);
	return res.json();
}

async function sbSelect(baseUrl, serviceKey, table, select, filters = {}) {
	const url = `${baseUrl}/rest/v1/${table}`;
	const params = new URLSearchParams({ select });
	for (const [key, val] of Object.entries(filters)) {
		params.set(key, val);
	}
	const res = await fetch(`${url}?${params}`, {
		headers: {
			apikey:           serviceKey,
			Authorization:    `Bearer ${serviceKey}`,
			'Content-Type':   'application/json',
			'Prefer':         'count=exact'
		}
	});
	if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
	return res.json();
}

function fmtNaira(n) {
	return `₦${Number(n).toLocaleString('en-NG')}`;
}

export default async function handler() {
	const SUPABASE_URL   = process.env.PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
	const SERVICE_KEY    = process.env.SUPABASE_SECRET_KEY;
	const RESEND_KEY     = process.env.RESEND_API_KEY;
	const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;

	if (!SUPABASE_URL || !SERVICE_KEY || !RESEND_KEY || !ADMIN_EMAIL) {
		console.log('[weekly-digest] Missing env vars — skipping');
		return;
	}

	const since = new Date(Date.now() - WEEK_MS).toISOString();
	const weekLabel = new Date(Date.now() - WEEK_MS).toLocaleDateString('en-NG', {
		day: 'numeric', month: 'long'
	}) + ' – ' + new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

	// ── Fetch orders from last 7 days ────────────────────────────────────────
	const orders = await sbSelect(SUPABASE_URL, SERVICE_KEY, 'orders',
		'status,subtotal,customer_email',
		{ 'created_at': `gte.${since}` }
	);

	const totalOrders  = orders.length;
	const paidOrders   = orders.filter(o => PAID.includes(o.status));
	const revenue      = paidOrders.reduce((s, o) => s + (o.subtotal ?? 0), 0);
	const uniqueEmails = new Set(orders.map(o => o.customer_email)).size;

	const statusCounts = {};
	for (const o of orders) {
		statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
	}

	// ── Fetch page events from last 7 days ───────────────────────────────────
	const events = await sbSelect(SUPABASE_URL, SERVICE_KEY, 'page_events',
		'event_type,product_id',
		{ 'created_at': `gte.${since}` }
	);

	const viewCount     = events.filter(e => e.event_type === 'product_view').length;
	const cartCount     = events.filter(e => e.event_type === 'add_to_cart').length;
	const checkoutCount = events.filter(e => e.event_type === 'checkout_started').length;

	// Top 3 viewed products
	const viewMap = {};
	for (const e of events) {
		if (e.event_type === 'product_view' && e.product_id) {
			viewMap[e.product_id] = (viewMap[e.product_id] ?? 0) + 1;
		}
	}
	const topViewedIds = Object.entries(viewMap)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map(([id]) => id);

	let topViewedNames = [];
	if (topViewedIds.length > 0) {
		const idFilter = `in.(${topViewedIds.join(',')})`;
		const products = await sbSelect(SUPABASE_URL, SERVICE_KEY, 'products',
			'id,name', { 'id': idFilter }
		);
		const nameMap = Object.fromEntries(products.map(p => [p.id, p.name]));
		topViewedNames = topViewedIds.map(id => `${nameMap[id] ?? id} (${viewMap[id]} views)`);
	}

	// ── Build email body ─────────────────────────────────────────────────────
	const statusLines = Object.entries(statusCounts)
		.map(([s, n]) => `  • ${s}: ${n}`)
		.join('\n');

	const topViewedLines = topViewedNames.length > 0
		? topViewedNames.map((n, i) => `  ${i + 1}. ${n}`).join('\n')
		: '  No product views this week.';

	const textBody = `Shop With Mercy — Weekly Digest
${weekLabel}
${'─'.repeat(48)}

REVENUE
  Total orders:   ${totalOrders}
  Paid orders:    ${paidOrders.length}
  Revenue:        ${fmtNaira(revenue)}
  Unique customers: ${uniqueEmails}

ORDER STATUS BREAKDOWN
${statusLines || '  No orders this week.'}

ENGAGEMENT (product views → cart → checkout)
  Product views:   ${viewCount}
  Added to cart:   ${cartCount}
  Checkout started: ${checkoutCount}
  View→cart rate:  ${viewCount > 0 ? Math.round(cartCount / viewCount * 100) : 0}%

TOP VIEWED PRODUCTS
${topViewedLines}

${'─'.repeat(48)}
View full dashboard: https://shopwithmercywears.com/admin
`;

	const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
  <h1 style="font-size:20px;margin-bottom:4px">Shop With Mercy</h1>
  <p style="color:#6b7280;font-size:13px;margin-bottom:24px">Weekly digest · ${weekLabel}</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
    <tr>
      <td style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;width:25%">
        <div style="font-size:24px;font-weight:700">${totalOrders}</div>
        <div style="font-size:12px;color:#6b7280">Orders</div>
      </td>
      <td width="8"></td>
      <td style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;width:25%">
        <div style="font-size:24px;font-weight:700">${fmtNaira(revenue)}</div>
        <div style="font-size:12px;color:#6b7280">Revenue</div>
      </td>
      <td width="8"></td>
      <td style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;width:25%">
        <div style="font-size:24px;font-weight:700">${uniqueEmails}</div>
        <div style="font-size:12px;color:#6b7280">Customers</div>
      </td>
      <td width="8"></td>
      <td style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;width:25%">
        <div style="font-size:24px;font-weight:700">${viewCount}</div>
        <div style="font-size:12px;color:#6b7280">Page views</div>
      </td>
    </tr>
  </table>

  <h2 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:8px">Engagement funnel</h2>
  <p style="margin-bottom:4px">🔍 ${viewCount} product views → 🛒 ${cartCount} added to cart → 📦 ${checkoutCount} checkouts</p>
  <p style="color:#6b7280;font-size:13px;margin-bottom:24px">View→cart: ${viewCount > 0 ? Math.round(cartCount / viewCount * 100) : 0}% &nbsp;|&nbsp; Cart→checkout: ${cartCount > 0 ? Math.round(checkoutCount / cartCount * 100) : 0}%</p>

  ${topViewedNames.length > 0 ? `
  <h2 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:8px">Top viewed products</h2>
  <ol style="padding-left:20px;margin-bottom:24px">
    ${topViewedNames.map(n => `<li style="margin-bottom:4px;font-size:14px">${n}</li>`).join('')}
  </ol>` : ''}

  <a href="https://shopwithmercywears.com/admin" style="display:inline-block;padding:10px 20px;background:#283618;color:#fefae0;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">Open Admin Dashboard →</a>

  <p style="margin-top:32px;font-size:12px;color:#9ca3af">You are receiving this because you are the Shop With Mercy admin.</p>
</body>
</html>`;

	// ── Send via Resend ──────────────────────────────────────────────────────
	const res = await fetch('https://api.resend.com/emails', {
		method:  'POST',
		headers: {
			Authorization:  `Bearer ${RESEND_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from:    'Shop With Mercy <digest@shopwithmercywears.com>',
			to:      [ADMIN_EMAIL],
			subject: `SWM Weekly Digest — ${weekLabel}`,
			text:    textBody,
			html:    htmlBody
		})
	});

	if (!res.ok) {
		console.error('[weekly-digest] Resend error:', res.status, await res.text());
	} else {
		console.log('[weekly-digest] Sent to', ADMIN_EMAIL);
	}
}
