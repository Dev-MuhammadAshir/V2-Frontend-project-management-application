# A. Master Requirements Catalogue — SRS 3.0 Baseline

**Project:** Real-Time Team Project Management Platform with Predictive Insights  
**Baseline authority:** `SRS_3.0_CONSOLIDATED_BASELINE_e782668d.md`  
**Companion contract:** `OpenApi-Specification.txt` (used for endpoint-level detail; its version label is not authoritative)  
**Status:** Working catalogue derived from the SRS 3.0 requirements, data dictionary, event catalogue, NFR table, deployment sections, and OpenAPI paths. Requirements are organized by capability rather than inherited document ordering. Duplicate/incorrect identifiers in supporting artifacts must not create duplicate requirements. If any supporting artifact conflicts with SRS 3.0, SRS 3.0 wins.

> **Scope guard:** This is a requirements baseline, not an implementation plan or an assertion that the current frontend already satisfies these requirements. UI details not explicitly specified in SRS/OpenAPI are recorded as design guidance, not new product requirements. Secondary Sprint/Errata documents must be reconciled against this baseline before final traceability is declared complete.

## 1. Product scope and architectural invariants

The product is a **single-organization, team-centric project management web application** for managing teams, projects, tasks/subtasks, dependencies, Kanban workflow, collaboration, notifications, analytics, audit history, and advisory risk insights.

### In scope
- Admin-provisioned authentication and account lifecycle; system-, team-, and project-level authorization.
- Teams, projects, project membership, tasks, assignees, subtasks, dependencies, Kanban.
- Comments, mentions, attachments, persistent notifications and real-time synchronization.
- Project/workload analytics, append-only audit trail, rule-based PIRAE risk assessments.
- REST API, Socket.IO events, Redis Pub/Sub/session support, PostgreSQL persistence.
- Docker Compose/Nginx/HTTPS, operational health, logs, backups and CI/CD hardening.

### Explicitly out of scope
- Public self-registration; enterprise multi-tenancy; payroll, accounting, CRM or ERP.
- Video conferencing, enterprise billing/subscriptions, large third-party integration ecosystem.
- Microservices or Kubernetes as a required architecture.
- Deep-learning/ML prediction or autonomous project management.
- Automatic deadline changes, automatic task reassignment or automatic rescheduling.
- Replacing all capabilities of Jira/Asana/Monday.com.

### Non-negotiable design invariants
1. Modular monolith; REST is the primary CRUD/query interface.
2. PostgreSQL is the system of record. Redis is not the primary database.
3. Socket.IO complements REST for real-time updates; Redis Pub/Sub distributes events.
4. Every protected operation is authorized by the backend. Hiding a button in the frontend is not a security control.
5. Audit entries are append-only and ordinary users cannot alter/delete them.
6. PIRAE is advisory only and never changes project/task state autonomously.
7. Data integrity is enforced by foreign keys, CHECK/UNIQUE constraints and transactions.
8. Use HTTPS/TLS for network communication; Nginx must proxy WebSocket upgrade headers.

## 2. Functional requirements catalogue

The IDs below retain SRS 3.0 identifiers where they exist. Grouping is normalized for usability; it does not renumber requirements.

### 2.1 Authentication, account lifecycle and sessions — MVP
- **FR-AUTH-01:** Authenticate using email/username and password.
- **FR-AUTH-02:** Hash passwords with BCrypt cost factor >= 12.
- **FR-AUTH-03:** Issue JWT access tokens after successful authentication.
- **FR-AUTH-04:** Validate JWT on every protected request.
- **FR-AUTH-05:** Provision accounts through an administrator; no public self-registration.
- **FR-AUTH-06:** View and update own user profile.
- **FR-AUTH-07:** System Administrator can activate/deactivate accounts.
- **FR-AUTH-08:** Lock account after 5 consecutive failed logins for 15 minutes.
- **FR-AUTH-09:** Only System Administrators assign/modify/revoke global system roles.
- **FR-AUTH-10/11:** Logout revokes refresh session and blacklists access-token JTI in Redis until the token's remaining expiry.
- **FR-AUTH-12:** Team creation is System Administrator-only; team membership changes are restricted to Project Managers or System Administrators.
- OpenAPI also defines login, refresh, logout, current-user, password-change, admin-provisioned registration, admin user listing/creation, role changes and account status changes. Password change revokes all refresh sessions.

### 2.2 Authorization and roles — MVP
- **FR-RBAC-01:** Enforce RBAC on all protected backend operations.
- **FR-RBAC-02:** Support system roles: Administrator, Project Manager/Team Lead, Team Member, Viewer/Stakeholder.
- **FR-RBAC-03:** Support project roles: Manager, Contributor, Viewer.
- **FR-RBAC-04:** Verify team/project membership before resource access.
- **FR-RBAC-05:** Apply resource-level authorization checks.
- Role scopes are independent: global role governs platform authority; team role is `Admin-Assigned` or `Member`; project role is `Manager`, `Contributor` or `Viewer`. Never infer one role scope from another.
- UI routes, controls, actions and data visibility should reflect permissions, while the server remains authoritative.

### 2.3 Team management — MVP / audit extension
- **FR-TEAM-01:** Create teams, Administrator-only under the authoritative permission decision.
- **FR-TEAM-02:** Manage team members.
- **FR-TEAM-03:** Only Project Managers or System Administrators modify team membership.
- **FR-TEAM-04:** Prevent unauthorized team provisioning.
- **FR-TEAM-05:** Record membership changes in audit logs (Extended).
- OpenAPI provides team list/detail/create/update/delete and member list/add/remove operations. Delete team is admin-only.

### 2.4 Project management — MVP / audit extension
- **FR-PROJ-01:** Authorized users create projects (OpenAPI: Admin/PM).
- **FR-PROJ-02:** Store objectives/description, start date, end/deadline, status and priority where defined by the contract.
- **FR-PROJ-03:** Manage project members.
- **FR-PROJ-04:** Assign project roles Manager/Contributor/Viewer.
- **FR-PROJ-05:** Monitor project progress.
- **FR-PROJ-06:** Enforce project-level permissions.
- **FR-PROJ-07:** Record project state changes in audit logs (Extended).
- OpenAPI supports project list/detail/create/update/archive, membership management, progress snapshot and member-role changes. Project updates/archive require Manager-level authority or higher as specified by the contract.

### 2.5 Tasks, subtasks, assignees and dependencies — MVP with Extended rules
- **FR-TASK-01/02/03:** Create, update, delete/archive tasks as authorized.
- **FR-TASK-04:** Capture title, description, assignees, priority, deadline/due date, start date and estimated effort where applicable.
- **FR-TASK-05:** Assign one or more members to a task.
- **FR-TASK-06:** Support subtasks stored as JSONB in the SRS data model.
- **FR-TASK-07 (MVP):** Store dependencies in the relational `task_dependencies` table; do not use a `tasks.dependencies` JSONB field. Dependency CRUD and cycle prevention are MVP requirements; the dependency validation gate before transition to DONE is Extended under FR-TASK-15 / FR-KAN-03.
- **FR-TASK-08:** Manage task status.
- **FR-TASK-09:** Provide task history (Extended).
- **FR-TASK-10:** Status enum is exactly `TODO | IN_PROGRESS | DONE`.
- **FR-TASK-11:** Priority enum is exactly `LOW | MEDIUM | HIGH | CRITICAL`.
- **FR-TASK-12:** Enforce status/priority values with database CHECK constraints.
- **FR-TASK-13/14:** Support estimated effort in hours and task start dates (Extended).
- **FR-TASK-15:** Validate dependencies before transitioning a task to DONE (Extended in §2.7, even though Kanban validation is a core behaviour).
- **FR-TASK-16:** Record task changes in audit logs (Extended).
- Dependency relationships use blocking-task -> blocked-task direction. The UI must clearly distinguish “blocks” and “blocked by”; reject invalid/self/duplicate relationships and prevent completion while required blockers remain incomplete according to the implemented SRS acceptance rules.
- OpenAPI exposes project-scoped task list/create, task detail/update/delete, status transition, assignee add/remove, subtask creation, history, and dependency list/add/remove.

### 2.6 Kanban — MVP
- **FR-KAN-01:** Three columns: TODO, IN_PROGRESS, DONE.
- **FR-KAN-02:** Drag-and-drop status transitions.
- **FR-KAN-03:** Validate dependencies before DONE.
- **FR-KAN-04:** Synchronize board changes in real time.
- **FR-KAN-05:** Audit Kanban transitions (Extended).
- Drag-and-drop is a UI interaction, not permission to bypass backend validation. Provide visible pending/error feedback and restore authoritative state if a transition is rejected.

### 2.7 Real-time collaboration — MVP plus recovery extension
- **FR-RT-01:** Synchronize task creation/update/status/assignment, comments, project updates and notifications.
- **FR-RT-02:** Authenticate Socket.IO connections with JWT.
- **FR-RT-03:** Verify identity, token validity, account status and project/team membership before joining rooms.
- **FR-RT-04:** Project room naming: `project:{projectId}`.
- **FR-RT-05:** User room naming: `user:{userId}`.
- **FR-RT-06:** Redis Pub/Sub distributes events.
- **FR-RT-07:** Support multiple connected clients.
- **FR-RT-08:** Use REST for CRUD, retrieval, pagination, filtering and authentication.
- **FR-RT-09:** Define payload schemas for every event (Extended).
- **FR-RT-10:** Reconnect with exponential backoff (Extended).
- **FR-RT-11:** Recover missed events after reconnect (Extended).
- **FR-RT-12:** Reject unauthorized room joins.
- Client must not treat an emitted event as authorization evidence; all writes go through authorized backend operations.

### 2.8 Comments and mentions — MVP, deletion extension
- **FR-COMM-01:** Authorized users comment on tasks.
- **FR-COMM-02:** Support user mentions.
- **FR-COMM-03:** Authors may edit their own comments only within 15 minutes.
- **FR-COMM-04:** Edit updates timestamp and broadcasts `comment.updated`.
- **FR-COMM-05:** Delete comments where authorized (Extended).
- Comment content is Markdown per the data dictionary. UI should show author, creation/edit time and clear permission/edit-window feedback.

### 2.9 Notifications — MVP
- **FR-NOTIF-01:** Generate notifications for relevant task/project events.
- **FR-NOTIF-02:** Persist notifications in PostgreSQL.
- **FR-NOTIF-03:** Deliver in real time to online users.
- **FR-NOTIF-04:** Offline notifications are not lost; persist and replay after reconnect.
- OpenAPI includes list, mark-one-read and mark-all-read operations. Unread/read state must be visible and consistent across clients.

### 2.10 Attachments — Extended
- **FR-ATT-01:** Validate allowed file type and size.
- **FR-ATT-02:** Authorize upload and download.
- **FR-ATT-03:** Persist `storage_key`, `mime_type`, `file_size`, `original_filename`; generate download URL when read rather than storing a permanent public URL.
- **FR-ATT-04:** Authorize deletion.
- **FR-ATT-05:** Exactly one of `task_id` and `comment_id` must be non-null (XOR). Supporting Sprint 10/13 artifacts additionally specify a 10 MB maximum, a PDF/PNG/JPG/JPEG/DOCX/XLSX/TXT allowlist, magic-byte validation, and backend-controlled storage; these are included as reconciled implementation constraints in §13.
- Provide upload progress, validation errors, file metadata and clear download/delete affordances. Do not expose private storage keys as public links.

### 2.11 Analytics — basic MVP, advanced Extended
- **FR-AN-01:** Project completion percentage.
- **FR-AN-02:** Overdue task count/list.
- **FR-AN-03:** Task status distribution.
- **FR-AN-04:** Priority distribution.
- **FR-AN-05:** Workload per member.
- **FR-AN-06:** Analytics must be computed from actual stored data, not hard-coded/demo-only values.
- **FR-AN-07:** Cycle time where feasible (Extended).
- **FR-AN-08:** Completion trends (Extended).
- **FR-AN-09:** Dependency-related blocking (Extended).
- **FR-AN-10:** Project risk trends (Extended).
- Charts/cards must expose understandable labels, time ranges and empty/loading/error states. Counts and percentages must reconcile with the underlying task/project records.

### 2.12 Audit trail — Extended
- **FR-AUD-01:** Record actor, action, entity type/ID, old/new values, timestamp and correlation ID.
- **FR-AUD-02:** Audit entries are append-only.
- **FR-AUD-03:** Normal users cannot modify/delete audit entries.
- **FR-AUD-04:** Capture task creation, assignment, status, deadline, priority, project state and membership changes.
- **FR-AUD-05:** Generate a correlation ID per request/transaction.
- **FR-AUD-06:** Retain audit logs for at least 12 months.
- UI supports authorized query/filter/detail views only; do not present edit/delete controls for audit records.

### 2.13 PIRAE risk analytics — Extended
- **FR-PIRAE-01:** Trigger asynchronously on task/project mutations via BullMQ, evaluate within 5 seconds, and run full daily re-evaluation at 00:00 UTC. Never run synchronously in the API request path.
- **FR-PIRAE-02:** Workload ratio = estimated active hours / configured capacity hours.
- **FR-PIRAE-03:** Workload severity: <=0.70 Low; >0.70–0.90 Medium; >0.90–1.20 High; >1.20 Critical. Thresholds configurable.
- **FR-PIRAE-04:** Delay risk uses due date, status, remaining effort and the specified formula; projected completion >20% beyond deadline forces HIGH.
- **FR-PIRAE-05:** Dependency risk derives from dependency chain and overdue blockers.
- **FR-PIRAE-06:** Elevated priority set is HIGH or CRITICAL.
- **FR-PIRAE-07:** Each risk includes risk_type, risk_score (0–100), severity, reason, recommendation and generated_at.
- **FR-PIRAE-08:** Lifecycle includes Open/Resolved and resolved_at.
- Risk categories: WORKLOAD, DELAY, DEPENDENCY, PRIORITY. Critical severity is used for workload >1.20; other rule severities follow the frozen SRS rule table.
- Recommendations are advisory. Resolving a risk updates its lifecycle only; it must not automatically modify tasks, deadlines, assignments or project state.

### 2.14 REST API standards and documentation
- **FR-API-01:** Version API paths under `/api/v1/`.
- **FR-API-02:** Success envelope: `{ "success": true, "data": ... }`.
- **FR-API-03:** Error envelope: `{ "success": false, "error": { "code": "...", "message": "..." } }`.
- **FR-API-04:** Pagination query: `page=1&limit=20`.
- **FR-API-05:** List response metadata: `meta: { page, limit, total, totalPages }`.
- **FR-API-06:** Define validation/auth requirements.
- **FR-API-07:** Define authorization and error codes.
- **FR-API-08:** Use a standardized pagination wrapper for all list endpoints.
- **FR-API-09:** Filtering/sorting where required (Extended).
- **FR-API-10:** Rate limit 100 requests per 15-minute window per authenticated IP/user (Production).
- **FR-API-11:** OpenAPI/Swagger documentation (Production).
- API error statuses explicitly represented in OpenAPI include 401 unauthenticated, 403 forbidden, 404 missing resource, 409 conflict where applicable, 422 validation failure, 423 account locked, and 429 rate limited. The exact status for an operation must follow its contract rather than being guessed by the frontend.

### 2.15 Socket.IO contract
- **FR-SOCK-01:** Implement the frozen event catalog in §4 below.
- **FR-SOCK-02:** Define payload schemas for all events.
- **FR-SOCK-03:** Authenticate sockets with JWT.
- **FR-SOCK-04:** Enforce room authorization.
- **FR-SOCK-05:** Use Redis Pub/Sub to distribute events.

### 2.16 Deployment and delivery — Production hardening
- **FR-DEP-01:** Docker Compose services: frontend, backend, PostgreSQL, Redis, Nginx.
- **FR-DEP-02:** Nginx proxies HTTP and WebSocket traffic.
- **FR-DEP-03:** Enable HTTPS/SSL.
- **FR-DEP-04:** Manage secrets/environment variables securely.
- **FR-DEP-05:** Use Prisma Migrate for schema migrations.
- **FR-DEP-06:** Provide development/demo seed data.
- **FR-DEP-07:** GitHub-based CI/CD.
- **FR-DEP-08:** Define backup strategy.

## 3. Non-functional requirements

| ID | Requirement / measurable target | Verification |
|---|---|---|
| NFR-PERF-01 | API p95 <= 500 ms with 1,000 concurrent users | Load test |
| NFR-PERF-02 | Real-time event latency <= 200 ms | Real-time test |
| NFR-PERF-03 | Initial concurrency target 1,000 authenticated users | Load test |
| NFR-AVAIL-01 | 90% monthly availability for FYP-scoped environment, excluding scheduled maintenance | Monitoring |
| NFR-AVAIL-02 | Future production target 99.5%, requiring HA/replica/failover | Future target, not current MVP promise |
| NFR-SEC-01 | TLS 1.3 in transit | Configuration audit |
| NFR-SEC-02 | BCrypt cost >= 12 | Code review |
| NFR-SEC-03 | Zod input validation; malformed request -> HTTP 422 | API tests |
| NFR-SEC-04 | Logout uses Redis JTI blacklist + refresh revocation | Security tests |
| NFR-SEC-05 | CORS allowlist is environment-specific | Config audit |
| NFR-SEC-06 | 5 failed logins / 15-minute lockout | Security tests |
| NFR-SEC-07 | Secure HTTP headers: HSTS, XCTO, XFO, CSP, Referrer-Policy, Permissions-Policy | Config audit |
| NFR-SEC-08 | 100 requests / 15 minutes rate limit | Security tests |
| NFR-AUTH-01 | Backend authorization combines role, membership and resource-level checks | Security tests |
| NFR-AUTH-02 | Frontend restrictions are not treated as a security control | Design review |
| NFR-DATA-01 | FK, CHECK and transaction-based integrity | DB tests |
| NFR-DATA-02 | Data corruption target 0% | Reliability tests |
| NFR-AUD-01/02 | Complete auditability and append-only immutability | Audit tests |
| NFR-MAINT-01 | Modular code with service-level interfaces | Code review |
| NFR-MAINT-02 | OpenAPI API documentation | Review |
| NFR-USA-01 | Core workflows understandable without technical knowledge | UAT |
| NFR-USA-02 | WCAG 2.1 AA where feasible | Accessibility audit |
| NFR-USA-03 | New user can complete core task creation within 5 minutes | UAT |
| NFR-PRIV-01 | Only authorized users can access data | Security tests |
| NFR-BAK-01 | Documented backup procedures | Ops review |
| NFR-BAK-02 | FYP RPO 24 hours, RTO 4 hours | Ops review |
| NFR-SCAL-01 | App/Redis/DB can be scaled in future | Architecture review |
| NFR-TEST-01 | >=80% coverage for critical modules | CI |
| NFR-OPS-01 | Application logging, error tracking and health checks | Ops review |
| NFR-OPS-02 | Centralized logging where appropriate | Ops review |
| NFR-OPS-03 | Health endpoint reports app and dependency status | Health check test |
| NFR-RECON-01 | Socket reconnect uses exponential backoff and missed-event replay | RT tests |
| NFR-INF-01 | Nginx includes WebSocket `Upgrade` and `Connection` headers | Deploy audit |
| NFR-SESS-01 | Redis stores refresh sessions and JTI blacklist | Security tests |

Secure header values: HSTS `max-age=31536000; includeSubDomains`; `X-Content-Type-Options: nosniff`; `X-Frame-Options: DENY`; CSP `default-src 'self'` plus explicit asset/Socket.IO allowlist; `Referrer-Policy: strict-origin-when-cross-origin`; Permissions-Policy disables camera, microphone and geolocation (recommended).

## 4. UI/UX requirements and design acceptance

### Explicit SRS UI requirements
- **UI-01:** React + Vite + Tailwind CSS.
- **UI-02:** Responsive layout for desktop (1920x1080 reference) and tablet.
- **UI-03:** WCAG 2.1 AA where feasible; accessible contrast and keyboard navigation.
- Product frontend stack named in SRS: React, Vite, Tailwind, TanStack Query, React Router, React Hook Form, Zod and Socket.IO Client.

### Derived UI acceptance guidance (presentation/interaction; not additional domain features)
- Use a consistent application shell/navigation and consistent page-level hierarchy across modules.
- Provide loading, empty, error, permission-denied and success states for every data-driven view.
- Forms should show field-level validation, preserve user input on recoverable errors and prevent accidental duplicate submissions.
- Destructive or consequential actions require clear labels and confirmation where appropriate; show the result or failure.
- Kanban drag/drop must be keyboard-accessible where feasible, announce transitions and visibly handle rejected transitions.
- Real-time updates must not silently overwrite unsaved edits; show connection/reconnecting state and reconcile after reconnect.
- Risk labels should include severity text/icon, reason and recommendation; do not rely on color alone.
- Analytics must have text labels/legends and accessible summaries, not color-only interpretation.
- Tables/lists should expose pagination metadata and preserve relevant filters/sort when navigating to detail and back.
- Avoid fabricated production metrics. Demo/seed data must be clearly understood as demo data; analytics must be derived from the current dataset.
- Permission-based UI can hide/disable actions for usability, but backend authorization must independently enforce every operation.
- No unrequested visual style, branding, extra product module or workflow is elevated to a requirement by this catalogue.

## 5. Business rules

1. **Account provisioning:** no public sign-up; accounts are provisioned by System Administrator.
2. **Login lockout:** 5 consecutive failed attempts lock the account for 15 minutes.
3. **Session lifecycle:** access JWT lifetime is 15 minutes per the SRS design input; refresh session is stored in Redis; logout blacklists JTI and revokes refresh token.
4. **Role independence:** system, team and project roles are separate scopes and must not be conflated.
5. **Team governance:** create team = System Administrator; modify membership = Project Manager or System Administrator, per SRS role mapping/FR-AUTH-12.
6. **Task status/priority:** only the frozen enum values are valid; database CHECK constraints enforce them.
7. **Dependency integrity:** dependencies are relational; prevent invalid duplicate edges; validate blockers before DONE.
8. **Comment edit window:** author may edit own comment only within 15 minutes; edit updates updated_at and broadcasts comment.updated.
9. **Notification durability:** persist before/alongside real-time delivery so offline users can retrieve it later.
10. **Attachment relationship:** exactly one parent, task XOR comment; validate MIME/type/size and access permissions.
11. **Audit integrity:** append-only; normal users cannot mutate or delete records; retention >=12 months.
12. **PIRAE execution:** asynchronous mutation-triggered job within 5 seconds plus daily 00:00 UTC run; never synchronous in API request path.
13. **PIRAE non-autonomy:** risks/recommendations are informational; no automatic task changes, reassignments, deadline changes or rescheduling.
14. **Capacity:** `configured_capacity_hours` defaults to 40 and is constrained to 10–80.
15. **API conventions:** all APIs under /api/v1; standardized success/error wrappers; all list APIs use pagination wrapper.
16. **Rate limiting:** 100 requests / 15 minutes per authenticated IP/user.
17. **Availability distinction:** 90% monthly is the FYP-scoped target; 99.5% is a future production target, not a current guarantee.

## 6. Domain entities and data constraints

| Entity | Important fields / constraints |
|---|---|
| users | UUID PK; unique non-null email; password_hash; full_name; global_role default Team Member; configured_capacity_hours default 40, CHECK 10–80; is_active default true; created_at |
| roles | UUID PK; unique non-null name |
| teams | UUID PK; name required; optional description; created_at |
| team_members | team_id/user_id FKs with cascade; role enum-like CHECK Admin-Assigned/Member; assigned_by nullable FK SET NULL; assigned_at |
| projects | UUID PK; team_id FK cascade; title required; optional description; status default Active; priority default Medium; optional deadline |
| project_members | project_id/user_id FKs; role enum Manager/Contributor/Viewer; default Contributor |
| tasks | UUID PK; project_id FK cascade; title required; status default TODO with CHECK; priority default MEDIUM with CHECK; optional due_date; estimated_effort default 0; subtasks JSONB default [] |
| task_dependencies | UUID PK; blocking_task_id and blocked_task_id FKs cascade; type BLOCKS; created_at; UNIQUE(blocking_task_id, blocked_task_id) |
| task_assignees | task_id/user_id FKs; composite PK (task_id,user_id) |
| comments | UUID PK; task_id and author_id FKs; body required; created_at; nullable updated_at |
| comment_mentions | comment_id/user_id FKs; composite PK |
| attachments | UUID PK; nullable task_id/comment_id; storage_key, mime_type, file_size, original_filename required; uploaded_by FK; XOR CHECK requiring exactly one parent |
| notifications | UUID PK; recipient FK; type; JSONB payload; nullable read_at; created_at |
| audit_logs | UUID PK; nullable actor FK SET NULL; entity_type/entity_id; action; old/new JSONB; correlation_id UUID NOT NULL; timestamp |
| risk_assessments | UUID PK; project FK; risk_type; risk_score CHECK 0–100; severity; reason/recommendation; status Open/Resolved; resolved_at; generated_at |

Mandatory indexes:
- tasks(project_id, status)
- comments(task_id)
- notifications(user_id, created_at)
- audit_logs(timestamp, entity_type)
- risk_assessments(project_id, risk_type)
- task_dependencies(blocking_task_id)
- task_dependencies(blocked_task_id)

Deletion behaviour follows the listed foreign-key actions; do not invent soft-delete or cascade semantics beyond those defined by the schema/API. Use transactions for multi-entity mutations that must remain consistent.

## 7. API contract catalogue

### Shared rules
- Base path: `/api/v1`.
- Bearer authentication for protected endpoints; login/refresh and admin-provisioned registration are explicitly public to the authentication mechanism but registration itself is admin-only by operation policy.
- Success wrapper: `success: true, data`; list endpoints include `meta.page`, `meta.limit`, `meta.total`, `meta.totalPages`.
- Error wrapper: `success: false, error.code, error.message`.
- Validate input with Zod; malformed requests return 422.
- Use the OpenAPI document as the operation-level contract for request schemas, response schemas, status codes and security. Do not infer payload fields solely from UI components.

### OpenAPI operations inventory
| Area | Operations |
|---|---|
| Auth | POST /auth/login; POST /auth/refresh; POST /auth/logout; GET /auth/me; PATCH /auth/password; POST /auth/register (admin-provisioned) |
| Users | GET /users; POST /users; PATCH /users/{userId}/role; PATCH /users/{userId}/status |
| Teams | GET /teams; POST /teams; GET /teams/{teamId}; PATCH /teams/{teamId}; DELETE /teams/{teamId}; GET /teams/{teamId}/members; POST /teams/{teamId}/members; DELETE /teams/{teamId}/members/{userId} |
| Projects | GET /projects; POST /projects; GET /projects/{projectId}; PATCH /projects/{projectId}; DELETE /projects/{projectId}; GET /projects/{projectId}/members; POST /projects/{projectId}/members; PATCH /projects/{projectId}/members/{userId}; DELETE /projects/{projectId}/members/{userId}; GET /projects/{projectId}/progress |
| Tasks | GET/POST /projects/{projectId}/tasks; GET/PATCH/DELETE /tasks/{taskId}; PATCH /tasks/{taskId}/status; POST /tasks/{taskId}/assignees; DELETE /tasks/{taskId}/assignees/{userId}; POST /tasks/{taskId}/subtasks; GET /tasks/{taskId}/history |
| Dependencies | GET/POST /tasks/{taskId}/dependencies; DELETE /tasks/{taskId}/dependencies/{dependencyId} |
| Comments | GET/POST /tasks/{taskId}/comments; PATCH/DELETE /comments/{commentId} |
| Notifications | GET /notifications; PATCH /notifications/{notificationId}/read; PATCH /notifications/read-all |
| Attachments | POST /attachments; GET /attachments/{attachmentId}; DELETE /attachments/{attachmentId} |
| Analytics | GET /analytics/projects/{projectId}; GET /analytics/projects/{projectId}/workload; GET /analytics/projects/{projectId}/overdue |
| Audit | GET /audit; GET /audit/{auditId} |
| PIRAE | GET /risks; GET /risks/projects/{projectId}; GET /risks/{riskId}; PATCH /risks/{riskId}/resolve |

### API behaviour requirements
- Frontend query state must handle pagination, filtering/sorting where supported, cancellation/retry where safe, stale data and refresh after mutations.
- Do not retry non-idempotent mutations blindly.
- Map 401 to session renewal/sign-in handling; 403 to a permission message; 404 to not-found; 409 to conflict/reload resolution; 422 to field/form validation; 423 to lockout messaging; 429 to rate-limit guidance. Use the exact response code/message supplied by the server where available.
- API host differs by environment; do not hardcode production URLs in components. Configure base URL by environment.

## 8. Frozen real-time events

All event payloads use the standard envelope:
```json
{
  "eventId": "uuid-v4",
  "event": "task.status_changed",
  "timestamp": "ISO-8601",
  "actorId": "uuid-user",
  "projectId": "uuid-project",
  "data": {}
}
```

| Event | Room | Trigger | Payload data |
|---|---|---|---|
| task.created | project:{projectId} | Task inserted | taskId, title, status, priority |
| task.updated | project:{projectId} | Task attributes changed | taskId, changes |
| task.status_changed | project:{projectId} | Kanban transition | taskId, oldStatus, newStatus |
| task.assigned | project:{projectId} + user:{assigneeId} | Assignee added/removed | taskId, assigned |
| task.deleted | project:{projectId} | Task archived/deleted | taskId |
| comment.created | project:{projectId} | Comment inserted | commentId, taskId, body |
| comment.updated | project:{projectId} | Comment edited within 15 min | commentId, taskId, body, updatedAt |
| comment.deleted | project:{projectId} | Comment deleted | commentId, taskId |
| project.updated | project:{projectId} | Project fields changed | projectId, changes |
| notification.created | user:{userId} | Notification persisted | notificationId, type, payload |
| risk.detected | project:{projectId} | PIRAE creates risk | riskId, riskType, severity, reason |
| risk.updated | project:{projectId} | Risk lifecycle changes | riskId, status, resolvedAt |
| membership.changed | project:{projectId} | Team/project membership changes | userId, role, action |

Authorization is checked before room joins. Reconnection uses exponential backoff and missed-event recovery. The 13-event catalogue is frozen; do not create extra event names without an approved requirement change.

## 9. Analytics and PIRAE rules

### Basic analytics (MVP)
- Completion percentage, overdue count, status distribution, priority distribution and per-member workload.
- Must use actual persisted records; all aggregates must reconcile to source tasks/projects.

### Extended analytics
- Cycle time where feasible, completion trends, dependency blocking and project risk trends.

### PIRAE scoring
- **Workload:** ratio = estimated_active_hours / configured_capacity_hours. <=0.70 Low; >0.70–0.90 Medium; >0.90–1.20 High; >1.20 Critical.
- **Delay:** `min(100, max(0, (1 - remaining_days / max(1,total_days))*50 + (remaining_effort_hours / max(1,configured_capacity_hours))*50))`; if projected completion exceeds project deadline by >20%, severity is forced to HIGH.
- **Dependency:** overdue blocker and task not DONE => 100; blocker due within 24h => 70; blocker at risk => 40; otherwise 0.
- **Priority:** HIGH/CRITICAL and due <=24h and not DONE => 90; HIGH/CRITICAL due <=3 days => 70; MEDIUM due <=24h => 50; MEDIUM due <=3 days => 20; otherwise 0.
- For delay/dependency/priority: score <=40 Low, 41–70 Medium, >70 High. Workload is the only rule with Critical severity under the frozen rule set.
- Risk record includes type, score 0–100, severity, reason, recommendation, generated timestamp, status and resolved timestamp.
- Mutations enqueue async jobs (BullMQ/Redis) and evaluate within 5 seconds; full re-evaluation runs daily at 00:00 UTC. No synchronous risk computation in the API request path.

## 10. Error handling, accessibility and deployment constraints

### Error handling
- Consistent success/error envelope and stable error codes.
- Field-level validation and HTTP 422 for malformed input.
- Explicit handling for unauthenticated, forbidden, not-found, conflict, locked-account and rate-limited states.
- Never silently swallow API/socket errors; display a recoverable user-facing state and preserve safe form input.
- Socket disconnection/reconnection and missed-event recovery must be visible/handled; reconcile local cache against authoritative REST data after reconnect.
- Correlation IDs support tracing requests and audit entries.

### Accessibility/usability
- WCAG 2.1 AA where feasible; keyboard navigation and accessible contrast.
- Core task creation must be completable by a new user within 5 minutes.
- Core workflows understandable to non-technical users.
- Responsive desktop/tablet UI; no color-only encoding of status/risk.
- Provide keyboard-accessible alternatives to drag-and-drop and accessible form labels/errors.

### Deployment/operations
- Docker Compose with frontend/backend/PostgreSQL/Redis/Nginx.
- Nginx HTTP + WebSocket proxy; set `Upgrade` and `Connection: upgrade` headers and suitable timeouts.
- HTTPS/TLS 1.3; environment-specific CORS; secure environment variables/secrets; secure HTTP headers.
- Prisma migrations; dev/demo seed data; GitHub CI/CD; documented backups.
- RPO 24h and RTO 4h for FYP; health endpoint includes application and dependency status; logging/error tracking required.
- Keep DB access restricted; Redis supports refresh sessions, JTI blacklist, Pub/Sub and queues, not primary persistence.
- >=80% test coverage for critical modules; test auth/RBAC, constraints, APIs, real-time, PIRAE, security and performance.

## 11. Requirement phasing (authoritative SRS §2.7)

- **MVP M1:** Auth + RBAC + Teams + Projects + Tasks + Kanban.
- **MVP M2:** Comments + Notifications + Basic Analytics.
- **MVP M3:** Basic real-time collaboration (socket auth, project rooms, task/comment/notification events, Redis Pub/Sub, multi-client sync).
- **Extended M4a:** Advanced real-time, dependencies, mentions, attachments.
- **Extended M4b:** Advanced analytics + audit.
- **Extended M4c:** PIRAE after analytics/audit are stable.
- **Production M5:** HTTPS, Nginx, Docker, backup, CI/CD, logging, monitoring and security hardening.

The exact requirement buckets in §2.7 govern phase assignment where a requirement's row or a supporting artifact appears inconsistent.

## 12. Evidence and reconciliation notes

- Primary evidence: SRS 3.0 sections 1–12, especially §§2.5–2.7, 3.1, 4.1–4.16, 5.1, 6.2, 7, 8, 9, 10 and Appendix A/G/I.
- Companion API evidence: OpenAPI 3.1 document paths and schemas. Its metadata labels itself version 2.1.0; that label is not used to downgrade or override SRS 3.0.
- User instruction: ignore versioning, duplicate IDs and requirement-organization mistakes in supporting artifacts; preserve distinct behaviour only when compatible with SRS 3.0.
- **Reconciliation limitation:** Sprint 1–14 and Errata DOCX files are present in `public/assets/aistudio/`, but their full body text has not yet been successfully extracted in this pass. Therefore, this catalogue is a substantial SRS 3.0 + OpenAPI baseline, but must not yet be represented as the final cross-artifact reconciliation of every supporting document. Next step is to extract/review those artifacts and add only compatible missing detail, without duplicating requirements.


## 13. Cross-artifact reconciliation — requirements accepted from the Sprint and Errata artifacts

This section records the cross-check of the complete `public/assets/aistudio/` document set. Supporting artifact names are kept as provenance, not as competing baseline versions. Old SRS/version labels and duplicate/misorganized requirement identifiers are ignored as instructed; distinct behaviour is retained only when compatible with SRS 3.0.

### 13.1 Artifact inventory and coverage

| Source artifact | Main content reviewed | Catalogue areas reconciled |
|---|---|---|
| `SRS_3.0_CONSOLIDATED_BASELINE_e782668d.md` | Authoritative scope, FR/NFR, roles, frozen data dictionary, event list, PIRAE rules, deployment, phase ordering | §§1–12; normative authority |
| `OpenApi-Specification.txt` | OpenAPI 3.1 paths, request/response schemas, security declarations, error responses, pagination and server URLs | §7 and API gap register |
| `ERRATA SHEET,.docx` | E-001 onward, authorization drift, status-code mismatch, module-boundary problems, session/logout caveat, later artifact corrections | §§5, 7, 10, 14 |
| `Sprint 1 — Repository Scaffolding (Kickoff).docx` | Monorepo/workspace layout, React/Vite frontend, Express API, shared socket contract, config, validation, routes, CI/deployment references | §§1, 3, 10, 11 |
| `SPRINT 2 MODULE AUTH BACKEND + FRONTEND .docx` | Auth vertical slice, frontend session lifecycle, login/refresh/logout, token handling, protected routes, auth query/client behaviour | §§2.1, 2.2, 5, 7, 10 |
| `Sprint 3 MODULE USERS + RBAC … .docx` | User administration, global role matrix, permission middleware, membership checks, resource-level authorization | §§2.2, 5, 6, 7 |
| `Sprint 4 Teams Module (Backend+Frontend).docx` | Team CRUD/members, membership events, audit, corrected Team Owner authorization | §§2.3, 5, 6, 8, 14 |
| `Sprint 5 ARTIFACT 26 — Projects Module … .docx` | Project CRUD/archive, project membership, project-level role semantics, project audit, role restrictions | §§2.4, 5, 6, 7, 14 |
| `Sprint 6 Task module … .docx` | Task CRUD, field persistence, assignment, subtasks, status/priority enums, task history/audit, task real-time events | §§2.5, 2.6, 5, 6, 8, 14 |
| `Sprint 7 MODULE KANBAN + DEPENDENCIES … .docx` | Kanban transitions, dependency CRUD, cycle detection, DONE gate, status event, all mutation paths | §§2.5–2.6, 5, 8, 14 |
| `Sprint 8 module comments + mentions … .docx` | Comment CRUD, mentions, project membership checks, 15-minute edit window, events and audit | §2.8, §§5, 6, 8 |
| `Sprint 9 notification module … .docx` | Persistent notifications, producers, offline delivery, ownership boundary, read/unread and retention | §2.9, §§5, 6, 8, 14 |
| `sprint 10 module attachment … .docx` | Multipart upload, 10 MB cap, MIME/magic-byte checks, storage abstraction, XOR and access control | §2.10, §§5, 6, 7, 14 |
| `Sprint 11 MODULE ANALYTICS … .docx` | Project summary, workload, overdue list, cycle time, trends, dependency blocking, risk trends, read-only behavior | §2.11, §§6, 7, 9, 14 |
| `Sprint 12 MODULE AUDIT … .docx` | Audit query/filtering/pagination, append-only DB trigger, read permissions and project-scoped PM visibility | §2.12, §§5, 6, 7, 14 |
| `Sprint 12 continued MODULE PIRAE … .docx` | Risk rule implementation, worker/cron, risk lifecycle proposals, risk identity/scope, frontend risk views | §2.13, §§6, 9, 14 |
| `Sprint 13 module deployment..docx` | Production Compose, secrets, TLS, Nginx, WebSocket headers, backups, health, logging, rollback/restore | §§3, 10, 11, 14 |
| `Sprint 14 FINAL DOCUMENTATION.docx` | User guide, demo/viva material, operational guidance and consolidation of prior artifacts | §§1, 10, 11, 14 |

### 13.2 Supplemental requirements accepted as compatible with SRS 3.0

These details add implementation precision without replacing the SRS.

#### Authentication, session and frontend behaviour
- The auth flow is a vertical slice: login, access-token handling, refresh, logout, current-user/profile, password change, protected routes and session-aware socket lifecycle.
- The browser must not assume that deleting local storage alone revokes a server session. Logout must call the server revocation endpoint and clear client state even when the access token has expired; see open issue E-007 below.
- User administration belongs to the Users module. Auth and Users must not retain duplicate route ownership or orphaned update/role/status service implementations.
- Registration schema/password schema are shared validation contracts when consumed by more than one module; do not deep-import internal files across module boundaries.
- Frontend route guards and permission-based controls are usability features only. Every API operation and Socket.IO room join must independently enforce backend authorization.

#### Team and project governance
- Team creation is System Administrator-only; team membership modification is System Administrator or Project Manager, matching FR-AUTH-12/FR-TEAM-03 and the corrected Teams artifact.
- A Team Member's membership descriptor must never grant global authorization. The SRS team-role values are `Admin-Assigned` and `Member`; the old `Owner` authorization path is rejected.
- Project-level role is distinct from global role. A global Project Manager who is a project Contributor must not automatically receive project-Manager-only operations merely because of their global role; global permission and project membership/resource scope both apply.
- Project creation is restricted by the permission matrix to Administrator/Project Manager. Project update/archive and membership changes require the appropriate global grant plus valid project membership and project-level authorization.
- Sprint 5 describes a “last project Manager must remain” invariant. This is a supporting-artifact safeguard, not an explicit SRS 3.0 FR. Treat it as a proposed business rule requiring product confirmation before adding it as a mandatory prototype rule.

#### Task, Kanban and dependency behaviour
- Dependency direction is explicit: `blocking_task_id` is the prerequisite and `blocked_task_id` is the dependent task. Reject self-dependencies, duplicate edges, invalid/missing task references and cycles; cross-project dependency behaviour must be rejected unless a future approved requirement says otherwise.
- Dependency CRUD is part of the SRS MVP set (FR-TASK-07); the DONE-transition gate is Extended (FR-TASK-15/FR-KAN-03). When the gate is implemented, it must apply to every path that can transition a task to DONE—not just the dedicated Kanban endpoint.
- A task's assignees are represented by the `task_assignees` join relation; subtasks remain embedded JSONB; dependencies remain in `task_dependencies`. Do not conflate these three structures.
- A status mutation must persist the authoritative change before broadcasting. Audit/correlation records and notifications must be committed consistently with the mutation where required. Rejected transitions must not leave the client displaying a state the server did not accept.
- Sprint 7 explicitly notes that reopening a blocker does not automatically cascade changes to already-DONE downstream tasks; the DONE gate is checked when a task transitions to DONE. This is a compatible implementation detail, not a requirement to automatically reopen dependent tasks.

#### Comments, mentions and notifications
- A mention target must be a valid user who is a member of the task's project. Mentioning a non-member must be rejected; a mention is not permission to access the project.
- Comment author can edit only within 15 minutes. The service must check authorship and elapsed time on the server, update the edit timestamp and emit the frozen `comment.updated` event.
- The Sprint 8 artifact proposes comment deletion by author or project Manager/Admin, and distinguishes `COMMENT_ADD` from `COMMENT_MENTION`. Preserve the permission split; the precise deletion policy should follow the RBAC matrix/error catalogue and not be broadened by the UI.
- Notification ownership is the recipient's `userId`; a user may list/mark-read only their own notifications, regardless of global role. Notifications are persisted, then made available in real time to online users; offline users retrieve them from the database.
- Compatible notification categories from Sprint 9 are: `TASK_ASSIGNED`, `TASK_STATUS_CHANGED`, `TASK_DUE_SOON`, `COMMENT_CREATED`, `COMMENT_MENTIONED`, `RISK_DETECTED`, and `RISK_UPDATED`. Event producers should be shared module services, not duplicated notification logic inside each controller.
- SRS retention is 6 months for notifications, at least 12 months for audit records and risk assessments, and until deletion/project archival for attachments.

#### Attachments
- Maximum size is 10 MB per file.
- Accepted file families specified by Sprint 10: PDF, PNG, JPG/JPEG, DOCX, XLSX and TXT. Validate both the declared type/extension and file magic bytes; declared `Content-Type` alone is not trustworthy.
- Exactly one of `taskId` or `commentId` is required. Enforce this in request validation, service logic and a database CHECK constraint.
- File bytes live in backend-controlled storage; PostgreSQL stores metadata only. Use a provider-neutral `storage_key`; derive download access through an authenticated endpoint, not a permanent public URL. Do not expose internal storage keys to ordinary clients.
- Download permission is scoped to an authorized project member; upload requires `ATTACHMENT_UPLOAD` plus project/resource access. Deletion is restricted to the uploader and/or authorized project manager/admin according to the artifact's policy and the finalized permission matrix.
- No new attachment-specific Socket.IO event is allowed: CA-07/SRS §7 freezes exactly 13 events. Attachment UI should invalidate/refetch its attachment query after a successful mutation unless a future approved change explicitly revises the event contract.

#### Analytics
- Basic metrics must be read-only and computed from persisted records: completion %, overdue tasks, status distribution, priority distribution and workload per member.
- Sprint 11 defines useful workload detail fields: active task count, estimated remaining effort, overdue task count and active HIGH/CRITICAL task count.
- Extended analytics include cycle time, completion trends, dependency blocking and project risk trends. The Sprint artifact proposes routes for these as described in §15; they are not all present in the current OpenAPI file and therefore require contract reconciliation before implementation.
- A metric must state its project and time scope, handle an empty project and reconcile with source records. No hard-coded chart values or fabricated “live” data in the prototype.

#### Audit and PIRAE
- Audit reads are Admin-global and Project-Manager project-scoped; a PM must not query other projects' audit records. Team Members/Viewers are denied the audit screen/API unless the finalized matrix explicitly grants a narrower operation.
- Audit list supports filters for entity type/ID, actor, action, time range and correlation ID, plus standard pagination. It is read-only. Database triggers must reject UPDATE and DELETE, not merely hide UI controls.
- Every mutation that requires audit writes actor, action, entity type/ID, old/new values, timestamp and non-null correlation ID. Capture task create/assignment/status/deadline/priority, project state and membership changes.
- PIRAE workload is project-scoped in the Sprint 12 design because each risk record belongs to a project. This is a documented scope limitation: it does not measure a user's aggregate workload across all projects.
- Workload severity is derived directly from ratio using SRS thresholds. For Delay/Dependency/Priority, use SRS score bands. Critical severity is reserved for workload ratio >1.20; do not invent a universal Critical band for other risk types.
- The PIRAE artifact proposes a workload score `min(100, round(ratio * 70))`, persistence of actionable Medium-or-higher risks, and creating a fresh risk record if a previously resolved condition recurs. These are artifact-level implementation choices not fully specified by SRS 3.0; preserve them only if confirmed against the current risk schema/acceptance tests. Never let them override the SRS severity formulas.
- PIRAE execution is asynchronous (BullMQ/Redis), expected within 5 seconds after relevant mutations, plus a daily 00:00 UTC full evaluation. Resolving a risk changes risk lifecycle only. PIRAE must not mutate tasks, deadlines, assignments or project state.
- A risk record requires a stable target identity (task for Delay/Dependency/Priority; user for Workload) to avoid conflating multiple risks of the same type in one project. The frozen SRS data dictionary does not currently define a `target_id`/task/user target column; see G-06 in §15 before schema work.

#### Deployment and operations
- Development/prototype and production configuration must be separated. Never commit production secrets; use environment variables/secrets and an explicit CORS allowlist.
- Docker Compose includes frontend, backend, PostgreSQL, Redis and Nginx; migration and seed are explicit operational tasks. Production artifacts additionally propose separate worker/scheduler, backup sidecar, TLS renewal and blue/green deployment; treat blue/green/sidecars as production implementation options, not new product features.
- Nginx must proxy WebSocket Upgrade/Connection headers; enforce upload body cap consistently with the 10 MB attachment policy.
- Backups include PostgreSQL and uploaded file storage; RPO 24 hours and RTO 4 hours are FYP-level targets. Restore drills, health checks and structured logs are operational verification, not just documentation.
- CI/CD should run lint/typecheck/unit/integration/API/real-time/security tests and enforce >=80% coverage on critical modules. The final production hardening target is 1,000 concurrent authenticated users, API p95 <=500 ms and real-time latency <=200 ms.

## 14. Binding reconciliation decisions

The following decisions are binding for the catalogue and any later prototype phase.

| Decision | Binding rule | Supporting evidence / consequence |
|---|---|---|
| R-01 — Baseline precedence | SRS 3.0 overrides all older SRS labels, Sprint prose, duplicated IDs and prior implementation assumptions. | SRS 3.0 declares itself the consolidated authoritative baseline. |
| R-02 — Authorization source | Global authorization comes from the RBAC permission matrix; project membership/role may further restrict access but never grant global authority. | SRS §4.2/App. A; Errata E-001. |
| R-03 — Team roles | Persist SRS team roles `Admin-Assigned` and `Member`. `Owner` is not a role or authorization principal. | SRS §4.2/§6.2; CH-44; Errata E-001. |
| R-04 — Role scopes | Global role, team role and project role are distinct fields with distinct scopes. | SRS role mapping table; Sprint 3/5. |
| R-05 — Team management | Create Team = Administrator only; manage membership = Administrator + Project Manager. Do not grant authority to a team Owner. | FR-AUTH-12, FR-TEAM-03, CA-05, corrected Sprint 4. |
| R-06 — Project manager restrictions | Project membership and project role must be checked in addition to global permission. Project Manager global role alone does not bypass a project Contributor/Viewer role. | FR-RBAC-04/05; Sprint 5 and Sprint 7 preventive measures. |
| R-07 — Task state | Status exactly TODO/IN_PROGRESS/DONE; priority exactly LOW/MEDIUM/HIGH/CRITICAL. | CA-01/09, SRS §4.5/§6.2. |
| R-08 — Dependency model | Relational task_dependencies with unique (blocking_task_id, blocked_task_id); no tasks.dependencies JSONB. | CA-11; SRS §6.2. |
| R-09 — DONE gate | Validate blockers before any transition to DONE in every applicable update path. Phase Extended, not a reason to omit dependency CRUD from MVP. | FR-TASK-15, FR-KAN-03; Sprint 7 caught bypass via generic PATCH. |
| R-10 — Comment edit | Author-only edit, <=15 minutes, server-enforced, timestamp updated, comment.updated emitted. | FR-COMM-03/04, AC-COL-03. |
| R-11 — Notifications | User ownership boundary, PostgreSQL persistence and offline retrieval; no reliance on socket delivery alone. | FR-NOTIF-01–04, Sprint 9. |
| R-12 — Attachments | XOR parent; 10 MB; allowlisted file families and magic-byte validation; no attachment-specific socket event. | FR-ATT-01–05, AC-DATA-07, Sprint 10 Errata E-021. |
| R-13 — Frozen events | Implement exactly the 13 events in SRS §7.2 with the standard envelope and room policy. Do not add `attachment.created` or `team.updated` without baseline change. | CA-07, Sprint 10 correction. |
| R-14 — Audit | Append-only, 12-month retention; Admin global, PM only within authorized project scope; filter/paginate read endpoints. | FR-AUD-01–06, SRS App. A, Sprint 12 E-028/E-029. |
| R-15 — PIRAE | Async only, 5-second target, daily UTC schedule, advisory only; workload severity by ratio; Critical only for workload. | FR-PIRAE-01–08, SRS §8, Sprint 12. |
| R-16 — API envelopes | Use standard success/error envelopes and pagination metadata. Exact operation schema/status must be reconciled with OpenAPI, not guessed from frontend screens. | FR-API-01–08. |
| R-17 — Prototype data | Clearly distinguish seeded/demo data from server-backed data. No fake production metrics. | FR-AN-06; Sprint 11/14. |
| R-18 — Security boundary | Client-side route/button checks do not replace server auth, resource checks, or socket room checks. | DC-06, NFR-AUTH-01/02. |

## 15. Conflict, contradiction and gap register

**Status definitions:** **Resolved by SRS** = implement SRS rule now; **Contract gap** = do not guess; update the schema/OpenAPI before claiming full compliance; **Non-normative proposal** = supporting artifact idea requires product approval.

| ID | Topic | SRS 3.0 baseline | Supporting artifact divergence / gap | Resolution / action |
|---|---|---|---|---|
| G-01 | Team Owner role | `team_members.role` is `Admin-Assigned` or `Member`; authority comes from global role matrix. | Earlier Teams artifact used `Owner` and initially treated it as authority; Errata E-001 corrected the authorization bug but historical prose still contains Owner language. | **Resolved by SRS.** Ignore Owner as role/permission. Do not implement last-owner checks unless a separate non-role ownership concept is approved. |
| G-02 | Team error status | Error catalogue's corrected decision is `TEAM_OWNER_REQUIRED` -> 409 Conflict, but the Owner concept is not in SRS 3.0 role schema. | Errata E-002 resolves 400 vs 409 in favour of 409. | **Partly resolved.** 409 is correct for genuine state conflicts; do not create an Owner-specific UI flow under the SRS team-role model. |
| G-03 | Project dates | FR-PROJ-02 requires objectives, start date, end date, status and priority. | Frozen `projects` dictionary has description, status, priority and deadline, but no explicit start_date or end_date pair; Sprint 5 admits it substituted createdAt for start date. | **Contract/schema gap.** Do not silently use createdAt as start date. Reconcile Project DTO/schema/migration to represent required dates before claiming FR-PROJ-02 complete. |
| G-04 | Task start date / cycle time | FR-TASK-04 includes start date; FR-TASK-14 adds start dates (Extended). FR-AN-07 cycle time is Extended. | Frozen `tasks` dictionary has no `start_date` or `completed_at`; Sprint 6/11 uses them in implementation/design. | **Contract/schema gap.** Add approved migration/DTO fields or derive cycle-time data from audited state transitions; do not imply the frozen schema already contains them. |
| G-05 | Login identifier | FR-AUTH-01 says email/username. | Frozen users dictionary contains unique email but no username column; OpenAPI LoginRequest needs checking against the exact schema. | **Contract gap.** Email login is implementable from current dictionary; username login requires a schema decision. Do not add an undocumented username field silently. |
| G-06 | Risk target identity | SRS risk_assessments requires project_id, type, score, severity, reason, recommendation, status, resolved_at and generated_at. | PIRAE implementation needs user target for WORKLOAD and task target for DELAY/DEPENDENCY/PRIORITY, but frozen dictionary has no target/task/user column. | **Contract/schema gap.** Add a target discriminator + target UUID or explicit nullable task/user FKs with constraints and uniqueness rules before claiming multi-risk-per-project correctness. |
| G-07 | Project status/priority enum | SRS data dictionary gives project status default Active and priority default Medium, but does not freeze complete enums/CHECK constraints for project values. | Sprint 5 proposes Active/OnHold/Completed/Archived and uses a shared Priority type. | **Contract gap.** Keep only documented defaults until a project-specific enum is approved; do not assume task priority enum is also the project priority contract. |
| G-08 | Audit permissions | Appendix A grants Admin global audit and PM scoped audit; NFR-PRIV-01 restricts access to authorized data. | Early Sprint 12 wording considered Admin/PM globally, then E-028 narrows PM to project scope. | **Resolved by SRS + Errata.** Admin global; PM scoped to authorized projects; Team Member/Viewer denied. |
| G-09 | API extended analytics | FR-AN-07..10 require cycle time, trends, dependency blocking and risk trends. | OpenAPI includes summary/workload/overdue, while Sprint 11 proposes `/trends`, `/dependencies`, `/risks` analytics routes. | **Contract gap.** Requirements remain in scope (Extended); update OpenAPI before using those proposed paths as frozen endpoints. |
| G-10 | Notification unread count | FR-NOTIF-01..04 require generation, persistence, realtime and offline retrieval; standard read endpoints are defined. | Sprint 9 adds `GET /notifications/unread-count`; current OpenAPI has list/read/read-all but not unread-count. | **Optional API extension.** Useful UI count may be derived from paginated/read state; do not treat the endpoint as frozen until OpenAPI is updated. |
| G-11 | Attachment list routes | SRS defines attachment metadata and upload/download/delete; OpenAPI defines POST/GET-by-id/DELETE. | Sprint 10 proposes `GET /tasks/:taskId/attachments` and `GET /comments/:commentId/attachments`, not in OpenAPI. | **Contract gap.** UI may use parent DTOs only if contract supplies attachment refs; otherwise add explicit list endpoints to OpenAPI. |
| G-12 | Attachment events | Frozen catalog has exactly 13 events, no attachment-specific event. | Sprint 10 considered task.updated/comment.updated extensions, then chose no new event. | **Resolved.** No attachment event; invalidate/refetch attachment query after mutation. |
| G-13 | Attachment size/type | SRS requires type/size validation but does not enumerate these values in the FR row. | Sprint 10/13 sets 10 MB and PDF/PNG/JPG/JPEG/DOCX/XLSX/TXT allowlist. | **Compatible supplemental policy.** Use 10 MB and the allowlist unless a later approved SRS policy changes them; magic-byte validation is required by artifact. |
| G-14 | PIRAE risk persistence/lifecycle | SRS defines scoring, severity, Open/Resolved, resolved_at; it does not fully prescribe re-open/history semantics or minimum persisted severity. | Sprint 12 proposes Medium+ persistence, auto-clear/reopen variants at different points, and fresh rows for recurring resolved risks. | **Non-normative proposal / inconsistent artifact.** Follow only the final Sprint 12 decision where tests/schema agree; otherwise record explicit product decision. Never alter SRS severity formula or advisory-only invariant. |
| G-15 | Workload risk scope | SRS risk row belongs to a project but does not explicitly state whether workload aggregates across all projects. | Sprint 12 decides project-scoped workload and documents global aggregation as future work. | **Compatible design decision, explicitly scoped.** Treat as project-scoped for FYP and state the limitation in UI/help; do not imply global workload analysis. |
| G-16 | Workload risk score | SRS freezes ratio and severity thresholds but not a score mapping from ratio to 0–100. | Sprint 12 proposes `min(100, round(ratio * 70))`. | **Supplemental implementation choice.** Can be used if kept separate from severity derivation and validated by boundary tests; the ratio determines severity. |
| G-17 | Analytics data model | FR-AN-07 cycle time, FR-AN-08 trends and FR-AN-10 risk trends require historical/time-series inputs. | Frozen task dictionary lacks completed_at; artifact suggests deriving cycle time from completedAt-createdAt; audit history may be the only existing source. | **Contract gap.** Define the authoritative timestamp/source before calculating metrics. Never fabricate history for tasks that predate tracking. |
| G-18 | Project membership vs global roles | SRS requires global role + membership + resource-level authorization. | Some artifact snippets discuss role grants in a way that can be read as global role alone bypassing project scope. | **Resolved by SRS.** Evaluate global permission, membership and project-role restrictions as a combined chain. |
| G-19 | Error status mapping | SRS/OpenAPI distinguish 401, 403, 404, 409, 422, 423 and 429. | Errata documents occasional catalog/code mismatch and old artifacts contain stale statuses. | **Contract-first.** Update error catalogue and tests together; frontend maps actual API code/status and must not guess from older Sprint text. |
| G-20 | Expired-token logout | FR-AUTH-11 requires logout to revoke refresh session and blacklist JTI. | Errata E-007 notes a logout path that requires a valid access token, so an expired access token can make logout return 401 while refresh remains. | **Known issue.** Logout/session cleanup must revoke the refresh session even when access token expired, using a safe session identifier/refresh-token flow; do not call this fully satisfied until fixed/tested. |
| G-21 | Module boundaries | Shared module contracts should be exported via public module entry points; deep imports are forbidden. | Errata E-003 catches users importing registerSchema from auth internals; E-006 catches orphaned duplicated auth service methods after Users extraction. | **Resolved design rule.** Use shared/core validation and single module ownership; do not duplicate auth/user mutation logic. |
| G-22 | Team metadata permission name | SRS has TEAM_CREATE and TEAM_MANAGE_MEMBERS, not TEAM_UPDATE. | Errata E-005 notes PATCH team metadata uses TEAM_MANAGE_MEMBERS as the available Admin/PM umbrella permission. | **Known semantic compromise.** Follow SRS authority, document the route policy, do not invent TEAM_UPDATE without approved RBAC/OpenAPI change. |
| G-23 | Audit retention | SRS says >=12 months; audit artifact includes query filters and append-only triggers. | No material conflict. | **Accepted.** Preserve retention, filter/pagination, DB-level append-only enforcement and scoped query access. |
| G-24 | Availability | SRS freezes 90% monthly FYP target and 99.5% future production target. | Deployment artifact includes production blue/green and health probes. | **Resolved.** 90% is the current FYP target; 99.5% is future architecture target, not a current guarantee. |
| G-25 | Realtime event names | SRS catalog is frozen at 13. | Older artifacts sometimes discuss `kanban.*`, `team.updated`, attachment events or extra notification events. | **Resolved.** Use the 13 frozen names only; map board state changes to task.updated/task.status_changed and membership changes to membership.changed. |
| G-26 | Team room naming | SRS room strategy names `project:{projectId}` and `user:{userId}`; Errata CA-07 addendum mentions `team:{teamId}` for team-scoped membership.changed. | The team room is an additive detail in Errata, not part of the original two-room list. | **Scoped extension.** Do not create a general team-wide event ecosystem; for membership.changed with scope='team', use the corrected addendum only if implementing team-room subscriptions, and keep authorization checks mandatory. |
| G-27 | Task dependency validation timing | FR-TASK-07 is MVP; FR-TASK-15/FR-KAN-03 DONE gate is Extended. | Sprint 6 initially defers dependency endpoints to Sprint 7, but Sprint 7 makes clear the dependency CRUD is a separate later sprint, not out of MVP. | **Resolved by SRS phase table.** Dependency CRUD is MVP; DONE gate is Extended. Sprint ordering is not a reason to reclassify requirement priority. |
| G-28 | Test-case IDs and artifact numbering | SRS appendix RTM is representative and older docs contain duplicated/misaligned FR/TS IDs. | Supporting docs have FR-CPMM typo and changing artifact/sprint numbers. | **Ignored as instructed.** Track by unique requirement behaviour and canonical SRS ID; do not create duplicate catalogue rows because of typo/numbering drift. |

### 15.1 Schema decisions required before full implementation

The following items are not safe to silently “fix” in the frontend. They need a coordinated SRS-compatible schema/API decision:
1. Add explicit project start/end dates required by FR-PROJ-02.
2. Add task start date for Extended FR-TASK-14 and decide authoritative completion timestamp for cycle-time analytics.
3. Decide whether login accepts email only or add a username column and uniqueness/normalization rules.
4. Add a risk target identity model to support per-task and per-user risks without collapsing multiple records.
5. Freeze project status/priority enum values and their validation rules.
6. Update OpenAPI for extended analytics and any chosen unread-count/attachment-list routes.
7. Define the final PIRAE open/resolved/reoccurrence policy and test it against risk identity constraints.

## 16. Permission matrix — practical frontend interpretation

This table is a user-interface summary only; the backend permission matrix remains authoritative.

| Capability | Administrator | Project Manager / Team Lead | Team Member | Viewer / Stakeholder |
|---|---|---|---|---|
| Manage users/global roles/config | Yes | No | No | No |
| Create team | Yes | No | No | No |
| Manage team members | Yes | Yes | No | No |
| Create/update/archive projects | Yes | Yes* | No | No |
| Manage project members | Yes | Yes* | No | No |
| View authorized project/task | Yes | Yes | Yes | Yes |
| Create/update tasks | Yes | Yes* | Yes* | No |
| Delete/archive tasks | Yes | Yes* | Limited only if matrix/policy permits | No |
| Assign tasks | Yes | Yes* | Limited* | No |
| Change task status/Kanban | Yes | Yes* | Yes* | No |
| Manage dependencies | Yes | Yes* | Limited* | No |
| Add comments/mentions | Yes | Yes* | Yes* | No |
| Edit own comment within 15 min | Yes | Yes* | Yes* | No |
| Delete comments | Yes | Yes* | Limited* | No |
| Upload attachments | Yes | Yes* | Yes* | No |
| View/download attachments | Yes | Yes* | Yes* | Yes* if project member |
| View basic analytics | Yes | Yes* | Yes* | Yes* |
| View audit | Global | Authorized project scope only | Limited per matrix; no general audit screen | No |
| View PIRAE insights | Yes | Yes* | Limited* | No |
| Notifications | Own records | Own records | Own records | Own records |

`*` = only when project/team membership, project-level role, assignment/resource policy and endpoint permission allow it. Global role must not bypass a stricter project role. A Viewer may read data only for projects they are authorized to access.

## 17. Final baseline acceptance checklist for Deliverable A

Deliverable A is considered complete when each item below is satisfied in the catalogue and preserved for the next traceability phase:

- [x] SRS 3.0 used as the sole normative baseline.
- [x] All 15 Sprint DOCX artifacts and the Errata Sheet reviewed for compatible requirements and contradictions.
- [x] OpenAPI operations inventoried and contract mismatches explicitly recorded.
- [x] Functional requirements organized by module without duplicating IDs.
- [x] Non-functional requirements include measurable targets and verification method.
- [x] UI/UX requirements separated from non-normative design preferences.
- [x] Business rules include role scope, state transitions, edit windows, notification durability, attachment XOR and PIRAE non-autonomy.
- [x] Domain model includes all 15 frozen entity groups, FK/default/CHECK/UNIQUE constraints and mandatory indexes.
- [x] Frozen 13-event contract captured, with unauthorized event additions rejected.
- [x] PIRAE formulas and threshold rules reconciled to SRS 3.0.
- [x] Deployment, security headers, TLS, backup, RPO/RTO, health, logs, CI/CD and testing targets captured.
- [x] Errata decisions and artifact-only additions distinguished from SRS-mandated requirements.
- [x] Unresolved schema/API gaps explicitly listed rather than hidden behind frontend assumptions.
- [x] Prototype must not be modified in the next step until Deliverable B traceability/audit preparation is based on this catalogue.

**Deliverable A conclusion:** the requirements are now consolidated across the SRS 3.0 baseline, OpenAPI contract, Sprint 1–14 documents and Errata Sheet. The requirements catalogue is complete as a cross-artifact requirements analysis; G-03 through G-07 and other items in §15 are not missing analysis—they are identified design/schema/API gaps that must remain visible until formally resolved.
