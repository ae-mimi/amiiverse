const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join(
  process.cwd(),
  "node_modules",
  "sanity",
  "lib",
  "_chunks-es",
  "shouldAutoUpdate.js"
);

const buggyInstalledAssign =
  "installed = semver.coerce(manifestPath ? semver.parse((await readPackageManifest(manifestPath)).version) : semver.coerce(manifestVersion));";
const fixedInstalledAssign =
  "installed = manifestPath ? semver.parse((await readPackageManifest(manifestPath)).version) ?? semver.coerce(manifestVersion) : semver.coerce(manifestVersion);";

const buggyThrow =
  "if (!installed)\n      throw new Error(`Failed to parse installed version for ${pkg}`);";
const fixedThrow = "if (!installed)\n      continue;";

if (!fs.existsSync(filePath)) {
  console.warn(`[patch-sanity] Skipped: file not found: ${filePath}`);
  process.exit(0);
}

const source = fs.readFileSync(filePath, "utf8");

if (source.includes(fixedInstalledAssign) && source.includes(fixedThrow)) {
  console.log("[patch-sanity] Already patched");
  process.exit(0);
}

let output = source;
let didPatch = false;

if (output.includes(buggyInstalledAssign)) {
  output = output.replace(buggyInstalledAssign, fixedInstalledAssign);
  didPatch = true;
}

if (output.includes(buggyThrow)) {
  output = output.replace(buggyThrow, fixedThrow);
  didPatch = true;
}

if (!didPatch) {
  console.warn("[patch-sanity] Skipped: target snippets not found");
  process.exit(0);
}

fs.writeFileSync(filePath, output, "utf8");
console.log("[patch-sanity] Applied Sanity auto-update deploy fixes");
