# Phase 0 — Repository Audit & Baseline Preservation

**Repository:** `Dev-MuhammadAshir/V2-Frontend-project-management-application`  
**Audit branch:** `audit/phase-0-current-repository-baseline`  
**Audited source baseline:** `main` at commit `69ecb3f88ca43b7ae5df46bc8f5d04101f4d5e3d`  
**Application source baseline:** merge commit `1671d2c6d097f657df8fa5059360939a515ef4a0`  
**Audit date:** 2026-10-31  
**Audit type:** static repository, route, source, requirements and contract inspection  
**Application source changes in this Phase 0 branch:** none

> This document records what the repository demonstrates. A local UI interaction is not evidence of API persistence, server authorization, cross-client synchronization, security, or production readiness. No build, test, browser, accessibility, load, or penetration test is claimed as passed.

## 1. Executive assessment

ProjectFlow is a broad, interactive **frontend prototype** for a single-organization, team-centric project-management platform. It includes dashboard, project and team management, task list/Kanban, collaboration UI, notifications, analytics, audit viewer, PIRAE risk dashboard, profile, settings and user administration.

The current repository does **not** demonstrate an end-to-end SRS v3.0 implementation. Business records originate from seeded mock data and browser `localStorage`; mutations are performed in React context state; authentication is a selectable demo role; permissions are a client-side helper; realtime status is simulated; and no connected REST API, Socket.IO client, or backend service is evidenced in the frontend source tree.

The most important Phase 0 outcome is to distinguish:
- **UI present:** the screen/control exists.
- **Demo interaction:** the browser can perform a local state change.
- **Contract-ready:** a documented SRS/OpenAPI operation or rule can be mapped.
- **System implemented:** the server/database/realtime behavior exists and is verified.

Most current product capabilities fall into the first two categories. The existing visual and workflow foundation is worth preserving; it should be matured incrementally rather than replaced.

### Overall disposition

| Area | Current evidence | Phase 0 disposition |
|---|---|---|
| Route and screen coverage | 17 page components plus shared error screens; routes in `src/App.tsx` | Broad UI coverage |
| Core CRUD | Project/task/team/user/risk/settings mutations in `AppContext` | Demo/local only |
| Authentication | `MockAuthContext`, role-to-seed-user mapping | Demo only; not real authentication |
| Protected routes | `RequireAuth` wraps workspace routes | Partial demo guard; no server session validation |
| Authorization | `can(action, resource?)` role switch | UI hint only; resource argument ignored |
| Persistence | Versioned `localStorage` reads/writes for major collections | Demo persistence; not system-of-record |
| Task dependencies | Client-side existence/project/duplicate/cycle checks; blocked-DONE check in shared status function | Improved, but untested and not server-enforced |
| Comments/mentions | Local comments and @-text interaction | Partial; author/time enforcement and recipient delivery absent |
| Attachments | Attachment metadata mutation | No file-byte upload/storage evidence |
| Realtime | Always-connected flag, random latency and local flashes | Simulated |
| Notifications | Local collection and read/clear mutations | Local only; no delivery/replay evidence |
| Analytics | Some calculations from local collections; fixed sprint history | Partial/demo-derived |
| Audit | Client-generated local records and CSV export | Not immutable/server-authoritative |
| PIRAE | Seeded risks, local filtering/resolution | Partial; lifecycle/engine mismatch |
| Accessibility/responsive | Semantic controls and responsive classes exist | Not systematically verified |
| Tests/build | No test script/test runner in package manifest | Not run / not evidenced |
| Backend/operations | No backend service or deployment stack in this frontend tree | Not evidenced here |

## 2. Repository and document inventory

### Root

- `.env.example`, `.gitignore`, `index.html`, `metadata.json`
- `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`
- `src/`, `public/`, `docs/`

No root README, test directory, CI workflow, Docker Compose file, Nginx configuration, Prisma schema/migrations, backend application entry point, or deployment manifest was found in the inspected root inventory.

### Source structure

- `src/App.tsx`, `src/main.tsx`, `src/index.css`
- `src/context/AppContext.tsx`, `src/context/MockAuthContext.tsx`
- `src/data/mockData.ts`
- `src/types/index.ts`
- `src/layouts/MainLayout.tsx`
- `src/pages/` — 17 page modules
- `src/components/common/` — Badge, CommandPalette, ConfirmModal, EmptyState, SkeletonLoader, ToastContainer
- `src/components/layout/` — Sidebar, Topbar
- `src/components/projects/` — CreateProjectModal
- `src/components/risks/` — RiskDetailModal
- `src/components/tasks/` — CreateTaskModal, TaskDetailDrawer

### Requirements and contract documents

The repository includes:
- `public/assets/aistudio/SRS_3.0_CONSOLIDATED_BASELINE_e782668d.md` — authoritative SRS v3.0 baseline.
- `public/assets/aistudio/OpenApi-Specification.txt` — OpenAPI 3.1.0 document; its info version says 2.1.0. The SRS v3.0 remains authoritative where artifacts conflict.
- `docs/requirements/A_MASTER_REQUIREMENTS_CATALOGUE_SRS_V3.md`
- `docs/requirements/B_ATOMIC_TRACEABILITY_MATRIX_SRS_V3.md`
- `docs/requirements/C_COMPREHENSIVE_FRONTEND_AUDIT_SRS_V3.md`
- `docs/requirements/C_TO_B_FINAL_ATOMIC_EVIDENCE_RECONCILIATION_SRS_V3.md`
- `docs/requirements/SRS_V3_ATOMIC_TRACEABILITY_MATRIX.md`
- `docs/requirements/SRS_V3_FRONTEND_AUDIT_REPORT.md`
- Additional DOCX migration/seed and Sprint 1–14 artifacts exist under `docs/requirements/` and `public/assets/aistudio/`. Their paths are inventoried, but their binary contents were not independently re-extracted in this pass; the findings below rely on the authoritative SRS, OpenAPI text, Markdown catalogue/matrix/reports and inspected source.

### Traceability integrity observation

The B matrix contains **423 unique atomic IDs**. The C→B reconciliation contains **413 unique rows** and omits ten IDs present in B: `G-03`, `G-04`, `G-05`, `G-06`, `G-07`, `G-09`, `G-10`, `G-11`, `G-14`, and `G-20`. The reconciliation summary therefore needs an explicit explanation or correction before it can claim complete 423-row reconciliation. Do not silently treat this arithmetic discrepancy as full traceability.

## 3. Application behavior and trust boundaries

### Entry and application composition

`src/main.tsx` mounts `MockAuthProvider` around `App`. `App.tsx` mounts `AppProvider` and `BrowserRouter`, then declares public login/error routes and authenticated workspace routes. The workspace routes are now wrapped by `RequireAuth`, which checks whether `MockAuthContext.currentUser` is non-null.

This guard is a useful demo-level improvement, but it is **not** a server-validated session boundary. `MockAuthContext` resolves a saved ID against `initialUsers`; `loginAs(role)` chooses a seeded user by role and does not validate credentials or issue/refresh/revoke tokens.

### State and persistence

`AppContext` owns users, teams, memberships, projects, tasks, comments, risks, audit logs, notifications, settings, attachments and task dependencies. It initializes collections from `mockData.ts` or `localStorage`, and exposes local mutation functions. The latest merged code corrected the previously documented mismatch between versioned read keys and write keys and added persistence effects for comments, audit, notifications, settings, attachments and dependencies.

Remaining limitations:
- `localStorage` is still the business-data store in this prototype, not PostgreSQL/API.
- Stored JSON is parsed without an evident Zod/schema validation, version migration, corruption recovery or quota/error strategy.
- UI success toasts are emitted after local state changes, not after a server response.
- Activity feed state is initialized from fixtures and is not shown as persisted alongside the other collections.
- Auth identity and AppContext identity remain separately owned (see F-01).

### Realtime and simulated behavior

`AppContext` initializes `realTimeConnected` to `true`, starts latency at a small fixed value, then changes latency using `Math.random()` on a timer. Local flash effects and timers simulate event feedback. `Topbar` presents an always-green “Connected” status. No Socket.IO/WebSocket client or server integration was found in the inspected frontend inventory.

### Business logic

Task dependency validation has improved since the earlier audit snapshot: `addDependency` checks self-link, missing task, cross-project edge, cycle and duplicate; `moveTaskStatus` checks unfinished incoming blockers before moving a task to `DONE`. These are useful client-side guards, but remain untested and can never replace backend enforcement. Other mutations (comments, attachments, risk lifecycle, audit, settings) still operate locally.

## 4. Requirements coverage — what exists and what does not

| Requirement family | Existing UI/client behavior | Missing or unproven SRS behavior |
|---|---|---|
| AUTH | Login screen, demo role selection, profile, user admin, signed-out demo route guard | Password verification, JWT, refresh lifecycle, lockout, server logout revocation, admin provisioning API |
| RBAC | Role-specific UI checks and role switcher | Server authorization; team/project membership and ownership scopes; permission matrix test evidence |
| TEAM | Team list/detail, create and membership controls | API persistence, membership constraints, scoped authorization, server audit |
| PROJ | Project list/detail/create, member and project tabs | API persistence, complete date/scope contract, resource-scoped retrieval, server-side constraints |
| TASK | Task list, My Tasks, task drawer, create/edit/delete, subtasks/comments | API-backed CRUD, full transition validation, authoritative history, concurrency and error handling |
| KAN/DEP | Kanban columns, drag/drop, dependency UI and client-side DAG checks | Socket synchronization, server graph validation, consistent enforcement across all write paths |
| COMM | Comment display/add/edit UI and @-text affordance | Server author + 15-minute edit enforcement, mention IDs/recipient resolution, event and notification delivery |
| ATT | Attachment metadata UI/actions | Actual byte upload/download, allowlist/size/magic-byte checks, malware/storage controls, signed URLs, ownership XOR |
| NOTIF | Local feed, type/unread filters, mark-read/all-read/clear | Persistent per-user delivery, realtime, offline replay and cross-device read state |
| AN | Status/priority/workload charts calculated from local data | Contract-backed metrics, authoritative history, formula provenance; sprint velocity remains hard-coded |
| AUD | Local audit list, search/severity filter, detail and CSV export | Server-authored append-only records, correlation IDs, retention and integrity verification |
| PIRAE | Risk list/heatmap/filter, local resolve action | Async queue + cron, SRS scoring formulas, canonical lifecycle, freshness/provenance and advisory-only server behavior |
| SETTINGS | Threshold/capacity/retention/email controls | Server authorization, validation, persistence and demonstrated engine effect |
| NFR/OPS | Responsive Tailwind intent, error/skeleton/empty components | Verified WCAG, performance, availability, monitoring, backups, TLS, deployment and restore evidence |

## 5. Current source-level findings

Severity: **P0** = security/trust/core invariant; **P1** = major workflow or data correctness; **P2** = completeness/quality. “Frontend gap” does not assert that a separate backend does not exist; it means this repository does not evidence it.

| ID | Severity | Finding and evidence | User/business impact |
|---|---|---|---|
| F-01 | P1 | Split identity: `MockAuthContext` owns `currentUser`; `AppContext` independently initializes `currentUserId` from `projectflow_current_user_id`. Login writes the local key through an effect but does not directly synchronize the already-mounted AppContext state. | UI role/permissions and actor attribution can disagree after login or stale storage; audit attribution may use another user. |
| F-02 | P0 | Authentication remains `loginAs(role)` over seeded `initialUsers`; role switching is exposed in Topbar; no credential/session API. | A user can select a privileged demo role; must never be presented as real account security. |
| F-03 | P0 | `can(action, resource?)` is a hard-coded role switch; resource argument is ignored. | Does not enforce project/team membership, assignment, ownership or object scope. UI gating is bypassable. |
| F-04 | P1 | Protected routes now use `RequireAuth`, but the check is only a non-null mock user; no auth bootstrap/validated session/expiry state. | Demo deep-link guard is improved, but production session protection remains absent. |
| F-05 | P1 | Versioned localStorage read/write mismatch and missing collection persistence were fixed in merge `1671d2c`; however raw JSON parse, migrations, validation, recovery and server source-of-truth are absent. | Prototype data can still be malformed/stale and browser storage is not durable shared system data. |
| F-06 | P1 | `moveTaskStatus` now blocks DONE when an incoming blocker is unfinished; `addDependency` now checks self, existence, same project, cycles and duplicates. | Client-side invariants are improved but have no tests and are not server enforced; alternate mutation paths require contract tests. |
| F-07 | P1 | `editComment` and `deleteComment` mutate any matching local comment without enforcing author or the SRS 15-minute rule in the mutation function. UI affordance checks alone are not authority. | Unauthorized or late comment changes may be accepted in client state. |
| F-08 | P0 | Audit entries are client-generated local records; CSV export reads local array. UI labels the page “Immutable Audit Trail” and “SOC2 & HIPAA Compliant” without evidence of cryptographic/server immutability or certification. | Reviewers/users can be misled about compliance and integrity. |
| F-09 | P0 | Realtime connected status and latency are synthetic; no Socket.IO client/event transport found. | “Connected” can falsely imply live collaboration and NFR latency compliance. |
| F-10 | P1 | Analytics uses local seeded records and hard-coded Sprint 23–27 velocity values plus “52 pts / sprint”. | Metrics may be mistaken for historical/authoritative delivery data. |
| F-11 | P1 | PIRAE page filters `OPEN`/`IN_REVIEW` and uses types/fixtures with multiple status vocabularies; UI says “Intelligence v3.0 Active”; resolution is local. | Risk state and score provenance can diverge from SRS Open/Resolved lifecycle and backend rules. |
| F-12 | P1 | User provisioning and password reset are local UI operations; temporary password is prefilled; Profile password change uses a 500ms timeout and success toast without API/current-password verification. | Users may believe account credentials or reset emails changed when no identity service was contacted. |
| F-13 | P1 | Attachment add/remove stores metadata only; no multipart upload, byte validation, secure storage or download flow found. | “Uploaded” feedback may imply a file was safely stored when only a record was added. |
| F-14 | P1 | Notification feed/read/clear operations are local context mutations. | No proof of recipient delivery, persistence across devices or offline replay. |
| F-15 | P1 | Domain types include legacy/compatibility aliases and duplicate fields (e.g. role/name variants, assignee fields, comment body/content, risk/project status vocabulary). | Mapping ambiguity can cause contract drift and inconsistent calculations. |
| F-16 | P2 | Activity feed, toast and simulated loading/error/latency behavior are demo-oriented; some screens use simulated states. | UI states do not prove API/network resilience. |
| F-17 | P2 | No automated test runner/script or accessibility tooling is declared in package manifest; no runtime/browser test evidence captured. | Regression safety and WCAG conformance remain unknown. |
| F-18 | P1 | No API client/service, Socket.IO dependency, backend service, Prisma schema, CI/deployment manifests or observability config are evidenced in this frontend repository. | End-to-end and production requirements require coordinated backend/DevOps implementation. |

### Findings from the previous audit snapshot that are now superseded

The existing `C_COMPREHENSIVE_FRONTEND_AUDIT_SRS_V3.md` records an earlier source tree (`757f72e...`). The merge into current main (`1671d2c...`) introduced targeted corrections:
1. `RequireAuth` now wraps workspace routes.
2. Mock auth now initializes signed out unless a known demo user ID is stored; logout clears `projectflow_auth_user_id`.
3. Topbar sign-out now calls `logout()`.
4. Main collections use matching `*_v3` read/write keys, with additional persistence effects for comments, audit, notifications, settings, attachments and dependencies.
5. Client task dependency existence/same-project/cycle/duplicate checks and blocked-DONE check were added.

Therefore the earlier report's F-004 and F-005 are no longer accurate as written, and F-007/F-008 have been partially addressed. This Phase 0 report supersedes those specific status statements for the current main baseline. It does **not** claim that these client-side corrections satisfy backend or test acceptance.

## 6. Components and behavior to preserve

Preserve the existing UI and interaction baseline before any structural extraction:

- Route/page composition: `App.tsx`, `MainLayout`, Sidebar and Topbar.
- Core page modules: Dashboard, ProjectsList, ProjectDetail, TeamsList, TeamDetail, TaskList, MyTasks, KanbanBoard, UserManagement, Profile, NotificationCenter, AnalyticsDashboard, AuditLogViewer, PIRAERiskDashboard, Settings, Login and ErrorPages.
- Shared UI: Badge, CommandPalette, ConfirmModal, EmptyState, SkeletonLoader, ToastContainer.
- Domain overlays: CreateProjectModal, CreateTaskModal, TaskDetailDrawer, RiskDetailModal.
- Existing mock fixtures in `mockData.ts` as **demo/test fixtures only**, after they are separated from production providers.
- Existing dependency checks and task transition feedback; retain and add tests rather than replacing them without reason.
- Current responsive Tailwind visual language and working navigation/filter/tab/drawer patterns.

Preservation means retain user-visible workflows and behavior while moving data access and rules behind interfaces. It does not mean keeping `AppContext` as the permanent home of all business logic or retaining misleading production-facing labels.

## 7. Safest refactoring and implementation order

Phase 0 ends with this audit and baseline record. Do not begin a broad rewrite as part of this phase.

1. **Freeze baseline:** preserve current `main` commit; use a separate audit/implementation branch; capture build and workflow screenshots when an executable environment is available.
2. **Truthfulness and identity boundary:** visibly distinguish demo mode; unify authenticated identity; remove false connected/compliance/engine claims; keep role switcher demo-only.
3. **Contract/requirements normalization:** resolve SRS/OpenAPI version/field mismatches; close B/C atomic traceability gap; define strict DTO schemas and canonical enums without destructive renames.
4. **Architecture seam:** introduce composition-root-selected providers/adapters (demo vs API), repositories and typed service boundaries; keep pages consuming application-level interfaces.
5. **Domain invariants:** extract task/dependency/comment/risk rules into deterministic domain functions and test all entry paths.
6. **API vertical slices:** auth and identity first, then users/RBAC, teams/projects, tasks/Kanban/dependencies, comments/mentions, attachments, notifications, audit, analytics and PIRAE according to SRS phase apportioning.
7. **Realtime:** only after event schemas, auth and API reconciliation are defined; implement Socket.IO lifecycle, room authorization, reconnect and missed-event recovery.
8. **Accessibility/resilience/release:** keyboard and screen reader, responsive tests, API error states, security, performance, monitoring, backup/restore and deployment gates.

Do not invent endpoints/events or mark backend requirements as frontend-complete. Use the checked-in OpenAPI and SRS as contract authority, and record unresolved conflicts before implementation.

## 8. Phase 0 exit status

| Deliverable | Status |
|---|---|
| Repository inventory | Completed by static GitHub repository inspection |
| Route/screen inventory | Completed; see `PHASE_0_SCREEN_FEATURE_INVENTORY.md` |
| Feature simulated/partial assessment | Completed at source-evidence level |
| Requirements baseline identification | Completed; SRS v3.0 identified as authority |
| Atomic traceability gap | Identified; 10 IDs discrepancy documented |
| Architecture/debt/bug register | Completed; see `PHASE_0_FINDINGS_AND_BASELINE.md` |
| Preserve list and safe order | Completed |
| Runtime/build/typecheck | Not run in this environment |
| Browser workflow verification | Not run |
| Automated unit/integration/E2E | Not run; no test runner declared |
| Accessibility/security/performance tests | Not run |

**Phase 0 result:** static audit and documentation baseline are complete. Runtime verification is explicitly outstanding. Phase 1 may start only after this audit is reviewed and a runnable local/CI environment is used to capture the missing baseline checks. No application source code was changed in this Phase 0 branch.
