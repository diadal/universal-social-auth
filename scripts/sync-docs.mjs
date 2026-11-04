import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const source = join(repoRoot, "docs");
const target = join(repoRoot, "docs-site", "content", "docs");
const examplesUrl = "https://github.com/diadal/universal-social-auth/tree/main/examples/";

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

// Examples live outside the site, so link them to GitHub.
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

let rewritten = 0;
for (const file of walk(target).filter((f) => f.endsWith(".md"))) {
  const text = readFileSync(file, "utf8");
  const next = text.replace(/\((?:\.\.\/)+examples\//g, `(${examplesUrl}`);
  if (next !== text) {
    writeFileSync(file, next);
    rewritten++;
  }
}

const count = walk(target).filter((f) => f.endsWith(".md")).length;
console.log(`Synced ${count} markdown files from ${relative(repoRoot, source)} (${rewritten} rewritten).`);
if (!existsSync(join(target, "lifecycle.md"))) {
  throw new Error("docs/lifecycle.md missing after sync");
}
