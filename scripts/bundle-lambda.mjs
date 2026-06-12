import { build } from 'esbuild';
import { existsSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FUNCTION = resolve(root, '.netlify/functions-internal/sveltekit-render.mjs');

if (!existsSync(FUNCTION)) {
	console.log('[bundle-lambda] No function found — skipping (not a Netlify build?)');
	process.exit(0);
}

const TMP = FUNCTION + '.bundle_tmp';

console.log('[bundle-lambda] Bundling Lambda function into self-contained file...');

await build({
	entryPoints: [FUNCTION],
	bundle: true,
	platform: 'node',
	format: 'esm',
	outfile: TMP
});

renameSync(TMP, FUNCTION);
console.log('[bundle-lambda] Done. Lambda function is now self-contained.');
