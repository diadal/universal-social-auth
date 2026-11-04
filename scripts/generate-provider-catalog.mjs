// Generates mcp/provider-catalog.json from the built package so the MCP server,
// docs site, and CI share one deterministic source. Run `--check` to verify the
// committed file is up to date.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Providers, validateProviderDefinition, PROVIDER_SCHEMA_VERSION } from '../dist/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, '../mcp/provider-catalog.json');

// Only static, serialisable fields. Runtime values such as redirectUri depend on
// the browser origin and are excluded.
const STATIC_FIELDS = [
  'name',
  'oauthType',
  'authorizationEndpoint',
  'url',
  'responseType',
  'responseMode',
  'scope',
  'scopeDelimiter',
  'requiredUrlParams',
  'optionalUrlParams',
  'display'
];

function buildCatalog() {
  const providers = {};
  const issues = [];
  for (const key of Object.keys(Providers).sort()) {
    const def = Providers[key];
    // Placeholders (oauth1/oauth2) have no endpoint and are not real providers.
    if (!def.authorizationEndpoint) continue;
    const entry = {};
    for (const field of STATIC_FIELDS) {
      if (def[field] !== undefined) entry[field] = def[field];
    }
    providers[key] = entry;
    issues.push(...validateProviderDefinition(key, def));
  }
  return {
    schemaVersion: PROVIDER_SCHEMA_VERSION,
    providers,
    issues
  };
}

const json = JSON.stringify(buildCatalog(), null, 2) + '\n';

if (process.argv.includes('--check')) {
  const current = readFileSync(outPath, 'utf8');
  if (current !== json) {
    console.error('mcp/provider-catalog.json is out of date. Run: npm run catalog:generate');
    process.exit(1);
  }
  console.log('provider catalog is up to date');
} else {
  writeFileSync(outPath, json);
  console.log(`wrote ${outPath}`);
}
