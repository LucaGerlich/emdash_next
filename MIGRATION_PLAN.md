# EmDash Rewrite Plan: Next.js + PostgreSQL

## 1. Goals and Scope

- Rewrite the project from Astro-first architecture to Next.js-first architecture.
- Standardize on PostgreSQL as the primary production database.
- Preserve core product capabilities: CMS API, admin app, auth, content model, media, plugins, and migrations.
- Minimize functional regressions by prioritizing API and behavior parity.

## 2. Migration Strategy

- Use a **phased migration** rather than a big-bang rewrite.
- Keep core business logic framework-agnostic where possible.
- Introduce a Next.js integration layer that replaces Astro-specific runtime, routes, and middleware.
- Migrate and validate in vertical slices (auth, content APIs, admin shell, rendering) to reduce risk.

## 3. Target Architecture

### Framework

- Adopt Next.js App Router as the main application runtime.
- Use Route Handlers for backend API endpoints.
- Use Next middleware for request-level concerns (security headers, session bootstrap, request context).

### Data Layer

- Keep Kysely as query abstraction.
- Use PostgreSQL adapter as default dialect in app runtime and examples.
- Audit all SQL paths for SQLite-specific assumptions and convert to dialect-aware or PostgreSQL-native behavior.

### Runtime

- Port current runtime orchestration to a Next-compatible server module.
- Preserve handler-layer contracts (`success/data/error` envelopes).
- Keep plugin and hook execution boundaries clear between framework glue and core logic.

## 4. Workstreams

### A. Core Platform Extraction

- Identify Astro-specific modules and extract reusable core services.
- Define a stable internal interface for runtime init, db access, storage, hooks, auth, and manifest generation.
- Ensure framework-independent code remains in package-level core modules.

### B. Next.js App Scaffolding

- Create Next app shell for public site + admin mount.
- Configure TypeScript, linting, formatting, test setup, env management, and deployment target.
- Establish route conventions mirroring current endpoint surface.

### C. API Migration

- Port all `/_emdash/api/*` endpoints to Next Route Handlers.
- Preserve request/response schema, error shape, pagination, and auth/authorization behavior.
- Add compatibility redirects/rewrites where necessary for transition.

### D. Middleware and Request Context

- Reimplement runtime initialization and setup checks in Next lifecycle.
- Recreate security headers and CSRF requirements.
- Port request context propagation currently handled in Astro middleware.

### E. Admin UI Integration

- Host existing React admin app in Next route(s) with minimal behavioral change.
- Keep existing API client assumptions working (`/_emdash/api/...`).
- Validate localization, plugin admin pages, and dashboard behavior.

### F. Rendering and Components

- Replace Astro rendering primitives with Next/React equivalents.
- Migrate public-page integrations (SEO/meta, widgets, portable text, media components).
- Ensure SSR behavior and client interactivity parity.

### G. PostgreSQL Hardening

- Audit migrations for SQLite-specific SQL and ensure PostgreSQL-safe paths.
- Validate indexes, constraints, and transaction behavior.
- Define database operations runbook (migrations, backup, restore, rollback).

### H. Tooling, Templates, and Docs

- Add/refresh Next + PostgreSQL demo/template(s).
- Update contributor and setup docs for Next runtime.
- Update scaffolding workflows to generate Next-first projects.

## 5. Data Migration Plan

- Build export/import tooling for SQLite (or existing dialects) to PostgreSQL.
- Migrate system tables, dynamic content tables, revisions, media metadata, auth/session data.
- Validate integrity with row counts, checksums/snapshots, and smoke queries.
- Perform at least one full dry-run migration on staging before production cutover.

## 6. Testing and Validation

- Add migration-specific contract tests for API parity.
- Run unit, integration, and e2e suites against Next + PostgreSQL.
- Validate high-risk workflows: setup, login/passkeys, content CRUD, publish/schedule, media uploads, plugin routes.
- Track and resolve performance regressions (response time, query counts, memory).

## 7. Rollout Plan

- Phase 1: internal/staging rollout with mirrored production-like data.
- Phase 2: limited canary rollout with monitoring and rollback readiness.
- Phase 3: full cutover to Next.js + PostgreSQL.
- Phase 4: decommission Astro-specific integration code after stabilization window.

## 8. Risks and Mitigations

- **Framework migration complexity**: reduce risk by preserving handler-layer logic and doing phased cutovers.
- **Behavior drift in APIs**: enforce contract tests and parity checks.
- **Database edge cases**: run staged migration rehearsals and backout plans.
- **Plugin compatibility issues**: establish compatibility checklist and phased enablement.

## 9. Definition of Done

- Next.js app fully replaces Astro app for target environments.
- PostgreSQL is the default and validated database backend.
- All critical user workflows pass in CI and staging.
- Documentation and templates reflect the new default architecture.
- Production cutover completed with rollback plan tested and no critical regressions.
