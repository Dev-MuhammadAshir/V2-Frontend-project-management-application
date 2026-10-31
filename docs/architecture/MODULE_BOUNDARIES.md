# Frontend Module Boundaries and Ownership

**Status:** Proposed target boundaries for incremental migration. Existing UI remains in place.

## 1. Rules

1. A feature owns its workflows, application use cases, view models and feature-specific components.
2. Shared UI contains generic presentation components and must not import feature internals.
3. Infrastructure owns browser/network integrations: HTTP, realtime, demo persistence and configuration.
4. Domain modules contain pure rules/types and do not import React, browser APIs or transport clients.
5. Application use cases depend on ports, not concrete adapters.
6. Composition root is the only place selecting demo/API adapters.
7. Cross-feature work uses public application interfaces, not another feature's private components.
8. Backend authorization remains mandatory.

## 2. Ownership matrix

| Module | Owns | May depend on | Must not own |
|---|---|---|---|
| app | Bootstrap, router, provider composition, config | Feature entry points, shared providers | Business rules or page-level HTTP |
| auth | Login/session UX, identity view, profile security UX | AuthPort, shared UI | Authoritative role assignment |
| teams | Team and membership workflows | TeamPort | Cross-project authorization |
| projects | Project lifecycle, membership, overview | ProjectPort, Team contracts | Persistence implementation |
| tasks | Task, assignee, subtask, dependency, Kanban workflows | TaskPort, pure rules | Final server validation |
| comments | Comment/mention UX | CommentPort | Author/time enforcement authority |
| attachments | Upload/download UI and metadata | AttachmentPort | Storage security policy |
| notifications | Inbox/read state | NotificationPort, event facade | Delivery persistence |
| analytics | Metric views and definitions | AnalyticsPort | Hard-coded production history |
| audit | Search/detail display | AuditPort | Audit mutation |
| risks | Risk display and supported resolution UX | RiskPort | Scoring or autonomous task changes |
| shared/ui | Generic controls, skeletons, empty states, toasts | Shared tokens/utilities | Feature business logic |
| infrastructure/http | Transport, parsing, error mapping | Config, DTO schemas | Page rendering |
| infrastructure/realtime | Socket lifecycle, event validation, invalidation | Auth/session facade | CRUD authority |
| infrastructure/demo | Fixtures, demo repositories/storage | Ports, schemas | Production persistence |
| shared/types | Primitive transport-neutral types | None | Feature workflows |

## 3. Dependency direction

~~~mermaid
flowchart BT
  UI[Feature UI / Existing Pages] --> APP[Application Use Cases]
  APP --> DOMAIN[Feature Domain]
  APP --> PORTS[Capability Ports]
  ADAPTERS[HTTP / Realtime / Demo Adapters] --> PORTS
  ADAPTERS --> DOMAIN
  COMPOSE[App Composition Root] --> UI
  COMPOSE --> ADAPTERS
  SHARED[Shared UI and Utilities] --> UI
~~~

Feature modules must not import infrastructure implementation details. Shared UI must not import features. Avoid circular dependencies.

## 4. Existing-to-target mapping

| Current repository area | Target ownership | Migration note |
|---|---|---|
| src/App.tsx, src/main.tsx | app bootstrap/router/composition | Preserve routes |
| src/context/MockAuthContext.tsx | auth + demo auth adapter | Consolidate identity; role switch demo-only |
| src/context/AppContext.tsx | Transitional facade over use cases | Split by vertical slice, not big bang |
| src/data/mockData.ts | infrastructure/demo fixtures | Keep deterministic fixtures |
| src/types/index.ts | Temporary compatibility facade | Remove aliases only after mapping/tests |
| src/layouts/MainLayout.tsx | app/layout | Preserve visual/navigation behaviour |
| src/components/* | shared UI or feature component | Classify by responsibility |
| src/pages/* | Feature UI | Preserve route/workflow parity |
| src/components/modals/* | Feature components unless generic | Preserve interaction parity |

## 5. Cross-feature collaboration

- Tasks reference project/team/user IDs; they do not import Project page components.
- Comments and attachments attach through identifiers and their own ports.
- Notifications refer to entity identifiers and route metadata; they do not mutate entities.
- Analytics reads aggregated data.
- Audit is query-only.
- Risks display backend evaluations; resolution does not mutate task/project data.
- Auth exposes session/identity for UX, not a client security engine.

## 6. Review checklist

- [ ] Owning capability and public interface identified.
- [ ] No feature-to-feature internal import introduced.
- [ ] Domain imports no React, fetch, localStorage or Socket.IO.
- [ ] Existing routes and workflows preserved.
- [ ] DTO mapping occurs at adapter boundary.
- [ ] Backend enforcement documented for protected actions.
- [ ] Unit/contract/component tests cover the boundary.
- [ ] Migration and rollback described.

## 7. Transitional exception

Current context and shared types may temporarily act as compatibility facades. They are not target architecture. Every exception needs a migration issue and must not justify new coupling.
