import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '$env/dynamic/private';

function secret(): string {
	return env.ADMIN_SESSION_SECRET ?? '';
}

export function makeAdminToken(): string {
	return createHmac('sha256', secret()).update('swm_admin_v1').digest('hex');
}

export function verifyAdminToken(token: string): boolean {
	const expected = makeAdminToken();
	if (!token || token.length !== expected.length) return false;
	try {
		return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'));
	} catch {
		return false;
	}
}
