# Demo / Prototype to Production Strategy

**Status:** Proposed migration strategy.  
**Goal:** Preserve the existing ProjectFlow SPA while replacing local/simulated capabilities with verified backend integrations in controlled vertical slices.

## 1. Strategy

The current application is an interactive prototype, not evidence of a complete production system. Keep its UI and workflows; isolate demo infrastructure; connect the same use cases to the SRS modular-monolith backend. Production mode must never quietly behave like demo mode.

## 2. Capability maturity

| Capability | Current repository evidence | Production target | Exit gate |
|---|---|---|---|
| Authentication | Demo role selection/mock user | Credential login, JWT/session lifecycle, admin-provisioned accounts | Auth API and session security tests |
| Authorization | Hardcoded client checks | Backend role + membership + resource checks | Negative API tests |
| Persistence | Local state/localStorage | PostgreSQL-backed REST | Reload and multi-user consistency |
| Projects/tasks | Fixture-driven mutations | REST commands/queries and server validation | Contract/lifecycle tests |
| Dependencies | Client graph/blocker checks | Server constraints and transactional transition validation | Cycle/duplicate/blocker tests |
| Comments | Local comments; incomplete author/time enforcement | Server author/15-minute edit rule | Boundary/authorization tests |
| Realtime | Simulated status/latency | Authenticated Socket.IO, authorized rooms, Redis Pub/Sub | Multi-client/reconnect tests |
| Notifications | Local collection | Persisted notifications and replay | Offline/reconnect tests |
| Attachments | Metadata-only | Authorized byte upload/download | Content/size/access tests |
| Analytics | Local aggregates and hard-coded history | Defined server-backed metrics | Reconciliation tests |
| Audit | Browser-generated records | Append-only server audit | Tamper/authorization tests |
| PIRAE | Seeded/local risk display | Async backend evaluation, advisory only | Rule/schedule/non-mutation tests |
| Operations | No runtime evidence in frontend repo | CI/CD, HTTPS, backup, monitoring, recovery | Release/operations gates |

## 3. Migration waves

### Wave 0 — Runtime baseline and scope freeze
- Execute clean install, TypeScript check and production build on exact baseline commit.
- Select a test runner compatible with current stack and document it.
- Record Node/npm versions, command logs and exit codes.
- Capture browser smoke and accessibility baseline.
- Resolve traceability discrepancies and reconcile OpenAPI/SRS gaps.
- Exit: reproducible baseline report; no P0 blocker hidden.

### Wave 1 — Identity and runtime mode
- Consolidate MockAuthContext and AppContext identity into one canonical auth state.
- Separate demo role selection from API login.
- Define validated config and composition root.
- Remove fake production connectivity and unsupported compliance labels.
- Exit: API mode fails closed; demo remains usable/labelled; expiry/logout tested.

### Wave 2 — Contract and transport
- Reconcile OpenAPI paths/schemas/errors with SRS 3.0.
- Implement Zod DTO schemas and mapping tests.
- Implement typed REST adapter, error normalization and correlation handling.
- Establish server-state lifecycle/cache invalidation.
- Exit: contract tests pass; pages do not perform direct network I/O.

### Wave 3 — Core vertical slices
1. Teams and membership.
2. Projects and project membership/roles.
3. Tasks, assignees, subtasks and dependencies.
4. Kanban status transitions.

Keep existing screens and replace the data source beneath use cases. Exit: persisted multi-user workflows and authorization/conflict recovery tested.

### Wave 4 — Collaboration and files
- Comments/mentions with server edit-window enforcement.
- Protected attachment upload/download.
- Persisted notifications and read state.
- Exit: offline/reconnect and file security tests pass.

### Wave 5 — Analytics, audit and PIRAE
- Replace hard-coded historical analytics with defined server metrics.
- Replace client audit with server append-only query.
- Connect risk assessments and supported resolution lifecycle.
- Exit: data provenance, immutability and advisory-only properties independently verified.

### Wave 6 — Realtime
- Add Socket.IO only after REST identity and authorization are stable.
- Implement event schemas, authorized room membership and lifecycle.
- Reconnect with backoff and REST reconciliation; replay only if contract exists.
- Exit: multi-client, unauthorized room, missed event and duplicate listener tests pass.

### Wave 7 — Production hardening
- CI, security/dependency scanning, accessibility, performance and E2E.
- Deployment, TLS, CORS, WebSocket proxy, secret management, backup/restore and monitoring.
- Release runbook and rollback.
- Exit: measurable NFR and operational gates signed off.

## 4. UX parity

Preserve route URLs/navigation, Sidebar/Topbar, responsive layout, project/task list/board/detail workflows, create/edit modals, task drawer, command palette, notifications, empty/loading states and toast patterns. If backend capability is unavailable, show explicit unavailable/disabled state; do not simulate success.

## 5. Data migration and demo safety

Demo records are not production seed data by default. Never import localStorage into production without approved import, identity mapping, validation, duplicate handling and audit plan. Production data comes from backend. Demo schema changes require versioned migration or safe reset. Unknown legacy enums require reconciliation, not silent rewriting.

## 6. Rollback

Each vertical slice is independently revertible, keeps adapter selection behind composition, retains the previous demo provider until parity, avoids simultaneous redesign and data-source replacement, includes smoke tests and rollback notes. Backend schema changes require their own backup and rollback plan; frontend rollback cannot reverse backend migrations.

## 7. Release gates

| Gate | Required evidence |
|---|---|
| Requirements | SRS traceability and approved contract changes |
| Build | Clean install and successful production build |
| Static quality | TypeScript/lint and import-boundary checks |
| Unit | Critical domain rules; SRS target >=80% critical modules |
| Integration | API/database/auth/authorization contract tests |
| E2E | Core workflows on supported desktop/tablet viewports |
| Accessibility | WCAG 2.1 AA assessment where feasible |
| Security | Auth/RBAC, session, upload, XSS/CSRF/CORS and secret checks |
| Realtime | Room authorization, event validation, reconnect/recovery |
| Performance | SRS targets: API p95 <=500ms, realtime <=200ms, initial 1,000 authenticated users; verify in system environment |
| Operations | TLS, backup/restore, monitoring, incident and rollback runbooks |

## 8. Current limitations

Phase 0 static audit is documented, but build/typecheck, automated tests, browser, accessibility, security and performance checks were not run. The frontend repository inspection did not establish a running backend implementation. No production-readiness claim is made.

## 9. Definition of done

- [ ] Demo and API providers are distinct.
- [ ] Existing workflow parity demonstrated.
- [ ] Each capability has an authoritative backend contract.
- [ ] No client-only security/compliance claim remains.
- [ ] Mutations reconcile from server response.
- [ ] Realtime is supplemental and recoverable.
- [ ] Critical tests and operational gates pass.
- [ ] Rollback is documented and exercised.
