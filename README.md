# Service Lasso Service Catalog

This repository is the approved service catalog for Service Lasso.

Service Lasso uses this catalog to populate the Service Admin Add Service flow. The catalog stores approved GitHub service package repositories, not service package archives. Available package versions are discovered from GitHub Releases in each listed repository.

## Files

- `catalog.json` is the canonical approved service index.
- `schemas/service-catalog.schema.json` defines the catalog contract.
- `scripts/validate-catalog.mjs` validates the current index and schema-critical invariants.
- `entries/` is reserved for optional split entries if the catalog later becomes too large for one index file.

## Catalog Model

Each entry describes one approved package repository:

- stable package id
- display name and summary
- GitHub repository owner/name and URL
- category and tags for grouping/search
- publisher
- trust status
- default version policy
- release asset matching rule
- manifest path inside the release archive, normally `service.json`

The catalog does not duplicate every available package version. Service Lasso should load `catalog.json`, list releases for each approved GitHub repository, then select release assets that match the entry's `releaseAsset` rule.

## Version Discovery

The MVP version source is GitHub Releases:

1. Read a catalog entry.
2. Request releases for `repository.owner` and `repository.name`.
3. Ignore draft releases.
4. Follow `defaultVersionPolicy` when choosing a default version.
5. Download the first asset matching `releaseAsset.namePattern`.
6. Read the service manifest at `manifestPath` inside the archive.

Pre-release handling is entry-specific. The initial catalog disallows pre-releases for default selection.

## Validation

Run:

```powershell
npm run validate
```

The validator checks the catalog shape, uniqueness constraints, repository URL consistency, release discovery settings, and the fields that Service Lasso core needs for consumption.
