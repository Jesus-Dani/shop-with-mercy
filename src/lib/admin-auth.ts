import { createHmac, timingSafeEqual, randomUUID } from 'crypto';
import { env } from '$env/dynamic/private';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function secret(): string {
	const s = env.ADMIN_SESSION_SECRET ?? '';
	if (!s) throw new Error('[admin-auth] ADMIN_SESSION_SECRET env var is required but not set');
	return s;
}

function sign(sessionId: string, expiresAt: string): string {
	return createHmac('sha256', secret())
		.update(`${sessionId}|${expiresAt}`)
		.digest('hex');
}

export interface AdminTokenParts {
	sessionId: string;
	expiresAt: string;
}

/** Create a new session token. Returns the DB fields and the cookie string. */
export function makeAdminToken(): AdminTokenParts & { cookie: string } {
	const sessionId = randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
	const hmac = sign(sessionId, expiresAt);
	return { sessionId, expiresAt, cookie: `${sessionId}|${expiresAt}|${hmac}` };
}

/**
 * Parse and HMAC-verify a cookie value. Returns the session parts on success,
 * or null if the token is missing, malformed, expired, or tampered with.
 * Callers must still verify the session ID exists in the DB.
 */
export function verifyAdminToken(token: string): AdminTokenParts | null {
	if (!token) return null;

	const parts = token.split('|');
	if (parts.length !== 3) return null;

	const [sessionId, expiresAt, providedHmac] = parts;

	if (new Date(expiresAt) <= new Date()) return null;

	let expectedHmac: string;
	try {
		expectedHmac = sign(sessionId, expiresAt);
	} catch {
		return null;
	}

	try {
		const match = timingSafeEqual(
			Buffer.from(providedHmac, 'hex'),
			Buffer.from(expectedHmac, 'hex')
		);
		if (!match) return null;
	} catch {
		return null;
	}

	return { sessionId, expiresAt };
}
