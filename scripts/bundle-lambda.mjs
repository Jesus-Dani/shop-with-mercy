/**
 * Pre-bundle the adapter-netlify framework function into a single self-contained
 * ESM file so Netlify doesn't need to resolve node_modules at Lambda runtime.
 *
 * Background: Netlify's node_bundler=esbuild setting is not reliably applied to
 * framework functions in .netlify/functions-internal/. The function imports
 * ../serverless.js and several @sveltejs/kit internals — without bundling those
 * in, the Lambda has no node_modules to resolve them from and crashes silently
 * (blank function logs) before any request handler runs.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const FUNCTION = resolve(root, '.netlify/functions-internal/sveltekit-render.mjs');

if (!existsSync(FUNCTION)) {
	console.log('[bundle-lambda] No function found — skipping (not a Netlify build?)');
	process.exit(0);
}

// esbuild ships as a nested dep of adapter-netlify
const ESBUILD = resolve(
	root,
	'node_modules/@sveltejs/adapter-netlify/node_modules/esbuild/bin/esbuild'
);

if (!existsSync(ESBUILD)) {
	console.error('[bundle-lambda] esbuild not found at expected path:', ESBUILD);
	console.error('  Install esbuild as a devDependency or check adapter-netlify version.');
	process.exit(1);
}

const TMP = FUNCTION + '.bundle_tmp';

console.log('[bundle-lambda] Bundling Lambda function into self-contained file...');
const result = spawnSync(
	process.execPath,
	[ESBUILD, FUNCTION, '--bundle', '--platform=node', '--format=esm', `--outfile=${TMP}`],
	{ stdio: 'inherit' }
);

if (result.status !== 0) {
	console.error('[bundle-lambda] esbuild exited with status', result.status);
	process.exit(result.status ?? 1);
}

renameSync(TMP, FUNCTION);
console.log('[bundle-lambda] Done. Lambda function is now self-contained.');
