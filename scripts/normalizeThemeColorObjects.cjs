/*
 * One-off data normalizer:
 * Ensures theme color fields are stored as {_type: "color", hex: "#xxxxxx"}.
 *
 * Usage:
 *   node scripts/normalizeThemeColorObjects.cjs
 */

const fs = require("fs");

const COLOR_FIELDS = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "backgroundColor",
  "textColor",
  "mutedTextColor",
];

function makeEmptyThemeOverride() {
  return {
    _type: "themeOverride",
    primaryColor: { _type: "color" },
    secondaryColor: { _type: "color" },
    accentColor: { _type: "color" },
    backgroundColor: { _type: "color" },
    textColor: { _type: "color" },
    mutedTextColor: { _type: "color" },
  };
}

function loadEnv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const out = {};
  for (const line of lines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const idx = line.indexOf("=");
    out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return out;
}

function normalizeColorValue(value) {
  if (!value) return null;
  if (typeof value === "string") {
    return { _type: "color", hex: value };
  }
  if (typeof value === "object" && typeof value.hex === "string") {
    return { ...value, _type: "color" };
  }
  return null;
}

function pathSet(path, value, out) {
  out[path] = value;
}

async function main() {
  const env = loadEnv(".env");
  if (!env.SANITY_WRITE_TOKEN) throw new Error("Missing SANITY_WRITE_TOKEN in .env");

  const { createClient } = await import("@sanity/client");
  const client = createClient({
    projectId: "pxn399gi",
    dataset: "production",
    apiVersion: "2024-12-01",
    token: env.SANITY_WRITE_TOKEN,
    useCdn: false,
  });

  const docs = await client.fetch(`
    *[_type in ["settings", "campaign"]]{
      _id,
      _type,
      theme,
      themeOverride
    }
  `);

  let touched = 0;
  for (const doc of docs) {
    const setPatch = {};

    const targets = [];
    if (doc._type === "settings" && doc.theme && typeof doc.theme === "object") {
      targets.push({ base: "theme", data: doc.theme });
    }
    if (doc._type === "campaign" && doc.themeOverride && typeof doc.themeOverride === "object") {
      targets.push({ base: "themeOverride", data: doc.themeOverride });
      if (doc.themeOverride._type !== "themeOverride") {
        setPatch["themeOverride._type"] = "themeOverride";
      }
    }

    if (
      doc._type === "campaign" &&
      (!doc.themeOverride || typeof doc.themeOverride !== "object" || Array.isArray(doc.themeOverride))
    ) {
      setPatch.themeOverride = makeEmptyThemeOverride();
    }

    for (const target of targets) {
      for (const field of COLOR_FIELDS) {
        if (
          doc._type === "campaign" &&
          target.base === "themeOverride" &&
          (target.data[field] === undefined || target.data[field] === null)
        ) {
          pathSet(`${target.base}.${field}`, { _type: "color" }, setPatch);
          continue;
        }

        const normalized = normalizeColorValue(target.data[field]);
        if (!normalized) continue;
        const current = target.data[field];
        const currentType = current && typeof current === "object" ? current._type : undefined;
        const currentHex = current && typeof current === "object" ? current.hex : current;
        if (currentType !== "color" || currentHex !== normalized.hex) {
          pathSet(`${target.base}.${field}`, normalized, setPatch);
        }
      }
    }

    if (Object.keys(setPatch).length > 0) {
      await client.patch(doc._id).set(setPatch).commit();
      touched += 1;
      console.log(`Patched ${doc._id}`);
    }
  }

  console.log(`Done. Updated ${touched} document(s).`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
