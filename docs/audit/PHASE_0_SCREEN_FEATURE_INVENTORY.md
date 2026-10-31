# Phase 0 — Screen and Feature Inventory

**Baseline:** `main` commit `69ecb3f88ca43b7ae5df46bc8f5d04101f4d5e3d`  
**Method:** route and component source inspection. “Working” below means a local browser interaction is present, not backend acceptance.

## Route inventory

| Route | Screen/component | Observed behavior | Classification / limitation |
|---|---|---|---|
| `/login` | `Login` | Demo login form, sample credentials/role selection, calls mock role login | Simulated authentication; no credential verification |
| `/403` | `ForbiddenPage` | Standalone forbidden/error preview | Static UI |
| `/500` | `ServerErrorPage` | Standalone server-error preview | Static UI; not a real server response |
| `/` | Redirect | Redirects to `/dashboard` inside authenticated route group | Route behavior |
| `/dashboard` | `Dashboard` | Welcome/current role, task/project/risk counts, workload, status chart, shortcuts, task/risk drawer actions | Local data; simulated loading/live feedback |
| `/projects` | `ProjectsList` | Project discovery/list, search/filter/sort, progress/metadata, create-project modal and detail navigation | Local records and mutations |
| `/projects/:projectId` | `ProjectDetail` | Project summary and composed board/list/members/risks/analytics/audit views | Local data; broad project workspace UI |
| `/kanban` | `KanbanBoard` | TODO/IN_PROGRESS/DONE columns, drag/drop and explicit move controls, opens task drawer | Local status mutation; dependency gate in shared context function |
| `/tasks` | `TaskList` | Search, status/priority filters, sorting, selection, bulk complete/delete, task drawer | Local task state; bulk completion delegates to shared status function |
| `/my-tasks` | `MyTasks` | Current-user task list and task navigation | Depends on AppContext identity; no server scoping |
| `/teams` | `TeamsList` | Team cards, member/project summaries, create-team UI shown by role check | Local team/member state |
| `/teams/:teamId` | `TeamDetail` | Team detail, membership and associated project views/actions | Local team/member state |
| `/users` | `UserManagement` | User search/filter, provisioning, role/status controls and password-reset UI | Local provisioning; reset is not a verified credential flow |
| `/profile` | `Profile` | Edit personal fields/capacity, preferences and password-change form | Profile local; password change is a timed success simulation |
| `/notifications` | `NotificationCenter` | All/unread/type filters, mark one/all read, clear feed, navigate to linked task/risk | Local notification collection |
| `/analytics` | `AnalyticsDashboard` | Status/priority distributions, member workload, sprint velocity chart | Current arrays local; historical sprint values and headline velocity hard-coded |
| `/audit-logs` | `AuditLogViewer` | Search/severity filter, inspect record, CSV export | Local browser-generated log; not immutable server audit |
| `/risks` | `PIRAERiskDashboard` | Active risk cards, type/heatmap filters, severity summaries, resolve/inspect action | Seeded/local risks; status and engine claims exceed evidence |
| `/settings` | `Settings` | PIRAE thresholds, sprint/capacity/retention/email settings form | Local settings mutation; no server config persistence |
| `*` (nested) | `NotFoundPage` | Not-found UI for unknown workspace route | Static UI behind demo route guard |

## Cross-screen workflows

| Workflow | Present behavior | Missing end-to-end proof |
|---|---|---|
| Sign in → workspace | Selects a demo role/user; protected route checks non-null mock user | Credentials, server session, token refresh, account lockout |
| Role switch | Topbar switches demo auth role and attempts to synchronize AppContext user | One canonical identity source; role × resource tests |
| Create project → project detail | Modal creates a local project and list/detail UI can display it | API persistence, validation contract, scoped permissions |
| Create task → list/Kanban/drawer | Local task mutation and shared UI surfaces | Server CRUD, concurrency, contract errors |
| Move task → DONE | Kanban/task list use shared `moveTaskStatus`; it rejects unfinished incoming blockers | Server validation; automated tests across every path |
| Add dependency | Client rejects self, missing, cross-project, cycle and duplicate links | Server graph integrity and concurrency tests |
| Comment → edit/mention | Local comment record, edit affordance, @-text helper | Author/time enforcement in mutation/API; recipient ID and notification |
| Add attachment | Attachment metadata record is added | Actual file bytes, secure upload/storage/download |
| Notification → linked entity | Local read state and task/risk navigation | Persisted recipient delivery and multi-device sync |
| Resolve risk | Local status mutation and toast | Canonical Open/Resolved lifecycle, backend engine and audit |
| Audit → CSV | Exports filtered local log array | Server-authored immutable source and authorized query |
| Settings → save | Updates local settings state | Validation, permission and persisted engine configuration |

## Component preservation inventory

| Component | Why preserve |
|---|---|
| `MainLayout`, `Sidebar`, `Topbar` | Main application shell, navigation, responsive layout, account/notification entry points |
| `Badge` | Shared role/status/priority/risk presentation |
| `CommandPalette` | Keyboard-driven navigation/action affordance |
| `ConfirmModal` | Reusable destructive-action confirmation |
| `EmptyState`, `SkeletonLoader` | Reusable empty/loading presentation |
| `ToastContainer` | Centralized feedback presentation; later connect to real mutation outcomes |
| `CreateProjectModal`, `CreateTaskModal` | Existing create workflows and form composition |
| `TaskDetailDrawer` | Dense task detail/comments/subtasks/attachments interaction surface |
| `RiskDetailModal` | Risk detail inspection |
| `ProjectDetail`, `TeamDetail` | Existing composed entity workspaces |
| `mockData.ts` | Useful deterministic demo/test fixtures after isolation from production providers |

**Preservation rule:** keep user-visible workflows and layout behavior while extracting infrastructure and domain rules. Avoid replacing the SPA or redesigning every page during the initial architecture work.
