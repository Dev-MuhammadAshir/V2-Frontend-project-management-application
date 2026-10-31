# Frontend High-Level Design

**Status:** Proposed Phase 2 architecture baseline; not implemented.  
**Authority:** SRS 3.0. The companion OpenAPI document is endpoint detail, not a replacement for SRS authority.  
**Scope:** Existing React SPA only.

## 1. Purpose

Modernize the existing React 19, TypeScript, Vite SPA incrementally. Preserve current routes, screens, layouts, shared components, modals, drawers and user workflows. This is not a rewrite and does not assert that the backend described by the SRS is already implemented.

The frontend is a client of the SRS-defined modular monolith. It is not authoritative for authentication, authorization, shared persistence, audit immutability, data integrity, attachment security or PIRAE evaluation.

## 2. Product and system boundary

The product is a single-organization, team-centric project management web application. Frontend capabilities include authentication UX, teams, projects, tasks/subtasks/dependencies, Kanban, comments/mentions, attachments, notifications, analytics, audit viewing and advisory risk display.

Outside the frontend boundary:
- Credential verification, token issuance/revocation and account lockout.
- Authoritative global/team/project RBAC and resource checks.
- PostgreSQL persistence, constraints and transactions.
- Redis sessions, token blacklist and Pub/Sub.
- Socket.IO room authorization and event publication.
- Append-only audit storage and retention.
- Attachment byte storage and download authorization.
- Asynchronous PIRAE evaluation and scheduling.
- TLS, reverse proxy, backup, monitoring and deployment.

## 3. Logical architecture

~~~mermaid
flowchart TB
  U[Browser User]
  subgraph SPA[Existing React SPA]
    ROUTER[Routes and UX Guards]
    UI[Existing Pages, Layouts and Shared UI]
    USE[Feature Use Cases]
    DOMAIN[Pure Frontend Rules and Types]
    PORTS[Capability Ports]
    HTTP[REST Adapter]
    RT[Socket.IO Adapter]
    DEMO[Demo Provider and Fixtures]
    ROOT[Composition Root and Runtime Config]
  end
  API[Backend Modular Monolith]
  DB[(PostgreSQL)]
  REDIS[(Redis)]
  SOCKET[Socket.IO Gateway]
  U --> ROUTER --> UI --> USE --> DOMAIN
  USE --> PORTS
  ROOT --> HTTP
  ROOT --> RT
  ROOT --> DEMO
  PORTS --> HTTP
  HTTP --> API
  RT <--> SOCKET
  API --> DB
  API --> REDIS
  SOCKET --> REDIS
~~~

This is a logical target. It does not mean these adapters or backend services currently exist.

## 4. Architecture decisions

| Concern | Target |
|---|---|
| UI/runtime | Existing React 19 + TypeScript + Vite SPA |
| Routing | Existing React Router 7; route guards are UX gates only |
| Styling | Existing Tailwind CSS 4 system |
| Forms | Existing React Hook Form where useful; Zod for runtime validation |
| Server state | Typed REST adapter; evaluate TanStack Query in an implementation PR |
| Realtime | Socket.IO adapter, supplemental to REST |
| Demo | Explicit provider, deterministic fixtures, isolated local persistence |
| Production | API-backed provider; fail closed if required config is missing |
| Authority | Backend and approved SRS contract |

## 5. Runtime modes

### Demo mode
- Deterministic fixtures and namespaced/versioned browser persistence.
- Clearly label demo/local data and simulated connectivity.
- Role switching is demo-only.
- Never display a production authentication, immutable audit or compliance guarantee.

### API mode
- Uses configured browser-reachable API origin and approved session contract.
- Server responses are authoritative.
- No fallback to local demo records after network/API failure.
- A 401 follows the approved session-expiry flow; it does not infer identity from a selected role.
- Realtime is disabled until a real endpoint and handshake are verified.

Mode is selected once at composition time from validated configuration. A production build must not expose a user-facing demo identity switch.

## 6. Capability ownership

| Capability | Existing UI to preserve | Target application boundary | Authority |
|---|---|---|---|
| Identity | Login, Profile, User Management | Auth use cases | Auth API |
| Access | Sidebar, guards, action visibility | Permission presentation helpers | Backend RBAC |
| Teams/projects | Existing pages and modals | Team/Project use cases | REST |
| Tasks/Kanban | Task list, board, drawer/modal | Task use cases and pure rules | REST |
| Comments | Task detail drawer | Comment use cases | REST |
| Attachments | Task detail attachment UI | Upload/download use cases | REST/protected storage |
| Notifications | Notification center | Notification use cases | REST + events |
| Analytics | Dashboard | Analytics queries | REST |
| Audit | Audit viewer | Read-only audit queries | Server audit store |
| PIRAE | Risk dashboard/detail | Risk queries/lifecycle | Backend evaluator |

## 7. Data flow

**Query:** page → use case → capability port → REST or demo adapter → runtime schema validation → DTO mapping → view model → UI.

**Mutation:** UI intent → use case → client feedback validation → REST command → backend authentication/authorization/validation/transaction → authoritative response → UI reconciliation. Rejected changes restore server state and show a useful error.

**Realtime:** authenticated Socket.IO event → payload validation → targeted query invalidation/refetch. Events are not a CRUD authority or proof that a mutation committed. Reconnect recovery uses REST snapshots unless replay cursors are contractually defined.

## 8. Cross-cutting qualities

- Security: no secrets in browser bundles; no client-only authorization; redact credentials.
- Accessibility: preserve keyboard operation, focus management and WCAG 2.1 AA intent where feasible.
- Errors: normalize API envelopes without exposing stack traces.
- Performance: paginate lists and avoid unbounded client state.
- Compatibility: map DTOs at the adapter boundary; legacy UI aliases do not leak into API payloads.
- Testing: separate pure rule, adapter, component, integration and E2E coverage.

## 9. Constraints

No microservices/Kubernetes requirement, no new dependency approval, no page redesign, no localStorage production system-of-record, and no autonomous PIRAE action is introduced by this design.

## 10. Implementation order

1. Execute the outstanding Phase 0 runtime baseline.
2. Reconcile SRS/OpenAPI and traceability gaps.
3. Add validated runtime config and explicit demo/API composition.
4. Consolidate identity and remove misleading simulated status.
5. Introduce typed transport/error mapping.
6. Extract pure domain rules and tests.
7. Migrate feature-by-feature to REST.
8. Add Socket.IO after REST identity/authorization are stable.
9. Add contract, E2E, accessibility, security and resilience gates.

## 11. Open decisions

Confirm refresh-token transport/cookie and CSRF policy; endpoint schema/response gaps; pagination/filter semantics; attachment transport and signed-download lifecycle; event payload versioning and replay cursor; and deployment-time config injection. These must not be guessed in frontend code.

**Acceptance:** architecture review confirms SPA preservation, trust boundaries, SRS alignment and explicit handling of unresolved contract issues.
