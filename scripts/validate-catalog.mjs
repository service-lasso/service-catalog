import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "catalog.json");
const schemaPath = path.join(root, "schemas", "service-catalog.schema.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertString(value, field) {
  assert(typeof value === "string" && value.trim().length > 0, `${field} must be a non-empty string`);
}

function assertPattern(value, pattern, field) {
  assert(pattern.test(value), `${field} has invalid value: ${value}`);
}

function assertBoolean(value, field) {
  assert(typeof value === "boolean", `${field} must be boolean`);
}

function assertNoExtraKeys(value, allowed, field) {
  for (const key of Object.keys(value)) {
    assert(allowed.includes(key), `${field} has unexpected key: ${key}`);
  }
}

const catalog = readJson(catalogPath);
const schema = readJson(schemaPath);

assert(catalog.$schema === "./schemas/service-catalog.schema.json", "catalog must reference local schema");
assert(schema.$schema === "https://json-schema.org/draft/2020-12/schema", "schema must use draft 2020-12");
assertString(catalog.schemaVersion, "schemaVersion");
assertPattern(catalog.schemaVersion, /^\d+\.\d+\.\d+$/, "schemaVersion");
assertPattern(catalog.catalogId, /^[a-z0-9][a-z0-9-]*$/, "catalogId");
assertPattern(catalog.updatedAt, /^\d{4}-\d{2}-\d{2}$/, "updatedAt");

assertNoExtraKeys(catalog.versionSource, ["type", "releaseFilter"], "versionSource");
assert(catalog.versionSource.type === "github-releases", "versionSource.type must be github-releases");
assertBoolean(catalog.versionSource.releaseFilter.includeDrafts, "versionSource.releaseFilter.includeDrafts");
assertBoolean(
  catalog.versionSource.releaseFilter.includePrereleasesByDefault,
  "versionSource.releaseFilter.includePrereleasesByDefault",
);

const ids = new Set();
const repoSlugs = new Set();
assert(Array.isArray(catalog.entries) && catalog.entries.length > 0, "entries must be a non-empty array");

for (const [index, entry] of catalog.entries.entries()) {
  const prefix = `entries[${index}]`;
  assertNoExtraKeys(
    entry,
    [
      "packageId",
      "displayName",
      "summary",
      "repository",
      "category",
      "tags",
      "publisher",
      "trustStatus",
      "defaultVersionPolicy",
      "releaseAsset",
      "manifestPath",
    ],
    prefix,
  );

  assertPattern(entry.packageId, /^[a-z0-9][a-z0-9-]*$/, `${prefix}.packageId`);
  assert(!ids.has(entry.packageId), `${prefix}.packageId duplicates ${entry.packageId}`);
  ids.add(entry.packageId);

  assertString(entry.displayName, `${prefix}.displayName`);
  assertString(entry.summary, `${prefix}.summary`);
  assertPattern(entry.category, /^[a-z0-9][a-z0-9-]*$/, `${prefix}.category`);
  assert(Array.isArray(entry.tags) && entry.tags.length > 0, `${prefix}.tags must be non-empty`);
  assert(new Set(entry.tags).size === entry.tags.length, `${prefix}.tags must be unique`);
  for (const [tagIndex, tag] of entry.tags.entries()) {
    assertPattern(tag, /^[a-z0-9][a-z0-9-]*$/, `${prefix}.tags[${tagIndex}]`);
  }

  assert(entry.publisher === "Service Lasso", `${prefix}.publisher must be Service Lasso`);
  assert(["approved", "experimental", "blocked"].includes(entry.trustStatus), `${prefix}.trustStatus is invalid`);
  assert(entry.trustStatus === "approved", `${prefix}.trustStatus must be approved for MVP catalog entries`);

  const repo = entry.repository;
  assertNoExtraKeys(repo, ["owner", "name", "url"], `${prefix}.repository`);
  assertPattern(repo.owner, /^[A-Za-z0-9_.-]+$/, `${prefix}.repository.owner`);
  assertPattern(repo.name, /^[A-Za-z0-9_.-]+$/, `${prefix}.repository.name`);
  assert(repo.owner === "service-lasso", `${prefix}.repository.owner must be service-lasso`);
  assert(
    repo.url === `https://github.com/${repo.owner}/${repo.name}`,
    `${prefix}.repository.url must match owner/name`,
  );
  assert(repo.name === entry.packageId, `${prefix}.packageId must match repository.name`);
  const slug = `${repo.owner}/${repo.name}`;
  assert(!repoSlugs.has(slug), `${prefix}.repository duplicates ${slug}`);
  repoSlugs.add(slug);

  const policy = entry.defaultVersionPolicy;
  assertNoExtraKeys(policy, ["channel", "selector", "allowPrerelease"], `${prefix}.defaultVersionPolicy`);
  assert(["stable", "preview"].includes(policy.channel), `${prefix}.defaultVersionPolicy.channel is invalid`);
  assert(["latest-semver", "latest-release"].includes(policy.selector), `${prefix}.defaultVersionPolicy.selector is invalid`);
  assertBoolean(policy.allowPrerelease, `${prefix}.defaultVersionPolicy.allowPrerelease`);

  const asset = entry.releaseAsset;
  assertNoExtraKeys(asset, ["namePattern", "required"], `${prefix}.releaseAsset`);
  assertString(asset.namePattern, `${prefix}.releaseAsset.namePattern`);
  assertBoolean(asset.required, `${prefix}.releaseAsset.required`);
  assert(asset.required === true, `${prefix}.releaseAsset.required must be true for MVP catalog entries`);
  assert(new RegExp(asset.namePattern).test(`${entry.packageId}-v1.0.0.zip`), `${prefix}.releaseAsset.namePattern must match package zip assets`);

  assertPattern(entry.manifestPath, /^[A-Za-z0-9_.\-/]+\.json$/, `${prefix}.manifestPath`);
  assert(entry.manifestPath === "service.json", `${prefix}.manifestPath must be service.json for MVP catalog entries`);
}

console.log(`Validated ${catalog.entries.length} catalog entries against schema-critical invariants.`);
