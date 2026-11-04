import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const consumerRoot = mkdtempSync(join(tmpdir(), "universal-social-auth-consumer-"));
const packageLink = join(consumerRoot, "node_modules", "universal-social-auth");

try {
  mkdirSync(dirname(packageLink), { recursive: true });
  symlinkSync(root, packageLink, process.platform === "win32" ? "junction" : "dir");
  writeFileSync(join(consumerRoot, "consumer.ts"), `
import UniversalSocialauth, {
  setPlatform,
  type KeyValueStore
} from "universal-social-auth";
import { Providers } from "universal-social-auth/providers";
import {
  createCapacitorAdapter,
  type CapacitorAdapterOptions
} from "universal-social-auth/capacitor";

const storage: KeyValueStore = {
  get: async () => null,
  set: async () => {},
  remove: async () => {}
};
const options: CapacitorAdapterOptions = {
  platform: "ios",
  browser: {
    open: async () => undefined,
    close: async () => undefined
  },
  app: {
    addListener: async () => ({ remove: async () => {} }),
    getLaunchUrl: async () => undefined
  },
  secureStorage: storage
};

setPlatform(createCapacitorAdapter(options));
void UniversalSocialauth;
void Providers;
`);
  writeFileSync(join(consumerRoot, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      module: "NodeNext",
      moduleResolution: "NodeNext",
      noEmit: true,
      strict: true,
      target: "ES2022",
      types: []
    },
    files: ["consumer.ts"]
  }));
  execFileSync(process.execPath, [
    join(root, "node_modules/typescript/bin/tsc"),
    "--project",
    join(consumerRoot, "tsconfig.json"),
    "--pretty",
    "false"
  ], { stdio: "inherit" });
  console.log("Consumer type check passed.");
} finally {
  rmSync(consumerRoot, { recursive: true, force: true });
}
