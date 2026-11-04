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

check("ESM import of root and providers", () => {
  execFileSync(process.execPath, [
    "--input-type=module",
    "-e",
    `const m = await import(${JSON.stringify(join(root, "dist/index.mjs"))});
     const p = await import(${JSON.stringify(join(root, "dist/providers/index.mjs"))});
     if (!m.default && !m.UniversalSocialauth) throw new Error("no default export");
     if (!p.Providers) throw new Error("no Providers export");`
  ], { stdio: "pipe" });
});

check("CJS require of root and providers", () => {
  const require = createRequire(import.meta.url);
  const m = require(join(root, "dist/index.js"));
  if (!m) throw new Error("require returned nothing");
  require(join(root, "dist/providers/index.js"));
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
  for (const target of [pkg.exports["."].import, pkg.exports["."].require, pkg.exports["./providers"].import]) {
    readFileSync(join(root, target));
  }
});

check("tarball contains only intended files", () => {
  const out = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: root,
    encoding: "utf8"
  });
  const files = JSON.parse(out)[0].files.map((f) => f.path);
  const bad = files.filter((f) => !(f === "package.json" || f === "README.md" || f === "LICENSE" || f.startsWith("dist/")));
  if (bad.length) throw new Error(`unexpected files: ${bad.slice(0, 5).join(", ")}`);
});

if (failures.length) {
  console.error(`\n${failures.length} compatibility check(s) failed.`);
  process.exit(1);
}
console.log("\nAll compatibility checks passed.");
