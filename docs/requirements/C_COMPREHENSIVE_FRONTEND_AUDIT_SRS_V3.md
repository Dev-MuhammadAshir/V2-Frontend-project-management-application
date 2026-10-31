# C. Comprehensive Frontend Audit — SRS 3.0

**Repository:** `Dev-MuhammadAshir/V2-Frontend-project-management-application`  
**Audited baseline:** `main` at tree `757f72e58188171342c823a9d895de156f220ef5`  
**Method:** static inspection of frontend routes, components, contexts, types, mock data and package manifest, mapped against Deliverable B.  
**Scope:** frontend prototype only; no backend service was supplied in this repository snapshot.  
**Change policy:** this audit did not modify application source code.

> “Implemented” means a client-side interaction exists. It does not establish backend persistence, security, immutable audit, event delivery or server-side enforcement. Backend-owned requirements are not marked as frontend passes.

## 1. Executive assessment

The repository is a substantial React 19 + TypeScript + Vite interactive prototype with broad screen coverage: dashboard, projects, project detail, teams, tasks, Kanban, user administration, profile, notifications, analytics, audit viewer, PIRAE risk dashboard, settings, task drawer and reusable modals.

It is **not a connected SRS 3.0 frontend implementation**. The inspected app is driven by seeded mock data and browser-local state. Authentication is a selectable-role demo; authorization is a client-side switch; CRUD mutations are local; and no API client or Socket.IO/WebSocket client was found in the inspected source/package inventory. Several screens make authoritative-sounding claims (“Immutable Audit Trail”, “Intelligence v3.0 Active”, real-time telemetry) without corresponding service evidence.

The major gaps concern trust boundaries, resource authorization, persistence, task/dependency invariants, comment ownership/time limits, attachment validation/storage, notifications, analytics provenance, audit immutability and PIRAE lifecycle.

### 1.1 Overall status

| Area | Observed evidence | Conclusion |
|---|---|---|
| Route/screen breadth | Broad page and overlay inventory | Partial — screen presence is not workflow compliance |
| UI interactions | Filters, tabs, drawers, modals and local mutations | Partial — local demo only |
| Authentication | Role picker and local identity | Fail for real authentication |
| Authorization | Client-side `can(action)` and selected route guards | Fail as security enforcement |
| API integration | No API client/service found | Not implemented |
| Real-time | Fake connected state, random latency, local flash | Not implemented |
| Persistence | Browser localStorage for selected collections | Fail for SRS source-of-truth |
| Task/dependency rules | Local checks; alternate paths bypass invariants | Partial / Fail |
| Comments/mentions | UI and local edit-window metadata | Partial |
| Attachments | Metadata UI only | Not implemented for secure file storage |
| Analytics | Local charts and hard-coded sprint velocity | Partial / misleading provenance |
| Audit | Local log and CSV export | Not implemented for immutable server audit |
| PIRAE | Risk screens and seed data | Partial / contract mismatch |
| Accessibility | Some semantic controls and labels | Not verified; gaps identified |
| Deployment/operations | Vite scripts only | Not evidenced |

### 1.2 Trust-boundary rule

The frontend must never be the authority for identity, permissions, task transitions, dependency validity, comment edit/delete rights, file safety, audit immutability, risk truth or notification delivery. The SRS-aligned backend must enforce these. The frontend may pre-validate for usability but must handle server rejection without claiming success.

## 2. Repository evidence

### 2.1 Inspected source inventory

Inspected `package.json`, `src/App.tsx`, `src/main.tsx`, `src/index.css`, `vite.config.ts`, both context providers, `src/types/index.ts`, `src/data/mockData.ts`, `src/layouts/MainLayout.tsx`, all page components and shared layout/task/project/risk/common components.

Routes include `/login`, `/403`, `/500`, `/dashboard`, `/projects`, `/projects/:projectId`, `/kanban`, `/tasks`, `/my-tasks`, `/teams`, `/teams/:teamId`, `/users`, `/profile`, `/notifications`, `/analytics`, `/risks`, `/audit-logs`, `/settings` and nested not-found.

### 2.2 Runtime/tooling

- `package.json` identifies React 19, React Router 7, TypeScript, Vite, Recharts, React Hook Form, Zod and Lucide.
- Scripts: `dev`, `build`, `preview`, `clean`, `lint`; lint is `tsc --noEmit`, not a dedicated lint/test suite.
- No test script, unit/integration/e2e framework, API SDK, Socket.IO client, WebSocket client or backend service package was found in inspected source/package.
- Express is listed as a dependency, but no Express server entry point/backend API implementation appears in the inspected frontend source inventory.
- Build, lint, browser automation and accessibility scans were not run. Runtime/build correctness remains **unverified**.

### 2.3 State/data flow

`AppContext` initializes users, teams, memberships, projects, tasks, comments, risks, audit logs, notifications, settings, attachments and dependencies from `mockData.ts` or localStorage. It exposes local mutation functions. Several collections are written to unversioned keys while initializers read versioned `*_v3` keys; some collections have no matching persistence effect in the inspected persistence section.

It also creates synthetic IDs with `Date.now()`, writes client-generated audit records, emits success toasts immediately after local state changes, simulates latency by randomizing a number every four seconds, initializes `realTimeConnected=true`, and uses timers for simulation/feedback. These do not prove server persistence or distributed synchronization.

## 3. Detailed findings

Severity: **P0 Critical** = trust/security/core correctness blocker; **P1 High** = major SRS workflow/contract gap; **P2 Medium** = important UX/completeness/quality gap.

### F-001 — No backend API integration
- **Severity:** P0
- **Requirement mapping:** B matrix API families; FR-AUTH/RBAC/TEAM/PROJ/TASK/COMM/NOTIF/ATT/AN/AUD/PIRAE.
- **Evidence:** `AppContext.tsx` owns domain collections and mutation functions in React state; `mockData.ts` seeds records; no API client/service found in inspected source/package.
- **Observed:** create/edit/delete/resolve/assign/read actions mutate local state, not the SRS OpenAPI server.
- **Impact:** UI may report success that is not persisted, shared or server-validated.
- **Correction:** introduce typed OpenAPI-backed API boundary, transport/DTO mapping, refresh, normalized errors and query invalidation. Keep mock mode only behind an explicit demo adapter/banner.
- **Acceptance:** each mutation calls documented endpoint; schema-valid response; reload/re-login shows persisted state; 4xx/5xx never produces false success.

### F-002 — Authentication is role selection, not authentication
- **Severity:** P0
- **Requirement mapping:** FR-AUTH and OpenAPI auth operations.
- **Evidence:** `Login.tsx` pre-fills demo email/password and role selector; submit calls `loginAs`; `MockAuthContext.tsx` maps role directly to seeded user ID and stores it in localStorage.
- **Observed:** no login request, credential verification, access/refresh token, session validation or server logout revocation.
- **Impact:** visitor can select Administrator; localStorage is not identity proof.
- **Correction:** production flow must use `POST /auth/login`, `GET /auth/me`, refresh and logout endpoints. Role quick-select must be demo-only.
- **Acceptance:** invalid credentials fail; refresh/revocation work; logout invalidates session; editing localStorage cannot restore identity.

### F-003 — Client-side RBAC is treated as permission authority
- **Severity:** P0
- **Requirement mapping:** FR-RBAC and permission-sensitive API operations.
- **Evidence:** `MockAuthContext.can(action, resource?)` switches on `currentUser.globalRole`; resource parameter is ignored.
- **Observed:** no project/team membership, ownership, assignment or object-scope evaluation. UI checks can be bypassed.
- **Impact:** unauthorized resources/actions could be exposed if client checks are treated as enforcement.
- **Correction:** client permissions are display hints only; backend validates every action and resource. Handle 401/403 and clear unauthorized caches.
- **Acceptance:** role × resource × action tests, cross-project IDs, non-member access and direct URL tests are denied server-side.

### F-004 — Protected route boundary is incomplete on main
- **Severity:** P1
- **Requirement mapping:** FR-AUTH and protected navigation.
- **Evidence:** `App.tsx` nests app routes under `MainLayout` without an auth guard; mock auth can initialize from a stored/default demo user.
- **Observed:** protected routes do not require a validated session before render.
- **Correction:** add auth bootstrap and route boundary driven by server session validation; preserve intended return path.
- **Acceptance:** signed-out deep links redirect to login; signed-in deep links work; expired session does not expose cached data.

### F-005 — Local persistence keys are inconsistent/incomplete
- **Severity:** P1
- **Requirement mapping:** persistence and API-backed CRUD.
- **Evidence:** initializers read keys such as `projectflow_tasks_v3`; persistence effects write `projectflow_tasks`, `projectflow_projects`, etc. Comments, audit, notifications, settings, attachments and dependencies lack matching persistence effects in the inspected section.
- **Observed:** read/write keys differ; selected data can disappear or stale seed data return.
- **Correction:** production domain data comes from API. If demo persistence remains, use one versioned schema, migrations and defensive parsing.
- **Acceptance:** demo collections survive reload; corrupt storage recovers; production always rehydrates from API.

### F-006 — Current-user identity can diverge between providers
- **Severity:** P1
- **Requirement mapping:** FR-AUTH/RBAC, actor attribution.
- **Evidence:** `MockAuthContext` maintains its own `currentUser`; `AppContext` separately stores `currentUserId` and derives another current user; login updates them through separate calls.
- **Observed:** identity may disagree after login/logout/switching or stale storage.
- **Correction:** one authenticated-user provider hydrated from `/auth/me`; remove duplicate identity stores.
- **Acceptance:** pages, audit attribution and permissions always reference same user ID.

### F-007 — Task transitions bypass SRS transition/blocker enforcement
- **Severity:** P0
- **Requirement mapping:** FR-TASK/FR-KAN/FR-DEP and Kanban acceptance checks.
- **Evidence:** `AppContext.moveTaskStatus` directly changes status; TaskList bulk completion, Kanban drop and TaskDetailDrawer status selector call transition paths without a demonstrated shared invariant validator.
- **Observed:** alternate UI paths can set DONE without demonstrated dependency/server gate.
- **Correction:** centralize transition command; server validates transition, dependencies and permission; UI handles rejection.
- **Acceptance:** drawer, drag/drop, list and bulk completion all reject DONE when prerequisite incomplete and leave state unchanged.

### F-008 — Dependency graph validation is incomplete on main
- **Severity:** P1
- **Requirement mapping:** FR-DEP and graph constraints.
- **Evidence:** `AppContext.addDependency` checks self-dependency and duplicate pair; inspected main implementation does not demonstrate task existence, same-project or cycle validation.
- **Observed:** invalid references, cross-project edges and cycles are not prevented here.
- **Correction:** server validates graph; client pre-validates for feedback.
- **Acceptance:** reject self, duplicate, missing task, cross-project and cycle-forming edges; valid DAG persists.

### F-009 — Comment edit window is stored but not enforced
- **Severity:** P1
- **Requirement mapping:** FR-COMM and 15-minute comment rule.
- **Evidence:** `addComment` sets `canEditUntil` to now + 15 minutes; `editComment` updates any matching ID without checking author or expiry; `deleteComment` removes by ID without permission validation.
- **Observed:** metadata exists but mutation layer does not enforce ownership/time.
- **Correction:** server enforces author and 15-minute window; delete follows SRS permission; UI handles 403/409.
- **Acceptance:** own edit inside window succeeds; after expiry and other-author edit fail; unauthorized delete fails.

### F-010 — Mention UI is not a complete mention workflow
- **Severity:** P2
- **Requirement mapping:** FR-COMM-02 and FR-NOTIF.
- **Evidence:** TaskDetailDrawer inserts an @-style string derived from user name; no mention ID persistence, parsing or notification API evidenced.
- **Observed:** text insertion is not recipient resolution or notification delivery.
- **Correction:** autocomplete selects user IDs; server validates visibility and creates notification.
- **Acceptance:** selected user ID persists; plain text @name does not trigger mention; inaccessible users cannot be mentioned.

### F-011 — Attachment UI does not demonstrate file upload/storage
- **Severity:** P0
- **Requirement mapping:** FR-ATT, size/type validation and XOR constraint.
- **Evidence:** `AppContext.addAttachment` appends metadata object; no multipart client, upload progress, download service or server validation found.
- **Observed:** metadata creation is not byte upload; no evidence of 10 MB check, MIME/magic-byte validation, malware scanning, signed download or storage authorization.
- **Correction:** use approved attachment endpoints and secure backend storage; client checks are advisory only; server enforces XOR.
- **Acceptance:** valid file uploads/downloads; oversized/spoofed/disallowed files reject; unauthorized download denied; deleted object inaccessible.

### F-012 — Audit trail is mutable local state, not immutable evidence
- **Severity:** P0
- **Requirement mapping:** FR-AUD, append-only/integrity/retention.
- **Evidence:** `recordAudit` creates browser-side records using client ID/time; AuditLogViewer filters local array and exports CSV; UI says “Immutable Audit Trail” and “SOC2 & HIPAA Compliant”.
- **Observed:** client records can be fabricated/altered; no server audit query/integrity/retention evidence.
- **Impact:** compliance claims are unsupported.
- **Correction:** remove compliance certification language unless substantiated; use server `GET /audit`; client cannot create/edit/delete audit events.
- **Acceptance:** every relevant mutation yields server audit event; client cannot alter it; authorized filters/pagination/export reconcile.

### F-013 — Real-time connection/events are simulated
- **Severity:** P0
- **Requirement mapping:** FR-RT/FR-SOCK and 13 frozen events.
- **Evidence:** AppContext sets `realTimeConnected=true`, randomizes latency every four seconds and locally flashes records; no Socket.IO/WebSocket client found.
- **Observed:** connected UI can appear without connection, authorization, reconnect or cross-client event.
- **Correction:** remove/label simulation; implement authenticated Socket.IO, scoped rooms, schema validation, reconnect/resync and duplicate handling.
- **Acceptance:** two sessions receive authorized events; unauthorized rooms denied; reconnect resyncs via REST; payloads match frozen schema.

### F-014 — Notification feed is local, not a delivery system
- **Severity:** P1
- **Requirement mapping:** FR-NOTIF and event-to-notification.
- **Evidence:** NotificationCenter reads AppContext; read/read-all/clear call local functions; no notification API or socket listener found.
- **Observed:** no per-user persistence, multi-device synchronization or delivery evidence.
- **Correction:** use notification list/read endpoints and authorized real-time updates; clarify clear/archive semantics.
- **Acceptance:** notifications persist across reload/device, recipient-scoped, and read state syncs.

### F-015 — Analytics contains hard-coded history and unverified formulas
- **Severity:** P1
- **Requirement mapping:** FR-AN-01..10 and analytics contracts.
- **Evidence:** AnalyticsDashboard derives status/priority/workload from local arrays but hard-codes Sprint 23–27 velocity and “52 pts / sprint”; ProjectDetail derives workload locally.
- **Observed:** no analytics API, date range/provenance or evidence formulas match SRS.
- **Correction:** fetch analytics endpoints; display period/generatedAt/filters; remove or visibly label sample constants.
- **Acceptance:** metrics reconcile to known API fixtures; filters change results; production contains no hard-coded velocity.

### F-016 — PIRAE risk status vocabulary conflicts with SRS lifecycle
- **Severity:** P1
- **Requirement mapping:** FR-PIRAE-07/08 and Open→Resolved lifecycle.
- **Evidence:** `resolveRisk` writes `MITIGATED`; `dismissRisk` writes `DISMISSED`; dashboard filters OPEN/IN_REVIEW; types allow Open/Resolved/OPEN/IN_REVIEW/MITIGATED/DISMISSED.
- **Observed:** status drift and undocumented dismissal path.
- **Correction:** normalize exact SRS/API enums; only documented resolve action changes lifecycle; keep acknowledgement separate if needed.
- **Acceptance:** only allowed transition accepted; resolvedAt server-set; invalid status rejected; resolved risk remains queryable.

### F-017 — PIRAE autodetect/score is seeded, not demonstrated engine output
- **Severity:** P1
- **Requirement mapping:** FR-PIRAE scoring, thresholds, advisory-only.
- **Evidence:** mockData contains pre-authored risk scores/reasons/recommendations; page labels engine “Intelligence v3.0 Active” and “PIRAE Autodetect”; no risk API/scoring service found.
- **Observed:** no evidenced rule execution, provenance or freshness.
- **Correction:** label seeded risks sample data; render API score/rationale/formula version/generatedAt; recommendations remain advisory and never autonomously mutate state.
- **Acceptance:** backend fixture scores match; stale state shown; accepting recommendation alone does not mutate project/task.

### F-018 — Settings UI implies configuration authority without persistence
- **Severity:** P1
- **Requirement mapping:** PIRAE thresholds, governance settings, RBAC.
- **Evidence:** Settings calls local `updateSettings`; Profile preferences handler only shows toast; no settings API integration.
- **Observed:** no server persistence, permission checks, threshold ordering validation or engine effect.
- **Correction:** separate user preferences from system config; permission-gate server changes; validate bounds/order; unsupported settings remain labelled placeholders.
- **Acceptance:** unauthorized changes denied; valid settings persist and affect backend; invalid values rejected.

### F-019 — Project/task views do not demonstrate resource-scoped retrieval
- **Severity:** P0
- **Requirement mapping:** FR-RBAC resource scope and list/get contracts.
- **Evidence:** ProjectsList, TaskList and Dashboard read global arrays from context; client `can(resource)` ignores resource.
- **Observed:** role changes affect controls but not necessarily data visibility.
- **Correction:** fetch only authorized resources; server enforces direct object scope; clear caches on identity changes.
- **Acceptance:** non-member cannot retrieve/render details via manipulated IDs; lists contain only authorized records.

### F-020 — User provisioning/reset is simulated
- **Severity:** P1
- **Requirement mapping:** account provisioning/status, FR-RBAC and user API.
- **Evidence:** UserManagement uses local add/update/toggle functions; temporary password state is prefilled; no server provisioning/status/reset calls.
- **Observed:** email uniqueness, role change, status and reset delivery are not verified.
- **Correction:** use admin endpoints; no prefilled temporary password; use one-time expiring reset invitation; show success only after server.
- **Acceptance:** duplicate email and unauthorized provisioning fail; deactivation/session policy works; reset token expires and is single-use.

### F-021 — Profile password change is a success simulation
- **Severity:** P1
- **Requirement mapping:** FR-AUTH password change and session revocation.
- **Evidence:** Profile performs local matching/min-length checks, waits 500ms and reports “Password Changed”; no `PATCH /auth/password`.
- **Observed:** current password is not verified and sessions are not revoked.
- **Correction:** call password endpoint; use SRS policy; handle server rejection/revocation; no success before response.
- **Acceptance:** wrong current password fails; valid change works; old refresh sessions revoked.

### F-022 — Domain types contain compatibility unions/duplicate representations
- **Severity:** P1
- **Requirement mapping:** domain entities, enum/data constraints, DTO mapping.
- **Evidence:** types allow mixed project/risk status vocabularies; Task has both `assigneeIds` and `assigneeId`, and `estimatedEffort`/ `estimatedHours`; Comment has `body` and `content`.
- **Observed:** duplicate representations and permissive enums can leak legacy values to API.
- **Correction:** strict OpenAPI DTOs and canonical domain types; isolate mock mapping in demo adapter.
- **Acceptance:** exhaustive enum typing/schema validation; legacy values cannot be sent to server.

### F-023 — Screen breadth exceeds verified workflow completeness
- **Severity:** P2
- **Requirement mapping:** FR-TEAM/PROJ/TASK/KAN and atomic acceptance checks.
- **Evidence:** list/detail pages, tabs, drawers and modals exist; actions generally call local context methods.
- **Observed:** screen presence does not demonstrate validation, pagination, concurrency, server error or resource-scope behaviour.
- **Correction:** convert each workflow to success/validation/forbidden/not-found/conflict/network scenarios and complete vertical slices.
- **Acceptance:** every supported workflow passes those scenarios and reload reconciliation.

### F-024 — Accessibility semantics/keyboard behaviour not systematically verified
- **Severity:** P2
- **Requirement mapping:** accessibility and keyboard requirements.
- **Evidence:** native buttons/inputs and some aria-labels exist; inspected overlays do not show consistent evidence of dialog roles, focus trap/restore, Escape handling, live-region validation or keyboard Kanban alternative.
- **Observed:** conformance is not demonstrated.
- **Correction:** shared accessible Dialog/Drawer/FormField primitives; focus management, live regions, visible focus, keyboard alternative to drag/drop; run WCAG checks.
- **Acceptance:** keyboard-only user completes login, task create, Kanban move, comment and risk resolution; screen reader announces validation/async results.

### F-025 — Responsive intent exists but all screens are not verified
- **Severity:** P2
- **Requirement mapping:** responsive UI constraints.
- **Evidence:** MainLayout has mobile menu/tablet collapse; pages use Tailwind breakpoints.
- **Observed:** no viewport suite for tables, Kanban, charts, modals and drawers.
- **Correction:** define breakpoints; test phone/tablet/desktop; provide intentional overflow/stack patterns.
- **Acceptance:** no page overflow and all actions reachable at supported widths.

### F-026 — Error/loading/empty states are primarily simulations
- **Severity:** P2
- **Requirement mapping:** error handling and resilience.
- **Evidence:** skeletons, EmptyState, ToastContainer and error pages exist; MainLayout error screen uses simulated error state; AppContext has simulated loading/error controls.
- **Observed:** no centralized API error mapper or evidenced 401/403/404/409/422/429/5xx handling.
- **Correction:** typed error normalization; map field validation/conflict/permission/rate limit/service failure; preserve form state; retry only safe operations.
- **Acceptance:** documented HTTP errors render correct state and failed mutations leave data unchanged.

### F-027 — Production deployment/observability not evidenced
- **Severity:** P1
- **Requirement mapping:** deployment, TLS, health/monitoring, backups and operations.
- **Evidence:** package scripts are Vite dev/build/preview; inspected inventory shows no deployment manifests, CI workflow, container, reverse proxy or monitoring config.
- **Observed:** API hosting, TLS, secrets, health, metrics, backups/restore not evidenced in this frontend repo.
- **Correction:** coordinate separate backend/DevOps deliverable; frontend consumes environment-specific API origin without embedded secrets.
- **Acceptance:** reproducible CI build, safe runtime config, TLS/API origin and release smoke tests documented.

### F-028 — Seed data can be mistaken for production records
- **Severity:** P2
- **Requirement mapping:** demo UX, auth and data integrity.
- **Evidence:** Login exposes named sample roles/default credentials; mockData seeds users, teams, projects, tasks, risks and audit records.
- **Observed:** live vs seed data not consistently distinguished.
- **Correction:** persistent “Demo data — not connected” indicator; prevent demo mode in production.
- **Acceptance:** production cannot fall back to seeded users/data; demo mode is visible and isolated.

## 4. Positive foundation to preserve

1. Broad route/screen coverage for major modules.
2. Reusable badges, empty states, skeletons, toast container, confirm modal and command palette.
3. Task detail drawer with detail/comments/activity tabs.
4. Project detail composition with board/list/members/risks/analytics/audit tabs.
5. Search/filter/sort patterns across projects, tasks, users, notifications and audit.
6. React Hook Form and Zod dependencies available for contract-aligned forms.
7. Responsive Tailwind layout and collapsible sidebar.
8. Seed data useful as fixtures when isolated from production and labelled.

## 5. Atomic traceability disposition

The B matrix remains the controlling acceptance checklist. This report maps evidence to requirement families; it does not mark backend-only requirements passed because a UI control exists.

| Requirement family | Frontend evidence | Disposition |
|---|---|---|
| FR-AUTH | Login/profile/admin screens; mock identity | Fail for real auth; demo UI partial |
| FR-RBAC | Role-aware buttons and local can() | Fail as enforcement; presentation partial |
| FR-TEAM | Team list/detail/member UI | Partial; local only |
| FR-PROJ | Project list/detail/create/member UI | Partial; local only |
| FR-TASK | Task list/drawer/create/my tasks | Partial; invariant gaps |
| FR-KAN / FR-DEP | Kanban and dependency UI | Partial/Fail for gate/integrity |
| FR-RT / FR-SOCK | Live indicator/latency/flash simulation | Not implemented |
| FR-COMM | Comments and mention-like affordance | Partial; server rules absent |
| FR-NOTIF | Notification center/local read state | Partial; delivery absent |
| FR-ATT | Attachment metadata UI | Not implemented for secure upload |
| FR-AN | Charts | Partial; hard-coded history |
| FR-AUD | Audit viewer/CSV | Not implemented for immutable audit |
| FR-PIRAE | Risk dashboard/modal/seed data | Partial; lifecycle/provenance mismatch |
| API contracts | No API service found | Not implemented |
| Domain constraints | Types and some client checks | Partial; enum drift |
| NFR/security | Responsive UI/form affordances | Not verified |
| Accessibility | Some semantic controls | Not verified |
| Deployment | Vite scripts | Not evidenced in frontend repo |

Update individual B rows only when concrete source/test evidence exists. Endpoint contracts, server invariants, retention and real-time guarantees must not pass on UI presence alone.

## 6. Prioritized implementation phases

### Phase 0 — Trust boundary and demo separation (P0)
- Separate demo and production modes; visibly label seeded data.
- Replace role selection with real auth/session bootstrap in production.
- Add protected route boundary and one canonical authenticated user.
- Treat client RBAC as display-only; implement server permission handling.
- Remove unsupported “connected”, “immutable”, “active engine” and compliance claims.
- Do not show success before server confirmation.

**Exit:** production routes cannot be entered as a fabricated user; demo controls cannot masquerade as security.

### Phase 1 — API contract and domain normalization (P0/P1)
- Typed API client based on OpenAPI.
- Normalize DTOs/enums/field names to SRS; isolate legacy demo mapping.
- Token refresh/logout and normalized error model.
- Replace local domain mutations with API queries/mutations.
- Server pagination/filter/sort and scoped resource retrieval.
- Identity-aware cache clearing.

**Exit:** supported CRUD persists through documented API; refresh/scope tests pass.

### Phase 2 — Core collaboration correctness (P0/P1)
- Central task transition command and server gate.
- Dependency API and validation feedback.
- Comment ownership/15-minute policy.
- Mention resolution and notification creation.
- Secure attachment upload/download/delete.
- Success only after API confirmation.

**Exit:** every UI path obeys the same server-owned invariants.

### Phase 3 — Real-time, notifications and audit (P0/P1)
- Authenticated Socket.IO and all 13 frozen events.
- Reconnect/resync and duplicate-event handling.
- Server-backed notifications/read state.
- Immutable server audit query and authorized export.

**Exit:** multi-session event tests pass; audit is server-authored; notification state survives reload/device changes.

### Phase 4 — Analytics and PIRAE (P1)
- API-backed analytics and remove hard-coded production metrics.
- Normalize risk lifecycle.
- Display score rationale, provenance, formula version and freshness.
- Keep PIRAE advisory-only.
- Separate system policies from personal preferences.

**Exit:** analytics reconcile to API fixtures; PIRAE outputs are explainable and do not autonomously mutate state.

### Phase 5 — Accessibility, resilience and release readiness (P1/P2)
- Accessible modal/drawer primitives, focus management and keyboard Kanban alternative.
- Responsive testing for data-dense screens.
- API error mapping and offline/retry behaviour.
- Automated unit/component/e2e/contract/accessibility tests.
- Coordinate CI/CD, TLS and operations with backend/DevOps.

**Exit:** role, viewport, network/error and keyboard/screen-reader test matrix passes.

## 7. Recommended verification suite

1. Auth: invalid login, bootstrap, expired access token, refresh reuse, logout, password change/revocation.
2. Authorization: role × action × resource, direct URL, cross-project access, disabled users.
3. CRUD: valid/invalid/duplicate/missing/concurrent team/project/task mutations.
4. Task rules: every transition path; DONE with incomplete dependencies; cycle/cross-project edge.
5. Comments: author, 15-minute boundary, mention recipient and notification.
6. Attachments: size, MIME spoof, magic bytes, unauthorized download, delete.
7. Real-time: all 13 events, room isolation, reconnect, duplicate/out-of-order.
8. Notifications: recipient isolation, read/read-all, pagination, reconnect and persistence.
9. Analytics: fixture reconciliation, time range, empty result, workload and overdue boundary.
10. Audit: server-only creation, immutability, correlation ID, filters, retention and export.
11. PIRAE: deterministic score fixture, threshold boundaries, stale data, resolve lifecycle, advisory-only.
12. Accessibility/responsiveness: keyboard-only, focus restore, dialog semantics, contrast, phone/tablet/desktop.
13. Resilience: offline, timeout, 401, 403, 404, 409, 422, 429, 500, 503.
14. Build: TypeScript check, production build, component tests, browser e2e and dependency/security scan.

## 8. Limitations and conclusion

- Static source audit of `main`, not a running-system penetration test or full browser test.
- No backend repository/service included; backend-only requirements are “not evidenced/not implemented in this frontend”, not proof a separate backend does not exist.
- Build/lint/test commands were not run; runtime status remains unverified.
- SRS 3.0 and the reconciled OpenAPI contract remain authoritative over UI labels, compatibility types and mock data.
- No application source files were changed during this audit.

**Conclusion:** retain the current UI/component foundation, but treat this repository as a high-fidelity interactive prototype/demo, not an SRS-compliant production frontend. Convert it in controlled phases from mock state to contract-backed, server-authoritative workflows.
