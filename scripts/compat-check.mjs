import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const check = (name, fn) => {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`FAIL ${name}: ${error.message}`);
  }
};

check("ESM import of root, providers, and Capacitor", () => {
  execFileSync(process.execPath, [
    "--input-type=module",
    "-e",
    `const m = await import(${JSON.stringify(join(root, "dist/index.mjs"))});
     const p = await import(${JSON.stringify(join(root, "dist/providers/index.mjs"))});
    const c = await import(${JSON.stringify(join(root, "dist/capacitor/index.mjs"))});
    if (!m.default && !m.UniversalSocialauth) throw new Error("no default export");
    if (!p.Providers) throw new Error("no Providers export");
    if (!c.createCapacitorAdapter) throw new Error("no Capacitor adapter export");`
  ], { stdio: "pipe" });
});

check("CJS require of root, providers, and Capacitor", () => {
  const require = createRequire(import.meta.url);
  const m = require(join(root, "dist/index.js"));
  if (!m) throw new Error("require returned nothing");
  require(join(root, "dist/providers/index.js"));
  const c = require(join(root, "dist/capacitor/index.js"));
  if (!c.createCapacitorAdapter) throw new Error("no Capacitor adapter export");
});

check("SSR-safe import without window or document", () => {
  execFileSync(process.execPath, [
    "--input-type=module",
    "-e",
    `delete globalThis.window; delete globalThis.document;
     await import(${JSON.stringify(join(root, "dist/index.mjs"))});`
  ], { stdio: "pipe" });
});

check("package exports point at built files", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const targets = [
    pkg.exports["."].types,
    pkg.exports["."].import,
    pkg.exports["."].require,
    pkg.exports["./providers"].types,
    pkg.exports["./providers"].import,
    pkg.exports["./providers"].require,
    pkg.exports["./capacitor"].types,
    pkg.exports["./capacitor"].import,
    pkg.exports["./capacitor"].require,
    pkg.types
  ];
  for (const target of targets) {
    readFileSync(join(root, target));
  }
});

check("tarball contains only intended files", () => {
  const npmCliPath = process.env.npm_execpath;
  if (!npmCliPath) throw new Error("Run this check through npm so npm_execpath is available.");
  const out = execFileSync(process.execPath, [
    npmCliPath,
    "pack",
    "--dry-run",
    "--json",
    "--ignore-scripts"
  ], { cwd: root, encoding: "utf8" });
  const files = JSON.parse(out)[0].files.map((f) => f.path);
  const bad = files.filter((f) => !(f === "package.json" || f === "README.md" || f === "LICENSE" || f.startsWith("dist/")));
  if (bad.length) throw new Error(`unexpected files: ${bad.slice(0, 5).join(", ")}`);
  const declarationFiles = [
    "dist/index.d.ts",
    "dist/providers/index.d.ts",
    "dist/adapters/capacitor/index.d.ts"
  ];
  const missing = declarationFiles.filter((file) => !files.includes(file));
  if (missing.length) throw new Error(`missing declaration files: ${missing.join(", ")}`);
});

if (failures.length) {
  console.error(`\n${failures.length} compatibility check(s) failed.`);
  process.exit(1);
}
console.log("\nAll compatibility checks passed.");
