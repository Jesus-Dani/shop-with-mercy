import { build } from 'esbuild';
import { existsSync, renameSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// adapter-netlify generates the framework function here
const SRC = resolve(root, '.netlify/functions-internal/sveltekit-render.mjs');

// We move the bundled result to user functions so Netlify deploys it as-is,
// bypassing the framework function post-processing pipeline.
const OUT_DIR = resolve(root, 'netlify/functions');
const OUT = resolve(OUT_DIR, 'sveltekit-render.mjs');

mkdirSync(OUT_DIR, { recursive: true });

// ── ping function (diagnostic — zero deps, tests Lambda v2 works at all) ──
copyFileSync(resolve(root, 'src/netlify-functions/ping.mjs'), resolve(OUT_DIR, 'ping.mjs'));
console.log('[bundle-lambda] ping.mjs copied to netlify/functions/');

// ── main SvelteKit function ────────────────────────────────────────────────
if (!existsSync(SRC)) {
	console.log('[bundle-lambda] No sveltekit-render.mjs found — skipping bundle step');
	process.exit(0);
}

const TMP = SRC + '.bundle_tmp';

console.log('[bundle-lambda] Bundling sveltekit-render.mjs into self-contained file...');

await build({
	entryPoints: [SRC],
	bundle: true,
	platform: 'node',
	format: 'esm',
	outfile: TMP
});

renameSync(TMP, SRC);
copyFileSync(SRC, OUT);
rmSync(SRC);

console.log('[bundle-lambda] Done — netlify/functions/sveltekit-render.mjs ready');
