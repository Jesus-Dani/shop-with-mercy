import { build } from 'esbuild';
import { existsSync, renameSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// adapter-netlify generates the function here (framework internal pipeline)
const SRC = resolve(root, '.netlify/functions-internal/sveltekit-render.mjs');

// We move it here (user functions) so Netlify deploys our pre-bundled file
// as-is, without its framework post-processing re-bundling it.
const OUT_DIR = resolve(root, 'netlify/functions');
const OUT = resolve(OUT_DIR, 'sveltekit-render.mjs');

if (!existsSync(SRC)) {
	console.log('[bundle-lambda] No function found — skipping (not a Netlify build?)');
	process.exit(0);
}

const TMP = SRC + '.bundle_tmp';

console.log('[bundle-lambda] Bundling Lambda function into self-contained file...');

await build({
	entryPoints: [SRC],
	bundle: true,
	platform: 'node',
	format: 'esm',
	outfile: TMP
});

// Replace the source with the bundle, then move it to netlify/functions/.
// Removing it from .netlify/functions-internal/ prevents Netlify's framework
// pipeline from re-bundling it (which was producing a broken second pass).
renameSync(TMP, SRC);
mkdirSync(OUT_DIR, { recursive: true });
copyFileSync(SRC, OUT);
rmSync(SRC);

console.log('[bundle-lambda] Done — self-contained function at netlify/functions/sveltekit-render.mjs');
