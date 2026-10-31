# Frontend Low-Level Design

**Status:** Proposed Phase 2 design; no source code changed.  
**Authority:** SRS 3.0 plus the companion OpenAPI contract.

## 1. Principles

- Preserve existing routes, pages, layout, shared components, modals and drawers.
- Introduce boundaries incrementally; no big-bang rewrite.
- UI expresses intent; application use cases orchestrate; adapters perform I/O.
- External JSON is untrusted until runtime-validated.
- Backend authorization and persisted state are authoritative.
- Demo data is isolated from API mode.
- No design document silently authorizes dependencies or requirement changes.

## 2. Target organization

This is a target ownership map, not a mandatory mass file move.

~~~text
src/
  app/                 # bootstrap, router, providers, config
  features/
    auth/ teams/ projects/ tasks/
    comments/ attachments/ notifications/
    analytics/ audit/ risks/
      pages/ components/ application/ domain/ api/
  shared/
    ui/ forms/ errors/ types/ utils/
  infrastructure/
    http/ realtime/ demo/ persistence/
  layouts/             # preserve during migration
  types/               # temporary compatibility facade
~~~

Each migration identifies the old owner, new owner, compatibility period and deletion condition.

## 3. Composition root

The application bootstrap validates configuration and creates exactly one provider graph. Feature pages must not instantiate fetch clients, Socket.IO clients or localStorage access directly.

~~~mermaid
flowchart TD
  MAIN[main.tsx] --> CFG[Validated Runtime Config]
  CFG --> ROOT[Provider Composition]
  ROOT --> MODE{Mode}
  MODE -->|demo| DEMO[Demo Ports]
  MODE -->|api| ADAPTERS[REST and Realtime Adapters]
  ROOT --> AUTH[Auth Provider]
  ROOT --> ROUTER[Router and Features]
  ROUTER --> USE[Application Use Cases]
  USE --> PORTS[Capability Ports]
  PORTS --> DEMO
  PORTS --> ADAPTERS
~~~

Unknown mode or missing API URL in API mode is a configuration error, not a reason to fall back to demo.

## 4. Capability ports

| Port | Operations (illustrative) | Contract caution |
|---|---|---|
| AuthPort | login, restore session, logout, current user, password change | Exact refresh semantics require security decision |
| TeamPort | list/detail/create/update/member operations | Backend role enforcement |
| ProjectPort | list/detail/create/update/archive/member roles/progress | Match actual OpenAPI operations |
| TaskPort | list/detail/create/update/status/assignees/subtasks/history/dependencies | Preserve dependency direction |
| CommentPort | list/create/update/delete where supported | Server enforces author and 15-minute window |
| AttachmentPort | list/upload/download/delete | Protected storage; no public storage key |
| NotificationPort | list/mark one/mark all read | Persistent server state |
| AnalyticsPort | summary/workload/distributions/trends where defined | No fabricated history |
| AuditPort | list/filter/detail where supported | Read-only |
| RiskPort | list/detail/resolve where supported | Advisory only |

These are frontend seams, not additional backend endpoint promises. Final signatures must be checked against OpenAPI and reconciled SRS requirements.

## 5. DTO and domain mapping

- Build request DTOs from validated application inputs.
- Parse response JSON using Zod schemas aligned with approved OpenAPI.
- Map transport casing, nullability and enums into view models.
- UI-only selection/expansion/optimistic fields never serialize.
- Keep legacy unions in the current shared types file behind a compatibility mapper until consumers migrate.

Canonical SRS values include task statuses TODO / IN_PROGRESS / DONE; priorities LOW / MEDIUM / HIGH / CRITICAL; global roles Administrator, Project Manager/Team Lead, Team Member, Viewer/Stakeholder; project roles Manager, Contributor, Viewer; risk lifecycle Open / Resolved; dependency direction blocking task → blocked task with relation BLOCKS. Global, team and project role scopes are distinct.

## 6. HTTP adapter responsibilities

- Resolve the API origin from validated configuration.
- Apply approved credential transport; never invent refresh-token storage.
- Forward correlation ID where defined.
- Serialize pagination/filter/sort consistently with each endpoint.
- Parse success/error envelopes and preserve HTTP status/application code.
- Validate response shape before mapping.
- Support cancellation and bounded timeout.
- Redact credentials and sensitive payloads from diagnostics.

OpenAPI declares bearer authentication, API paths under /api/v1, 15-minute access JWT, Redis-backed refresh session/JTI revocation and a 100 requests per 15-minute limit. This is a contract description, not proof of a running backend. Refresh cookie/storage and CSRF policy remain open until approved.

## 7. Error model

~~~ts
type AppError =
  | { kind: "validation"; message: string; fields?: Record<string, string[]>; code?: string }
  | { kind: "unauthorized" | "forbidden" | "not-found" | "conflict"; message: string; code?: string }
  | { kind: "rate-limited"; message: string; retryAfterSeconds?: number; code?: string }
  | { kind: "network"; message: string; retryable: boolean }
  | { kind: "server"; message: string; correlationId?: string; retryable: boolean }
  | { kind: "unexpected"; message: string };
~~~

This is a frontend classification, not a replacement for server codes. Exact HTTP status must follow the operation contract.

## 8. State ownership

| State | Owner | Persistence |
|---|---|---|
| Identity/session | Canonical auth provider | Approved session mechanism |
| Projects/tasks/comments | Server-state layer | Backend in API mode |
| Query cache | Server-state adapter | In-memory; refetch after reconnect |
| Form drafts | Form/component state | Transient unless explicitly saved |
| UI filters/modals | Feature/component state | URL only when shareable |
| Demo records | Demo provider | Namespaced/versioned local storage |
| Realtime status | Realtime adapter | In-memory, actual socket lifecycle |
| Toasts | UI provider | Ephemeral |
| Audit | Server | Read-only client cache |

The current AppContext is transitional. Extract by vertical slice; do not mechanically replace it with many coupled contexts.

## 9. Authentication and route UX

- API-mode login submits credentials; role picker remains demo-only.
- One auth provider owns current identity and session lifecycle.
- Protected routes wait for session restoration.
- Route guards improve UX only; backend checks every protected operation.
- Handle 401 with one approved refresh attempt, prevent refresh stampedes, then clear caches/disconnect realtime on logout.
- Client role claims never prove permission.

## 10. Realtime adapter

Connect only with a valid session and approved handshake. Validate event payloads, avoid duplicate listeners, subscribe only to server-authorized rooms, and invalidate/refetch affected REST queries. Track real connecting/connected/reconnecting/disconnected/error states. Use bounded exponential backoff. On reconnect, reconcile via REST; missed-event replay requires a confirmed cursor contract.

SRS companion event names: task.created, task.updated, task.status_changed, task.assigned, task.deleted, comment.created, comment.updated, comment.deleted, project.updated, notification.created, risk.detected, risk.updated and membership.changed. Payload schemas/version/replay semantics require reconciliation before consumers are implemented.

## 11. Feature rules

- **Tasks/Kanban:** client pre-checks cycles/duplicates/blockers for UX; server validates every dependency mutation and DONE transition. Roll back rejected optimistic state.
- **Comments:** show server author/timestamps; UI may hide invalid edit actions, but server enforces author and 15-minute rule. Sanitize Markdown rendering.
- **Attachments:** client validation is feedback only; server validates size, MIME/magic bytes and authorization. Exactly one parent (task or comment). Download through authorized response or short-lived URL.
- **Analytics:** metrics derive from persisted data and documented windows. Missing history is unavailable, not synthetic.
- **Audit:** read-only UI; no edit/delete; no compliance claim without evidence.
- **PIRAE:** display server-generated risk/reason/recommendation/time; resolution changes lifecycle only, never task fields.

## 12. Testing layers

Unit: pure rules, mappers, config and error mapping. Component: accessible forms and states. Adapter: HTTP contract/payload validation. Contract: OpenAPI fixtures. Integration: use case/provider/cache reconciliation. E2E: authentication, project/task lifecycle, dependency rejection, comments, notifications, attachment authorization, audit read-only and risk advisory. Realtime: multi-client, unauthorized room, disconnect/reconnect and REST recovery.

## 13. Migration rule

Each feature migration preserves routes/workflow, defines rollback, includes tests and removes old code only after parity is demonstrated. Phase 2 itself makes no source changes.
