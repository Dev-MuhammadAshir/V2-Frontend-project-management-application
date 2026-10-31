# Phase 0 — Findings, Technical Debt and Verification Baseline

**Baseline commit:** `69ecb3f88ca43b7ae5df46bc8f5d04101f4d5e3d`  
**Audit branch:** `audit/phase-0-current-repository-baseline`

## 1. Prioritized findings register

| ID | Priority | Area | Finding | Evidence location | Recommended owner/phase |
|---|---|---|---|---|---|
| F-01 | P1 | Identity | Auth and application contexts maintain separate current-user state; initial login can leave AppContext on a stale/default user | `MockAuthContext.tsx`, `AppContext.tsx`, `Login.tsx`, `Topbar.tsx` | Auth/domain foundation |
| F-02 | P0 | Authentication | Demo role selection is not credential authentication or a session lifecycle | `Login.tsx`, `MockAuthContext.tsx` | Auth integration |
| F-03 | P0 | Authorization | Client permission switch ignores resource argument; backend authority is absent from this repository | `MockAuthContext.tsx`, pages/sidebar | RBAC/API integration |
| F-04 | P1 | Route guard | `RequireAuth` exists, but checks only mock user presence, not validated session/expiry | `App.tsx`, `MockAuthContext.tsx` | Auth foundation |
| F-05 | P1 | Persistence | Read/write key mismatch and missing collection effects corrected; still raw localStorage with no schema migration/recovery and no shared server persistence | `AppContext.tsx` | Persistence adapter/API |
| F-06 | P1 | Task invariants | Client blocker gate and dependency graph checks added; no test evidence and no backend enforcement | `AppContext.tsx`, `TaskList.tsx`, `KanbanBoard.tsx` | Domain tests/API |
| F-07 | P1 | Comments | Mutation functions do not enforce comment author or 15-minute edit limit | `AppContext.tsx`, `TaskDetailDrawer.tsx` | Domain/API |
| F-08 | P0 | Audit | Browser-created audit records cannot prove append-only immutability; UI makes unsupported compliance claims | `AppContext.tsx`, `AuditLogViewer.tsx` | Audit integration/content correction |
| F-09 | P0 | Realtime | Always-green connected state and random latency are simulated | `AppContext.tsx`, `Topbar.tsx` | Realtime adapter/integration |
| F-10 | P1 | Analytics | Historical sprint velocity values and headline velocity are constants; other metrics use local data | `AnalyticsDashboard.tsx` | Analytics |
| F-11 | P1 | PIRAE | Seeded risks and non-canonical status vocabulary; no evidence of async queue/cron scoring | `PIRAERiskDashboard.tsx`, `AppContext.tsx`, `types/index.ts`, `mockData.ts` | PIRAE contract/domain |
| F-12 | P1 | User admin/profile | Provisioning/reset local; password change is simulated by timer and toast | `UserManagement.tsx`, `Profile.tsx` | Auth/user API |
| F-13 | P1 | Attachments | Metadata-only add/remove; no secure byte upload/download flow | `AppContext.tsx`, `TaskDetailDrawer.tsx` | Attachment integration |
| F-14 | P1 | Notifications | Local collection and read/clear operations only | `NotificationCenter.tsx`, `AppContext.tsx` | Notification API/realtime |
| F-15 | P1 | Domain model | Legacy enum unions and duplicate representations can leak across feature logic | `types/index.ts` | DTO/domain normalization |
| F-16 | P2 | UI feedback | Simulated loading/error/live flash and activity timestamps are not network resilience evidence | `AppContext.tsx`, `MainLayout.tsx`, pages | API error/state layer |
| F-17 | P2 | Quality | No test runner/script declared; no build/typecheck/browser/a11y results captured | `package.json` | CI/test foundation |
| F-18 | P1 | Backend/ops | No API/service, Socket.IO client, backend entrypoint, Prisma schema, Docker/Nginx/CI/observability files evidenced | Root/source inventory | Backend/DevOps dependency |

## 2. Technical debt themes

1. **God context:** `AppContext` contains domain records, persistence, mutation rules, audit/activity generation, toast lifecycle, keyboard state and simulated realtime.
2. **Identity duplication:** `MockAuthContext.currentUser` and `AppContext.currentUserId/currentUser` can diverge.
3. **Infrastructure in UI state:** components call context mutation methods whose implementation is local state rather than a replaceable repository/provider.
4. **Weak persistence boundary:** raw `localStorage` access and JSON parsing are embedded in provider initialization/effects.
5. **Contract drift:** SRS enums/fields differ from compatibility unions/duplicate fields in `types/index.ts`.
6. **Trustworthy-looking demo labels:** “Connected”, “Immutable Audit Trail”, “SOC2 & HIPAA Compliant” and “Intelligence v3.0 Active” are not supported by connected service evidence.
7. **Unverified quality:** no repeatable automated test baseline or CI evidence exists in the inspected package.

## 3. Existing foundation to retain

- React 19 + TypeScript + Vite application shell and React Router routes.
- Tailwind visual system, responsive layout intent, Sidebar/Topbar.
- All existing page-level workflows and modals/drawers.
- Shared Badge, CommandPalette, ConfirmModal, EmptyState, SkeletonLoader and ToastContainer.
- Seed data as deterministic demo fixtures.
- Recent client-side dependency graph and blocker checks as a starting point for domain tests.

## 4. Safest change sequence

| Order | Workstream | Exit condition |
|---|---|---|
| 0 | Freeze baseline and complete this audit | Commit recorded; no app source changed; limitations explicit |
| 1 | Canonical identity + honest demo/production separation | One identity source; demo switch hidden/disabled in production; truthful connection state |
| 2 | SRS/OpenAPI contract normalization | Strict DTO schemas, canonical enums, explicit mapping; B/C traceability discrepancy resolved |
| 3 | Architecture seams | Composition root chooses demo/API providers; UI depends on application interfaces |
| 4 | Domain correctness | Task/dependency/comment/risk rules extracted and unit-tested |
| 5 | API vertical slices | Auth/RBAC → teams/projects → tasks/Kanban → comments/attachments → notifications → audit/analytics/PIRAE |
| 6 | Realtime integration | Frozen event contracts, auth/room scope, reconnect/replay and multi-client tests |
| 7 | Quality/release hardening | Unit/integration/E2E/contract/a11y/security/performance and operational gates |

## 5. Package and baseline verification

Observed `package.json` scripts:
- `dev`: Vite dev server on port 3000
- `build`: `vite build`
- `preview`: Vite preview
- `clean`: remove dist/server.js
- `lint`: `tsc --noEmit` (TypeScript check, not ESLint)

No `test` script or test runner is declared in the inspected manifest.

| Check | Result | Reason |
|---|---|---|
| Repository tree/source inspection | Completed | GitHub repository files inspected |
| TypeScript `npm run lint` | Not run | No executable checkout/runtime available through this repository inspection |
| Production build `npm run build` | Not run | No dependency installation/build execution |
| Unit/integration/E2E tests | Not run | No test script/framework declared |
| Browser smoke workflows | Not run | No browser runtime/session attached |
| Accessibility scan/manual keyboard test | Not run | No executable UI test environment |
| Security/authorization tests | Not run | No backend/API environment; static UI inspection only |
| Load/performance test | Not run | No running system/load environment |

**Do not interpret “Not run” as Pass or Fail.** The next executable baseline must record exact commit, Node/npm versions, install command, command exit codes, logs, browser viewport and test data.

## 6. Traceability discrepancy to carry forward

- B atomic matrix: 423 unique IDs.
- C→B reconciliation: 413 unique IDs.
- Missing from C: `G-03`, `G-04`, `G-05`, `G-06`, `G-07`, `G-09`, `G-10`, `G-11`, `G-14`, `G-20`.

Phase 1 must classify whether these ten G-IDs are intentionally excluded, duplicate gap records, or missing reconciliation rows, then update the matrix summary consistently.

## 7. Phase 0 acceptance

- [x] Main baseline commit identified.
- [x] Repository/source inventory captured.
- [x] Screen/route behavior catalogued.
- [x] Simulated vs local vs missing system behavior distinguished.
- [x] SRS v3.0 and OpenAPI baseline identified.
- [x] Current source corrections compared with prior audit snapshot.
- [x] Architectural debt and user-impacting bugs registered.
- [x] Components and workflows to preserve listed.
- [x] Safest phase order documented.
- [ ] Build/typecheck/test/browser/a11y/security/performance baseline executed.

**Disposition:** static Phase 0 audit is documented; executable verification remains a prerequisite before declaring the repository runtime baseline complete.
