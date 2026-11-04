import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Accepted baseline for the web entry, in gzip bytes (see plans/native-and-hybrid-support.md).
const WEB_GZIP_BUDGET = 9100;
const FORBIDDEN = ['@capacitor', 'cordova'];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webBundle = resolve(root, 'dist/index.mjs');
const source = readFileSync(webBundle);
const gzipSize = gzipSync(source).length;
const failures = [];

if (gzipSize > WEB_GZIP_BUDGET) {
  failures.push(`web bundle is ${gzipSize} gzip bytes, budget is ${WEB_GZIP_BUDGET}`);
}

const text = source.toString('utf8');
for (const term of FORBIDDEN) {
  if (text.includes(term)) {
    failures.push(`web bundle contains "${term}"; native code must stay out of the web entry`);
  }
}

if (failures.length > 0) {
  console.error(failures.map(line => `check-bundle: ${line}`).join('\n'));
  process.exit(1);
}

console.log(`check-bundle: web bundle ${gzipSize} gzip bytes (budget ${WEB_GZIP_BUDGET}), no native SDK references`);
