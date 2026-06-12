export default () => Response.json({ ok: true, ts: Date.now(), node: process.version });
export const config = { path: ['/__ping'] };
