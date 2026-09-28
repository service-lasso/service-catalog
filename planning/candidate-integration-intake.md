# Candidate integration intake

This document records the planning gate for proposed catalog services. It does
not approve a publisher, repository, package artifact, version, or service
manifest. A catalog entry is added only after the owning service package has
met this intake and its runtime qualification requirements.

## Required decisions for every candidate

Before an entry can be proposed for `catalog.json`, the named owner must record:

1. The operator workflow and supported platforms.
2. The owning Service Lasso service-package repository and maintainer.
3. The upstream source, licence, release identity, integrity strategy, and
   trust decision.
4. Install, setup, configuration, secret-reference, health/readiness, stop,
   update, and owned-cleanup behaviour in an active owning specification and
   canonical manifest.
5. The catalog identifier, publisher, repository URL, version policy, release
   asset pattern, and manifest path.
6. Fresh-workspace Core acquisition and lifecycle evidence, including a useful
   user outcome, failure handling, and cleanup.
7. Admin Add Service discovery/acquisition evidence using the actual approved
   release asset.

An unapproved candidate must stay out of `catalog.json`. Validation of the
catalog schema is not evidence that an unqualified external package is safe or
usable.

## Nango — catalog issue #4

Status: planning only. No owning Service Lasso package repository, maintainer,
publisher trust decision, supported version, platform commitment, or release
asset rule has been approved.

The owner must define the intended operator outcome before implementation. The
intake must then bind the exact manifest lifecycle and qualification evidence
listed above. Do not infer a package identity or credential flow from the
product name alone.

## GraphQL Mesh — catalog issue #5

Status: planning only. No owning Service Lasso package repository, maintainer,
publisher trust decision, supported version, platform commitment, or release
asset rule has been approved.

The owner must define the intended operator outcome before implementation. The
intake must then bind the exact manifest lifecycle and qualification evidence
listed above. Do not infer a package identity or upstream artifact layout from
the product name alone.

## Transition to implementation

After the required decisions are reviewed, create an issue in the chosen owning
service-package repository. That issue must reference the active specification
sections and contain the acceptance plan. Only then may it move from planning
to implementation; the catalog item remains a separate final-discovery gate.
