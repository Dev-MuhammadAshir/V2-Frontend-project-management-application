# Frontend Dependency and Import Rules

**Status:** Proposed standards for Phase 3+ implementation.  
**Observed stack:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Zod 4, Recharts and React Hook Form dependency. TanStack Query and Socket.IO Client are named by the SRS target stack but were not in the inspected package manifest.

## 1. Dependency policy

- Phase 2 adds no dependencies.
- Prefer existing capabilities when adequate.
- New runtime dependency requires documented need, compatibility, maintenance/security, license, bundle impact and rollback review.
- Lock approved versions in the package lockfile.
- Do not add duplicate state-management or validation libraries without an ADR.
- Express in a frontend package manifest does not prove a backend is implemented.

## 2. Allowed import direction

| From | May import | Must not import |
|---|---|---|
| app/bootstrap | Feature entry points, shared providers, composition | Feature internals as orchestration |
| feature UI | Own application API, shared UI/utilities | fetch/socket/localStorage implementations |
| feature application | Domain, ports, shared primitives | React components, browser APIs, concrete adapters |
| feature domain | Pure primitives | React, Zod transport schema, fetch, storage, router |
| infrastructure adapters | Ports, DTO schemas, shared transport types | Page components |
| shared UI | Shared tokens/utilities | Feature modules or app providers |
| demo adapter | Ports, fixtures, schemas | Production API assumptions |
| tests | Target module and test utilities | Production-only side effects |

## 3. Library roles

| Technology | Role | Guardrail |
|---|---|---|
| React | UI and local interaction state | Avoid globalizing all server state |
| TypeScript | Static contracts | Runtime JSON still needs validation |
| Vite | Build/dev server | No secrets in bundled config |
| Tailwind | Styling | Preserve existing visual tokens |
| React Router | Navigation and UX guards | Not authorization |
| Zod | Runtime parsing and form validation | Keep DTO schemas separate from pure domain rules |
| React Hook Form | Complex forms where useful | Do not force into trivial controls |
| Recharts | Existing charts | Production series must be data-backed |
| TanStack Query | SRS target server-state lifecycle | Evaluate/add in a later implementation PR |
| Socket.IO Client | SRS target realtime transport | Add only with verified handshake/event contract |
| Test runner | To be selected | No runner/script was declared in inspected manifest |

## 4. Prohibited patterns

- Direct fetch, localStorage or socket use from page components.
- Blind casting of API JSON to domain types.
- Feature-to-feature private imports or circular dependencies.
- Persistent token storage without approved security design.
- Adding another state framework to hide unclear ownership.
- Committing API keys, passwords, tokens, private keys or production secrets.
- Bundling backend-only packages into browser code.
- Falling back to demo data after production API failure.
- Fake realtime latency, synthetic analytics or client-generated immutable audit presented as production facts.

## 5. Future enforcement

After test/lint tooling is selected, add TypeScript checks, import-boundary rules, circular dependency detection, dependency/license/security scanning, bundle-size reporting and clean-install build verification. Do not claim these checks exist until config and CI runs are committed.

## 6. Dependency approval record

Every package proposal documents capability gap, why existing dependencies are insufficient, exact version and React/Vite/TypeScript compatibility, runtime/dev status, advisories/maintenance/license, bundle impact, test plan, rollback and ADR/PR approval.
