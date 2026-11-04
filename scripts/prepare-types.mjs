import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entries = [
  { path: "index", defaultExport: "UniversalSocialauth" },
  { path: "providers/index" },
  { path: "adapters/capacitor/index" }
];

for (const entry of entries) {
  const exports = `export * from './index.js';\n${
    entry.defaultExport === undefined
      ? ""
      : `export { ${entry.defaultExport} as default } from './index.js';\n`
  }`;
  for (const extension of ["mts", "cts"]) {
    writeFileSync(join(root, "dist", `${entry.path}.d.${extension}`), exports);
  }
}
