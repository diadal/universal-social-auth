/**
 * @jest-environment node
 */
const { spawnSync } = require('node:child_process');
const { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join, resolve } = require('node:path');

const entries = [
  ['.', 'index', 'index'],
  ['./providers', 'providers/index', 'providers/index'],
  ['./capacitor', 'capacitor/index', 'adapters/capacitor/index']
];
const packageExports = Object.fromEntries(entries.map(([name, runtime, types]) => [
  name,
  {
    import: { types: `./dist/${types}.d.mts`, default: `./dist/${runtime}.mjs` },
    require: { types: `./dist/${types}.d.cts`, default: `./dist/${runtime}.js` }
  }
]));
const targets = [
  ...Object.values(packageExports).flatMap(entry => [
    entry.import.types, entry.import.default, entry.require.types, entry.require.default
  ]),
  './dist/index.d.ts'
];

describe('package export compatibility check', () => {
  let root;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'universal-social-auth-compat-'));
    mkdirSync(join(root, 'scripts'));
    copyFileSync(
      resolve(__dirname, '../../scripts/compat-check.mjs'),
      join(root, 'scripts/compat-check.mjs')
    );
    writeFileSync(join(root, 'package.json'), JSON.stringify({
      exports: packageExports, types: './dist/index.d.ts'
    }));
    for (const target of targets) {
      mkdirSync(dirname(join(root, target)), { recursive: true });
      writeFileSync(join(root, target), target.endsWith('.mjs')
        ? 'export default {}; export const Providers = {}; export const createCapacitorAdapter = () => {};'
        : 'module.exports = { createCapacitorAdapter() {} };');
    }
    const files = [
      ...targets.map(path => ({ path: path.slice(2) })),
      { path: 'dist/providers/index.d.ts' },
      { path: 'dist/adapters/capacitor/index.d.ts' }
    ];
    writeFileSync(join(root, 'npm.cjs'),
      `console.log(${JSON.stringify(JSON.stringify([{ files }]))});`);
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  const runCheck = () => spawnSync(process.execPath, [join(root, 'scripts/compat-check.mjs')], {
    encoding: 'utf8',
    env: { ...process.env, npm_execpath: join(root, 'npm.cjs') }
  });

  it('accepts nested import/require type and runtime targets', () => {
    const result = runCheck();
    expect(result.stdout).toContain('ok   package exports point at built files');
    expect(result.status).toBe(0);
  });

  it.each(targets)('rejects a missing export target: %s', target => {
    rmSync(join(root, target));
    const result = runCheck();
    expect(result.stdout).toContain('FAIL package exports point at built files:');
    expect(result.stdout).toContain(target.slice(2));
    expect(result.status).toBe(1);
  });
});
