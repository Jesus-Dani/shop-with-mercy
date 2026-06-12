import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return Response.json({ ok: true, ts: Date.now() });
};
