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
- **FR-TASK-07:** Store dependencies in the relational `task_dependencies` table; do not use a `tasks.dependencies` JSONB field.
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
- **FR-ATT-05:** Exactly one of `task_id` and `comment_id` must be non-null (XOR).
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
