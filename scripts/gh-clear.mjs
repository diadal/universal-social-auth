import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { isAbsolute } from "node:path";

function resolveGhPath() {
  const configuredPath = process.env.GH_CLI_PATH;
  if (configuredPath !== undefined) {
    if (!isAbsolute(configuredPath)) {
      throw new TypeError("GH_CLI_PATH must be an absolute path.");
    }
    if (!existsSync(configuredPath)) {
      throw new Error(`GitHub CLI was not found at GH_CLI_PATH: ${configuredPath}`);
    }
    return configuredPath;
  }

  const candidates = process.platform === "win32"
    ? [String.raw`C:\Program Files\GitHub CLI\gh.exe`]
    : ["/usr/bin/gh", "/usr/local/bin/gh", "/opt/homebrew/bin/gh", "/home/linuxbrew/.linuxbrew/bin/gh"];
  const ghPath = candidates.find((candidate) => existsSync(candidate));
  if (!ghPath) {
    throw new Error("GitHub CLI was not found; set GH_CLI_PATH to its absolute path.");
  }
  return ghPath;
}

const GH_PATH = resolveGhPath();

function isTransientApiFailure(message) {
  const marker = message.indexOf("HTTP ");
  if (marker === -1) return false;
  const status = Number(message.slice(marker + 5, marker + 8));
  return status >= 500 && status < 600;
}

function runGh(args, attempt = 1) {
  const result = spawnSync(GH_PATH, args, { encoding: "utf8" });
  if (result.error) {
    throw new Error(`Unable to run GitHub CLI: ${result.error.message}`);
  }
  if (result.status === 0) return Promise.resolve(result.stdout.trim());

  const details = result.stderr?.trim() ?? "";
  const message = details || `GitHub CLI exited with code ${result.status}`;
  if (!isTransientApiFailure(message) || attempt === 3) {
    throw new Error(message);
  }
  const delayMs = 1000 * attempt;
  console.warn(`Transient GitHub API error; retrying in ${delayMs / 1000}s.`);
  return new Promise((resolve) => setTimeout(resolve, delayMs))
    .then(() => runGh(args, attempt + 1));
}

function parseArguments(args) {
  const unsupported = args.filter((arg) => arg !== "--apply" && arg !== "--help");
  if (unsupported.length > 0) {
    throw new TypeError(`Unsupported argument: ${unsupported[0]}`);
  }
  return { apply: args.includes("--apply"), help: args.includes("--help") };
}

async function readRepository() {
  const repository = await runGh(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  const parts = repository.split("/");
  if (parts.length !== 2 || parts.some((part) => part.length === 0)) {
    throw new TypeError(`Could not determine the current GitHub repository: ${repository}`);
  }
  return repository;
}

async function readWorkflowRuns(repository) {
  const endpoint = `repos/${repository}/actions/runs?per_page=100`;
  const output = await runGh(["api", "--paginate", "--slurp", endpoint]);
  let pages;
  try {
    pages = JSON.parse(output);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not parse workflow runs from GitHub: ${detail}`);
  }
  if (!Array.isArray(pages)) {
    throw new TypeError("GitHub returned an invalid workflow-runs response.");
  }

  const runs = [];
  for (const page of pages) {
    if (!page || typeof page !== "object" || !Array.isArray(page.workflow_runs)) {
      throw new TypeError("GitHub returned a page without workflow runs.");
    }
    for (const run of page.workflow_runs) {
      validateRun(run);
      runs.push(run);
    }
  }
  return runs;
}

function validateRun(run) {
  if (!run || typeof run !== "object" || Array.isArray(run)) {
    throw new TypeError("GitHub returned an invalid workflow run.");
  }
  for (const field of ["id", "workflow_id", "run_number", "run_attempt"]) {
    if (!Number.isSafeInteger(run[field])) {
      throw new TypeError(`GitHub returned a workflow run with an invalid ${field}.`);
    }
  }
  if (typeof run.status !== "string") {
    throw new TypeError("GitHub returned a workflow run without a status.");
  }
}

function isNewerSuccessfulRun(candidate, current) {
  return (
    candidate.run_number > current.run_number ||
    (candidate.run_number === current.run_number && candidate.run_attempt > current.run_attempt) ||
    (candidate.run_number === current.run_number &&
      candidate.run_attempt === current.run_attempt &&
      candidate.id > current.id)
  );
}

function planRuns(runs) {
  const keepIds = new Set();
  const latestSuccessful = new Map();
  let pendingCount = 0;

  for (const run of runs) {
    if (run.status !== "completed") {
      keepIds.add(run.id);
      pendingCount++;
      continue;
    }
    if (run.conclusion !== "success") continue;

    const current = latestSuccessful.get(run.workflow_id);
    if (!current || isNewerSuccessfulRun(run, current)) {
      latestSuccessful.set(run.workflow_id, run);
    }
  }

  for (const run of latestSuccessful.values()) {
    keepIds.add(run.id);
  }
  return {
    keepIds,
    pendingCount,
    greenCount: latestSuccessful.size,
    deleteRuns: runs.filter((run) => !keepIds.has(run.id))
  };
}

function describeRun(run) {
  const name = typeof run.name === "string" ? run.name : `workflow ${run.workflow_id}`;
  const conclusion = typeof run.conclusion === "string" ? `, ${run.conclusion}` : "";
  return `  ${run.id} - ${name} (${run.status}${conclusion})`;
}

function printUsage() {
  console.log("Usage: npm run gh:clear [-- --apply]");
  console.log("Default: dry-run. Add --apply to delete runs not retained.");
  console.log("Keeps the latest successful run per workflow and all non-completed runs.");
  console.log("Set GH_CLI_PATH if gh is installed outside a standard location.");
}

async function deleteSelectedRuns(runs, repository, index = 0) {
  if (index >= runs.length) return;
  const run = runs[index];
  await runGh(["run", "delete", String(run.id), "--repo", repository]);
  console.log(`Deleted run ${run.id}.`);
  await deleteSelectedRuns(runs, repository, index + 1);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const repository = await readRepository();
  const runs = await readWorkflowRuns(repository);
  const plan = planRuns(runs);
  console.log(`Repository: ${repository}`);
  console.log(`Found ${runs.length} workflow runs.`);
  console.log(`Keeping ${plan.greenCount} latest successful run(s) and ${plan.pendingCount} pending run(s).`);
  console.log(`${plan.deleteRuns.length} run(s) selected for deletion:`);
  for (const run of plan.deleteRuns) {
    console.log(describeRun(run));
  }

  if (!options.apply) {
    console.log("Dry run only. Use npm run gh:clear -- --apply to delete these runs.");
    return;
  }
  console.log(`Deleting ${plan.deleteRuns.length} run(s).`);
  await deleteSelectedRuns(plan.deleteRuns, repository);
  console.log(`Deleted ${plan.deleteRuns.length} workflow run(s).`);
}

try {
  await main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`gh:clear failed: ${detail}`);
  process.exitCode = 1;
}
