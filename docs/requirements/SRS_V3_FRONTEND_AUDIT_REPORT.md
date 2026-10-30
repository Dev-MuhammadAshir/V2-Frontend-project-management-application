# Frontend SRS v3.0 Audit Report — Initial Static Review

**Repository:** `Dev-MuhammadAshir/V2-Frontend-project-management-application`  
**Baseline:** `public/assets/aistudio/SRS_3.0_CONSOLIDATED_BASELINE_e782668d.md`  
**Audit branch:** `audit/srs-v3-requirements-enhancement`  
**Review type:** Documentation + static source inspection. This is not a runtime, accessibility, security penetration, or backend conformance certification.

## 1. Executive summary

The repository is a substantial React + TypeScript + Vite frontend prototype with pages for dashboard, projects, project detail, Kanban, tasks, teams, user management, notifications, analytics, audit logs, PIRAE risks, profile and settings. Reusable UI primitives and a shared `AppContext` exist, and mock data supports demonstration workflows.

However, the code is still a **frontend prototype**, not evidence that the complete SRS v3.0 system has been implemented. The SRS explicitly requires a backend-authoritative modular monolith, PostgreSQL as source of truth, Redis for session/blacklist/pub-sub duties, Socket.IO real-time collaboration, API validation, persistent audit trail, and asynchronous PIRAE processing. The inspected frontend package has no Socket.IO client, API/query client, or server-backed data layer evident in its dependencies. Several behaviours are represented by localStorage, seeded mock data, and simulated connection telemetry.

The first high-value work is therefore: (1) make the prototype honest and safe as a demo, (2) align the front-end domain model and workflows with the frozen SRS contracts, (3) add contract/traceability and tests, and (4) document backend-owned requirements as integration dependencies rather than pretending the frontend satisfies them.

## 2. Confirmed repository facts

- SRS v3.0 exists at `public/assets/aistudio/SRS_3.0_CONSOLIDATED_BASELINE_e782668d.md` and declares itself the authoritative baseline.
- The app uses React, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form, Zod, Recharts and Lucide icons.
- Routes exist for the major workspace pages in `src/App.tsx`.
- `src/context/AppContext.tsx` stores domain collections in React state and localStorage and creates mock audit/activity/toast entries.
- `src/context/MockAuthContext.tsx` implements a role simulator and a local `can(action)` permission switch.
- `src/components/layout/Topbar.tsx` presents an always-green “Connected” indicator and role-switching controls intended for prototype testing.
- `src/pages/Login.tsx` uses role selection / quick selection; its default values are demo credentials and the submit path selects a mock user rather than validating credentials against an authentication service.
- Domain types include compatibility/legacy unions and fields beyond the frozen SRS enums. This can be useful during migration but increases risk of accepting invalid states.
- `AppContext` persistence keys are inconsistent: initial reads use versioned keys such as `projectflow_tasks_v3`, while inspected effects write keys such as `projectflow_tasks`. This can make saved state fail to reload consistently.
- No test script or test runner is defined in the inspected `package.json`; `lint` is `tsc --noEmit`, and `build` is `vite build`.

## 3. Priority findings

### P0 — Authentication/logout semantics are misleading
**Evidence:** `src/pages/Login.tsx`, `src/context/MockAuthContext.tsx`, `src/components/layout/Topbar.tsx`, `src/App.tsx`.

The login page is a role-based demo selector, not authentication. The sign-out UI navigates to `/login` but the inspected handler does not call the mock auth `logout()`. The mock auth initializer also falls back to the first demo user when no saved user is found. Protected application routes are nested under `MainLayout` without an explicit authentication guard. Therefore the current route/session behaviour does not demonstrate the SRS session/logout acceptance criteria.

**Remediation:** label demo mode visibly; wire sign-out to clear both auth and app identity state; introduce an explicit session/route guard for the prototype; test direct navigation to protected routes after logout. Keep real JWT/JTI blacklist/refresh revocation marked backend-required until integrated.

### P0 — RBAC checks are not authoritative and are inconsistently applied
**Evidence:** `MockAuthContext.can()`, `Sidebar.tsx`, and pages/components that call mutations from `AppContext`.

The frontend permission helper can only hide UI or simulate role-specific behaviour. The SRS requires server-side role + team/project membership + resource-level authorization. The permission helper accepts an untyped action string and does not use its resource argument to verify membership. Some navigation entries have no permission key (for example Teams, Kanban, Settings), and individual mutations need consistent permission gating. Frontend checks must never be represented as a security boundary.

**Remediation:** centralize a typed permission catalog mapped to Appendix A; use a reusable UI guard for visibility/disabled states; ensure each action is covered by tests for all four global roles and project roles; record backend authorization as a blocking integration requirement.

### P0 — “Real-time connected” telemetry is simulated
**Evidence:** `src/context/AppContext.tsx` initializes `realTimeConnected` to `true`, latency to a small fixed value and periodically jitters the latency; `Topbar.tsx` labels the status “Connected”.

No real Socket.IO client/Redis integration is evident in the inspected frontend dependencies/files. The indicator can mislead a reviewer into thinking the NFR-RT targets are verified.

**Remediation:** show an explicit “Demo simulation” badge until a real transport adapter is connected. Define a transport interface with connected/reconnecting/offline/error states and latency only from actual measured acknowledgements. Real JWT socket auth, authorized room joins, Redis Pub/Sub, reconnection and missed-event replay are backend/integration requirements.

### P1 — localStorage persistence contract is inconsistent
**Evidence:** initial state reads use `projectflow_*_v3` keys in `AppContext.tsx`; write effects use unversioned keys for several core collections. Other collections do not show corresponding write effects in the inspected section.

**Remediation:** create one typed storage adapter with a single versioned key registry, safe JSON parse/migration, schema validation, and explicit reset behaviour. Do not store access tokens/secrets in localStorage. Treat this storage as demo persistence only, not a replacement for PostgreSQL.

### P1 — Frozen SRS enums are weakened by compatibility unions
**Evidence:** `src/types/index.ts`.

The SRS freezes task status to `TODO | IN_PROGRESS | DONE`, priority to `LOW | MEDIUM | HIGH | CRITICAL`, project role to `Manager | Contributor | Viewer`, team role to `Admin-Assigned | Member`, and risk lifecycle to `Open | Resolved`. The current types allow additional legacy values (for example `OnHold`, `ACTIVE`, `SCHEDULE_SLIP`, `IN_REVIEW`, `MITIGATED`, `DISMISSED`). These aliases can leak into app state and make frontend data diverge from the SRS/API contract.

**Remediation:** define strict API/domain types for the SRS contract; isolate legacy UI presentation aliases in explicit mapping/normalization functions; validate inbound/outbound payloads with Zod. Keep mock fixtures contract-valid.

### P1 — Dependency rules are not consistently enforced
**Evidence:** `AppContext.moveTaskStatus()` updates status without checking whether prerequisite tasks are complete; `addDependency()` blocks self-dependency and duplicate pairs but does not visibly prevent cycles or cross-project links.

**Remediation:** before marking a task `DONE`, check all incoming blocking dependencies and reject transition when any blocker is not `DONE`; reject cross-project dependency links and graph cycles. Add unit tests for valid links, self-link, duplicate, cycle, cross-project, and blocked completion. Backend must enforce the same invariants.

### P1 — Audit log semantics are only a mutable demo approximation
**Evidence:** `AppContext.recordAudit()` prepends entries to React state and assigns timestamp-derived IDs; no inspected persistence effect for audit logs, correlation ID generation, append-only enforcement or retention policy.

**Remediation:** align the frontend display model to actor/action/entity/old-values/new-values/timestamp/correlation ID. Use stable UUIDs in the demo, persist demo logs if expected, and make UI read-only. Backend must enforce append-only semantics and ≥12-month retention.

### P1 — Risk state and PIRAE lifecycle diverge from baseline
**Evidence:** types and mock context permit values such as `OPEN`, `MITIGATED`, `DISMISSED`, while SRS uses `Open` / `Resolved` and `resolved_at`. Risk resolution is local state; no evidence of BullMQ execution within 5 seconds or daily 00:00 UTC cron in the frontend.

**Remediation:** normalize risk status to the SRS contract, track `resolvedAt`, display reasons/recommendations, and label mock calculations as simulated. Verify exact workload thresholds, delay formula/20% override, dependency scoring, and HIGH/CRITICAL priority rules in unit tests. Async queue and cron remain backend-owned.

### P1 — Analytics can appear authoritative while being mock-derived
**Evidence:** analytics and project-detail pages render charts from current app collections; source collections are seeded/local state.

**Remediation:** define calculation helpers for completion %, overdue tasks, status/priority distribution and workload; test zero-task, boundary dates, completed overdue tasks, multiple assignees, and capacity limits. Mark all analytics “Demo data” until backed by API data. Do not claim NFR performance without load tests.

### P2 — Forms and workflows need consistent validation and access handling
**Evidence:** forms exist in project/task/user/settings flows, but there is no single evident API-contract validation layer.

**Remediation:** use React Hook Form + Zod consistently, derive UI validation from SRS rules, display field-level errors, pending states, server errors, empty states and confirmation for destructive actions. API validation must still run on the server with HTTP 422.

### P2 — Accessibility and responsive compliance are not yet demonstrated
**Evidence:** Tailwind responsive layouts exist, but no automated accessibility suite or evidence of WCAG 2.1 AA verification was found in the inspected package.

**Remediation:** test keyboard-only workflows, focus trapping/restoration for modals, semantic labels, visible focus, contrast, reduced motion, screen-reader status announcements, responsive layouts and touch targets. Add automated accessibility checks and manual test notes.

## 4. Requirement coverage and limits

See [`SRS_V3_ATOMIC_TRACEABILITY_MATRIX.md`](./SRS_V3_ATOMIC_TRACEABILITY_MATRIX.md) for the initial 187-row unique requirement inventory extracted from requirement/interface/constraint tables. It intentionally does **not** label untested requirements as Pass.

The matrix is a starting point, not the final atomic acceptance suite. The SRS includes requirements with multiple independently testable clauses, plus:
- 13 frozen real-time events and their payload envelope/schema;
- Appendix A role/permission matrix and system/team/project role independence;
- detailed PIRAE formulas, thresholds and decision boundaries;
- data dictionary constraints, XOR attachment ownership, indexes and referential integrity;
- API success/error/pagination envelopes;
- security headers and transport settings;
- reconnect/backoff/missed-event recovery;
- testing/coverage, deployment, backup, health, logging and monitoring requirements.

These need subordinate test cases linked to parent requirement IDs. Example: `FR-AUTH-11.a` (blacklist access-token JTI), `.b` (TTL matches remaining expiry), `.c` (revoke refresh token), `.d` (old access token returns 401), `.e` (old refresh token returns 401).

## 5. Recommended implementation sequence

1. **Prototype safety and truthfulness:** fix sign-out/session state, protect routes, explicitly mark mock auth and simulated real-time.
2. **Contract alignment:** remove legacy enum leakage at API boundaries; create Zod schemas for User, Project, Task, Comment, Notification, Attachment, Risk and AuditLog.
3. **Business rules:** dependency graph validation; blocked completion; comment edit window; attachment XOR and size/type validation; risk lifecycle.
4. **Persistence hygiene:** versioned storage adapter, safe parsing/migration, reset demo data, consistent collection persistence.
5. **Authorization UX:** typed permissions + project/team membership checks for UI affordances, while documenting backend enforcement as mandatory.
6. **Traceable tests:** unit tests for business rules; component tests for role-specific controls/forms; accessibility checks; API contract tests once API exists.
7. **Backend integration boundary:** typed API client for `/api/v1`, standardized envelope/pagination/error handling, Socket.IO adapter and reconnection state.
8. **Verification:** run install, `npm run lint`, `npm run build`, tests and accessibility checks; capture outputs and update matrix statuses with evidence.

## 6. Acceptance policy for this audit

- **Pass:** repeatable test passes and implementation evidence is linked.
- **Partial:** some clauses work, but at least one clause or integration dependency remains.
- **Fail:** implementation contradicts the SRS or a test fails.
- **Blocked / Backend-owned:** frontend cannot satisfy the requirement independently.
- **Not assessed:** not inspected or not tested yet.

No performance, security, accessibility, backend, or full SRS conformance claim should be made until the relevant verification evidence exists.
