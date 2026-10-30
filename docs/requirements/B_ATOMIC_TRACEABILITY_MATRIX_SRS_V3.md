# B. Atomic Requirements Traceability Matrix — SRS 3.0

**Project:** Real-Time Team Project Management Platform with Predictive Insights  
**Authoritative baseline:** `public/assets/aistudio/SRS_3.0_CONSOLIDATED_BASELINE_e782668d.md`  
**Companion baseline:** `docs/requirements/A_MASTER_REQUIREMENTS_CATALOGUE_SRS_V3.md`  
**Supporting sources reconciled:** OpenAPI specification, Errata Sheet, Sprint 1–14 artifacts in `public/assets/aistudio/`.  
**Branch:** `audit/srs-v3-requirements-enhancement`  
**Purpose:** Define atomic, observable acceptance checks for every normative requirement before performing the frontend audit.  
**Audit status:** **Not assessed in this deliverable.** Status cells intentionally remain unassessed until Deliverable C maps checks to repository evidence and repeatable tests.

## 1. Rules of interpretation

1. SRS 3.0 is the single normative source. Supporting artifacts provide compatible detail only; conflicts are resolved according to Deliverable A.
2. The matrix preserves canonical parent SRS IDs and adds stable child IDs (for example `FR-AUTH-11.a`) where a requirement has multiple independently verifiable behaviours.
3. A requirement is **Pass** only when both implementation evidence and a repeatable test demonstrate the stated acceptance criteria. A screen, mock record, local-storage update, or button click alone does not prove backend, security, persistence, or real-time compliance.
4. **Prototype UI** and **production/system** acceptance are deliberately separated. The frontend may demonstrate an interaction while the end-to-end requirement remains unproven until connected to the authoritative API/database/socket service.
5. Status vocabulary for Deliverable C: **Pass**, **Partial**, **Fail**, **Not implemented**, **Not applicable (approved scope decision only)**, **Blocked by contract gap**, **Not tested**. “Out of scope” must cite an explicit SRS phase or exclusion; it must not be inferred from absence.
6. Parent phases: **MVP**, **Extended**, **Production Hardening**, **Future target**, or **Cross-cutting**. Do not reclassify requirements because a Sprint document implemented them later.
7. The SRS has some genuine contract/schema gaps called out in Deliverable A §15. Their acceptance checks remain visible and use **Blocked by contract gap** until the relevant schema/API decision is approved.
8. Each test should record test ID, preconditions/role, action, expected result, observed result, evidence path, test environment/build, and reviewer/date.

## 2. Traceability fields

| Field | Meaning |
|---|---|
| Atomic ID | Unique testable requirement/check ID in this matrix |
| Parent ID | Canonical SRS requirement, frozen event, data dictionary, NFR, or explicit design constraint |
| Requirement / acceptance check | One observable behaviour or constraint |
| Phase | SRS phase allocation |
| Layer | Frontend, API/backend, database, realtime, infrastructure, operations, or cross-cutting |
| Verification | Minimum repeatable evidence |
| Audit status | Reserved for Deliverable C; not assessed here |
| Evidence / notes | File/line, test output, API response, screenshot/video, config, or unresolved contract gap |

## 3. Product architecture and scope constraints

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| ARC-01 | DC-01 | Application is delivered as a modular monolith with one backend deployable; modules have explicit boundaries and service interfaces. | Cross-cutting | Architecture/backend | Architecture and dependency review | Not assessed |
| ARC-02 | DC-02 | REST is the primary mechanism for CRUD, retrieval, filtering, sorting, pagination and authentication; Socket.IO is not used as the CRUD source of truth. | MVP | API | API contract/integration tests | Not assessed |
| ARC-03 | DC-03 | Socket.IO is used for authorized real-time event delivery; UI updates reconcile against authoritative persisted data. | MVP | Realtime/frontend | Multi-client integration test | Not assessed |
| ARC-04 | DC-04 | PostgreSQL is the durable source of truth for business entities and persisted notifications/audit/risk records. | Cross-cutting | Database | Integration/architecture test | Not assessed |
| ARC-05 | DC-05 | Redis is used for cache/session/JTI blacklist/pub-sub/queue use cases as specified, never as the primary business database. | Cross-cutting | Infrastructure | Config and architecture review | Not assessed |
| ARC-06 | DC-06 | Every protected operation enforces authorization server-side regardless of frontend route or button visibility. | MVP | Security/backend | Negative API authorization tests | Not assessed |
| ARC-07 | DC-07 | Audit records cannot be updated or deleted by ordinary application operations; database-level immutability is demonstrated. | Extended | Database/security | DB mutation test | Not assessed |
| ARC-08 | DC-08 | PIRAE only emits risk assessments/recommendations and never autonomously changes task/project state, deadlines, priorities, or assignments. | Extended | Backend/business | Side-effect and integration tests | Not assessed |
| ARC-09 | DC-09 | Reverse proxy forwards WebSocket Upgrade and Connection headers so Socket.IO handshake succeeds through Nginx. | Production | Infrastructure | Deployed handshake test | Not assessed |
| ARC-10 | CA-04 | Public self-registration is absent/disabled; accounts are provisioned by an authorized System Administrator. | MVP | UI/API/security | Unauthenticated signup negative test and admin provisioning test | Not assessed |
| ARC-11 | §2.7 | Phase labels match the SRS apportioning: core auth/RBAC/team/project/task/Kanban/realtime/comments/notifications/basic analytics/API in MVP; audit/attachments/extended analytics/PIRAE in Extended; deployment/security hardening in Production. | Cross-cutting | Planning | Catalogue-to-SRS phase comparison | Not assessed |
| ARC-12 | UI-01 | Frontend uses React + Vite + Tailwind CSS as specified; reusable UI remains compatible with the current project structure. | Frontend | UI/build | package/config/build review | Not assessed |
| ARC-13 | DC-10 | Passwords are never stored or logged in plaintext; password verification uses BCrypt with cost factor at least 12. | MVP | Security/backend | Code/config review and auth tests | Not assessed |

## 4. Authentication and account lifecycle

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| AUTH-01.a | FR-AUTH-01 | Valid credentials using the supported login identifier and correct password authenticate successfully. | MVP | UI/API | Positive login API test | Not assessed |
| AUTH-01.b | FR-AUTH-01 | Invalid identifier/password is rejected without revealing which credential was wrong. | MVP | API/security | Negative login tests | Not assessed |
| AUTH-01.c | FR-AUTH-01 / G-05 | Login identifier matches the approved schema; email is supported by the frozen users table. Username login remains blocked until a username column/contract is approved. | MVP | API/database | Schema/OpenAPI contract test | Blocked by contract gap |
| AUTH-02.a | FR-AUTH-02, NFR-SEC-02 | Stored password hash is BCrypt with configured cost factor >= 12. | MVP | Backend/security | Hash configuration test | Not assessed |
| AUTH-02.b | Password policy | Password must be at least 8 characters and contain uppercase, lowercase, number, and special character. | MVP | UI/API | Boundary validation tests | Not assessed |
| AUTH-02.c | Password policy | Password-policy violations return HTTP 422 and the standard error envelope. | MVP | API | API contract test | Not assessed |
| AUTH-03.a | FR-AUTH-03 | Successful login issues a signed access JWT with required identity/role claims and configured 15-minute lifetime. | MVP | Backend/security | Token decode/signature test | Not assessed |
| AUTH-03.b | Session model | Refresh/session material is stored and managed through Redis; browser UI does not treat an access JWT alone as the whole session. | MVP | Backend/security | Session integration test | Not assessed |
| AUTH-04.a | FR-AUTH-04 | Every protected REST request validates token signature, expiry and required claims. | MVP | Backend/security | Expired/tampered/missing-token API tests | Not assessed |
| AUTH-04.b | FR-AUTH-04 | Missing/invalid/expired access token returns HTTP 401 using the standard error envelope. | MVP | API | API contract test | Not assessed |
| AUTH-05.a | FR-AUTH-05, CA-04 | Anonymous users cannot create accounts; public registration route is absent or returns the documented denial. | MVP | UI/API | Anonymous signup negative test | Not assessed |
| AUTH-05.b | FR-AUTH-05 | System Administrator can provision an account with required profile fields and permitted initial role. | MVP | UI/API | Admin account-creation test | Not assessed |
| AUTH-06.a | FR-AUTH-06 | Authenticated user can retrieve their own profile. | MVP | UI/API | API and UI integration test | Not assessed |
| AUTH-06.b | FR-AUTH-06 | User profile updates validate fields and enforce ownership; users cannot change their own global role through profile editing. | MVP | UI/API/security | Positive and negative API tests | Not assessed |
| AUTH-07.a | FR-AUTH-07 | Only System Administrator can activate/deactivate an account. | MVP | API/security | Role-matrix tests | Not assessed |
| AUTH-07.b | FR-AUTH-07 | Deactivated accounts cannot authenticate or maintain authorized protected/socket access. | MVP | Security/realtime | Login and socket rejection tests | Not assessed |
| AUTH-08.a | FR-AUTH-08, NFR-SEC-06 | Five consecutive failed login attempts trigger a 15-minute account lockout. | MVP | Backend/security | Controlled lockout test with clock | Not assessed |
| AUTH-08.b | FR-AUTH-08 | Locked account cannot authenticate during lockout; after lockout expiry, behaviour matches the defined unlock policy. | MVP | Backend/security | Time-bound test | Not assessed |
| AUTH-09.a | FR-AUTH-09 | Only System Administrator can assign, modify or revoke global/system roles. | MVP | API/security | Role assignment negative/positive tests | Not assessed |
| AUTH-09.b | FR-AUTH-09 | Team or project role changes do not silently alter global role. | MVP | API/database | Cross-scope role mutation test | Not assessed |
| AUTH-10.a | FR-AUTH-10/11 | Logout sends a server-side revocation request and clears client-side authenticated state. | MVP | UI/API | Logout integration test | Not assessed |
| AUTH-11.a | FR-AUTH-11, NFR-SEC-04 | Logout adds the access-token JTI to Redis blacklist with TTL equal to its remaining lifetime. | MVP | Backend/security | Redis inspection and replay test | Not assessed |
| AUTH-11.b | FR-AUTH-11, NFR-SESS-01 | Logout revokes/deletes the associated refresh session from Redis. | MVP | Backend/security | Refresh-after-logout test | Not assessed |
| AUTH-11.c | FR-AUTH-11 | Previously issued access token returns 401 after logout. | MVP | Backend/security | Token replay test | Not assessed |
| AUTH-11.d | FR-AUTH-11 | Previously issued refresh token cannot mint a new access token after logout. | MVP | Backend/security | Refresh replay test | Not assessed |
| AUTH-11.e | CH-01 / Errata E-007 | Logout/session revocation remains possible when the access token has expired; the flow must not leave a valid refresh session behind. | MVP | Backend/security | Expired-access logout test | Not assessed |
| AUTH-12.a | FR-AUTH-12 / CA-05 | Only System Administrator can create a team. | MVP | API/security | Team-create role matrix | Not assessed |
| AUTH-12.b | FR-AUTH-12 | Only System Administrator or Project Manager can modify team membership. | MVP | API/security | Team-membership role matrix | Not assessed |

## 5. RBAC and permission scope

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| RBAC-01.a | FR-RBAC-01 / NFR-AUTH-01 | All protected endpoints enforce server-side role/permission checks; UI visibility alone is never accepted as authorization. | MVP | Backend/security | Endpoint-by-role test suite | Not assessed |
| RBAC-01.b | FR-RBAC-01 | Unauthorized requests return the documented 401/403 response and do not mutate data. | MVP | API/security | Negative API tests and DB assertions | Not assessed |
| RBAC-02.a | FR-RBAC-02 | System role enum/claims support Administrator, Project Manager/Team Lead, Team Member, Viewer/Stakeholder according to the canonical role mapping. | MVP | API/database/UI | Role enum and contract tests | Not assessed |
| RBAC-03.a | FR-RBAC-03 | Project membership role accepts exactly Manager, Contributor, Viewer. | MVP | API/database | Schema/API enum tests | Not assessed |
| RBAC-04.a | FR-RBAC-04 | Access to a team-scoped resource requires valid team membership except explicit global Administrator permissions. | MVP | Backend/security | Cross-team access tests | Not assessed |
| RBAC-04.b | FR-RBAC-04 | Access to a project-scoped resource requires project membership and valid project role, except explicit SRS Administrator global access. | MVP | Backend/security | Cross-project access tests | Not assessed |
| RBAC-05.a | FR-RBAC-05 | Resource-level operations check ownership/assignment where the permission matrix requires it (for example own comment editing). | MVP | Backend/security | Ownership-negative tests | Not assessed |
| RBAC-06.a | §4.2 / CA-17 | Global role, team role and project role are stored/evaluated as separate scopes; assignment in one scope does not imply another. | MVP | Database/security | Role-scope mutation tests | Not assessed |
| RBAC-06.b | §4.2 | Global Project Manager does not automatically become project Manager; explicit project membership role is required. | MVP | Backend/security | Cross-role test | Not assessed |
| RBAC-06.c | §4.2 / P-06 | Team role values are Admin-Assigned and Member; a legacy “Owner” value never grants authority. | MVP | Database/security | Enum and authorization test | Not assessed |
| RBAC-06.d | Appendix A | Viewer can view only authorized project/task data and cannot invoke mutation operations denied by the permission matrix. | MVP | UI/API/security | Viewer role matrix | Not assessed |
| RBAC-06.e | Appendix A | Team Member mutations marked limited are further constrained by project membership, assignment, ownership and project policy. | MVP | Backend/security | Permission matrix tests | Not assessed |
| RBAC-06.f | Appendix A / Errata E-028 | Administrator can view global audit; Project Manager audit access is limited to authorized project scope; Viewer has no audit access. | Extended | Backend/security | Cross-project audit access test | Not assessed |

## 6. Team management

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| TEAM-01.a | FR-TEAM-01 | Authorized Administrator can create a team with valid name and optional description. | MVP | UI/API | Team-create integration test | Not assessed |
| TEAM-01.b | FR-TEAM-01/04 | Non-Administrator cannot create a team; denial causes no team row or side effect. | MVP | API/security | Negative API + DB assertion | Not assessed |
| TEAM-02.a | FR-TEAM-02/03 | Authorized Administrator or Project Manager can add/remove team members. | MVP | UI/API | Membership CRUD tests | Not assessed |
| TEAM-02.b | FR-TEAM-02 | Team membership references valid existing user and team; duplicate membership is rejected or idempotently handled per API contract. | MVP | Database/API | FK/unique constraint tests | Not assessed |
| TEAM-02.c | FR-TEAM-02 / P-06 | Team member role is restricted to Admin-Assigned or Member and does not confer system-wide privilege. | MVP | Database/security | Role enum and escalation tests | Not assessed |
| TEAM-03.a | FR-TEAM-03 | Non-Administrator/non-Project-Manager cannot change team membership. | MVP | API/security | Role-matrix tests | Not assessed |
| TEAM-04.a | FR-TEAM-04 | Unauthorized provisioning attempt is rejected with documented status/error code. | MVP | API/security | API negative test | Not assessed |
| TEAM-05.a | FR-TEAM-05 | Each team membership change writes an audit record with actor, action, target membership and correlation ID. | Extended | Backend/database | Mutation-to-audit integration test | Not assessed |
| TEAM-05.b | FR-TEAM-05 | Audit-write failure does not silently leave a successful membership mutation without its required audit evidence. | Extended | Backend/database | Transaction/failure-injection test | Not assessed |
| TEAM-06.a | Sprint 4 supplemental / A G-01 | Do not implement “Team Owner” as a privileged role; any owner-specific business invariant requires a separately approved rule. | Cross-cutting | Security/design | Role and permission review | Not assessed |

## 7. Project management

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| PROJ-01.a | FR-PROJ-01 | Authorized Administrator or Project Manager can create a project associated with a valid team. | MVP | UI/API | Project-create integration test | Not assessed |
| PROJ-01.b | FR-PROJ-01 | Unauthorized roles cannot create projects. | MVP | API/security | Negative role matrix | Not assessed |
| PROJ-02.a | FR-PROJ-02 | Project stores required objective/scope, start date, end date, status and priority. | MVP | UI/API/database | DTO/schema/round-trip test | Not assessed |
| PROJ-02.b | FR-PROJ-02 / A G-03 | Start date and end date are explicit fields; created_at must not be silently substituted for start date. | MVP | API/database | Schema contract test | Blocked by contract gap |
| PROJ-02.c | FR-PROJ-02 | Invalid date ordering/format is rejected according to the approved validation contract. | MVP | UI/API | Boundary validation test | Not assessed |
| PROJ-03.a | FR-PROJ-03 | Authorized users can add/remove project members under the permission matrix. | MVP | UI/API | Project membership CRUD tests | Not assessed |
| PROJ-04.a | FR-PROJ-04 | Each project membership has one of Manager, Contributor, Viewer. | MVP | Database/API | Enum test | Not assessed |
| PROJ-04.b | FR-PROJ-04 | Assigning a project role does not alter the user's global or team role. | MVP | API/database | Role-scope integration test | Not assessed |
| PROJ-05.a | FR-PROJ-05 | Project progress is derived from persisted project/task data and has a documented calculation. | MVP | UI/API | Fixture-based metric test | Not assessed |
| PROJ-05.b | FR-PROJ-05 / FR-AN-06 | Empty project and projects with no eligible tasks display a valid empty/zero state, not fabricated metrics or NaN. | MVP | UI | Empty-state test | Not assessed |
| PROJ-06.a | FR-PROJ-06 | Project operations enforce global permission plus project membership/role and resource scope. | MVP | API/security | Cross-project role tests | Not assessed |
| PROJ-07.a | FR-PROJ-07 | Project state changes create immutable audit entries containing old/new state and actor/correlation metadata. | Extended | Backend/database | Audit integration test | Not assessed |
| PROJ-08.a | A G-07 | Project status/priority allowed values must be explicitly approved in schema/API; task priority enum is not assumed to define project priority. | Cross-cutting | API/database | Contract review | Blocked by contract gap |

## 8. Task management, assignment, subtasks and dependencies

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| TASK-01.a | FR-TASK-01 | Authorized role can create a task under an existing project with required title and valid field values. | MVP | UI/API | Task-create API test | Not assessed |
| TASK-01.b | FR-TASK-01 | Invalid project, missing required title or invalid enum is rejected without creating a task. | MVP | API/database | Negative validation test | Not assessed |
| TASK-02.a | FR-TASK-02 | Authorized user can update permitted task fields; unauthorized user cannot update them. | MVP | UI/API/security | Positive/negative mutation tests | Not assessed |
| TASK-03.a | FR-TASK-03 | Authorized user can delete/archive a task according to the approved endpoint semantics. | MVP | UI/API | Delete/archive integration test | Not assessed |
| TASK-03.b | FR-TASK-03 | Task removal respects FK/cascade rules and does not leave invalid dependent records. | MVP | Database | Referential integrity test | Not assessed |
| TASK-04.a | FR-TASK-04 | Task persists title and optional description and returns saved values on retrieval. | MVP | API/database | Create/read round-trip test | Not assessed |
| TASK-04.b | FR-TASK-04 | Task persists one or more assignees through the task_assignees relationship, not an unvalidated display-only field. | MVP | API/database | Multi-assignee integration test | Not assessed |
| TASK-04.c | FR-TASK-04 | Task persists priority and deadline/due date using the approved DTO/schema mapping. | MVP | API/database | Round-trip and date tests | Not assessed |
| TASK-04.d | FR-TASK-04 / A G-04 | Start date is represented explicitly when required; created_at is not silently substituted for task start date. | MVP | API/database | Schema/DTO test | Blocked by contract gap |
| TASK-04.e | FR-TASK-04 | Estimated effort is numeric, non-negative and stored with the approved precision. | MVP | API/database | Validation and persistence tests | Not assessed |
| TASK-05.a | FR-TASK-05 | A task can have multiple assignees; each assignee is a valid user authorized for the project/team policy. | MVP | API/database | Multi-assignee and membership tests | Not assessed |
| TASK-05.b | FR-TASK-05 | Duplicate task/user assignment cannot create duplicate join rows. | MVP | Database | Composite PK/unique test | Not assessed |
| TASK-06.a | FR-TASK-06 | Subtasks are stored as the specified JSONB subtask array and survive save/reload. | MVP | API/database | Persistence round-trip test | Not assessed |
| TASK-06.b | FR-TASK-06 | Malformed subtask structures are rejected or normalized under a documented schema. | MVP | API | Schema validation test | Not assessed |
| TASK-07.a | FR-TASK-07 | Dependencies are persisted in relational task_dependencies, not tasks.dependencies JSONB. | MVP | Database/API | Schema/migration test | Not assessed |
| TASK-07.b | FR-TASK-07 | Each dependency identifies blocking_task_id, blocked_task_id and the approved BLOCKS relationship. | MVP | Database/API | Dependency CRUD test | Not assessed |
| TASK-07.c | FR-TASK-07 / CA-11 | Duplicate dependency edge is prevented by unique(blocking_task_id, blocked_task_id). | MVP | Database | Duplicate insert test | Not assessed |
| TASK-07.d | FR-TASK-07 / Sprint 7 | Self-dependency, missing task references and cycles are rejected. | MVP | Backend/database | Graph validation tests | Not assessed |
| TASK-07.e | FR-TASK-07 / Sprint 7 | Dependency endpoints enforce same-project scope unless a future approved requirement permits cross-project edges. | MVP | Backend/security | Cross-project dependency test | Not assessed |
| TASK-08.a | FR-TASK-08 | Task status can be changed only to TODO, IN_PROGRESS or DONE. | MVP | UI/API/database | Enum boundary tests | Not assessed |
| TASK-09.a | FR-TASK-09 | Extended task history exposes meaningful state/field changes in chronological order for authorized readers. | Extended | API/database/UI | History fixture test | Not assessed |
| TASK-10.a | FR-TASK-10 | Invalid status is rejected at API and database layers; accepted values are exactly TODO, IN_PROGRESS, DONE. | MVP | API/database | CHECK constraint and API tests | Not assessed |
| TASK-11.a | FR-TASK-11 | Invalid task priority is rejected at API and database layers; accepted values are exactly LOW, MEDIUM, HIGH, CRITICAL. | MVP | API/database | CHECK constraint and API tests | Not assessed |
| TASK-12.a | FR-TASK-12 | Database CHECK constraints enforce the frozen status and priority sets even if validation is bypassed. | MVP | Database | Direct SQL negative test | Not assessed |
| TASK-13.a | FR-TASK-13 | Extended estimated-effort field supports decimal hours and validates bounds/precision. | Extended | API/database/UI | Boundary/round-trip tests | Not assessed |
| TASK-14.a | FR-TASK-14 / A G-04 | Extended task start date is persisted and retrievable after the approved schema decision. | Extended | API/database | Schema/round-trip test | Blocked by contract gap |
| TASK-15.a | FR-TASK-15 / FR-KAN-03 | Transition to DONE is rejected while any blocking prerequisite remains incomplete. | Extended | Backend/business | Dependency gate test | Not assessed |
| TASK-15.b | FR-TASK-15 / Sprint 7 | DONE gate is applied to every path capable of changing status to DONE, including generic PATCH and Kanban paths. | Extended | Backend/business | Multi-endpoint bypass tests | Not assessed |
| TASK-15.c | FR-TASK-15 / Sprint 7 | A rejected DONE transition leaves task state unchanged and returns a documented conflict/validation response. | Extended | API/database | State-before/after assertion | Not assessed |
| TASK-16.a | FR-TASK-16 | Task creation, assignment, status, deadline and priority changes produce required audit records. | Extended | Backend/database | Mutation-to-audit matrix | Not assessed |
| TASK-16.b | FR-TASK-16 | Audit records capture old/new values, actor, entity and correlation ID for each required task mutation. | Extended | Backend/database | Audit schema/content assertion | Not assessed |

## 9. Kanban board

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| KAN-01.a | FR-KAN-01 | Board exposes exactly TODO, IN_PROGRESS and DONE status columns for the baseline task workflow. | MVP | UI | UI/component test | Not assessed |
| KAN-02.a | FR-KAN-02 | Authorized drag-and-drop moves a task to a target status and persists via the authoritative API. | MVP | UI/API | Browser + API integration test | Not assessed |
| KAN-02.b | FR-KAN-02 | Failed transition restores/reconciles the card to the server-confirmed state and displays an understandable error. | MVP | UI/API | Failure-injection UI test | Not assessed |
| KAN-03.a | FR-KAN-03 | Attempt to move a blocked task to DONE is rejected with a clear explanation and no persisted state change. | Extended | UI/API | Dependency gate test | Not assessed |
| KAN-04.a | FR-KAN-04 | Accepted Kanban transition is reflected on connected authorized clients within 200 ms target. | MVP | Realtime | Multi-client latency test | Not assessed |
| KAN-04.b | FR-KAN-04 | UI reconciles duplicate/out-of-order events and refetches authoritative state when event recovery indicates a gap. | MVP/Extended recovery | UI/realtime | Event ordering/reconnect test | Not assessed |
| KAN-05.a | FR-KAN-05 | Kanban transition produces a required audit entry when the Extended audit module is enabled. | Extended | Backend/database | Audit integration test | Not assessed |

## 10. Real-time collaboration and frozen event contract

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| RT-01.a | FR-RT-01 | Task create/update/status/assignment events are emitted only after the corresponding database mutation succeeds. | MVP | Backend/realtime | Mutation/event ordering test | Not assessed |
| RT-01.b | FR-RT-01 | Comment and project updates are broadcast to authorized project subscribers. | MVP | Backend/realtime | Multi-client event tests | Not assessed |
| RT-01.c | FR-RT-01 | Notification event is delivered to the recipient's authorized user room after persistence. | MVP | Backend/realtime | Recipient room integration test | Not assessed |
| RT-02.a | FR-RT-02 / FR-SOCK-03 | Socket.IO handshake requires a valid JWT; missing, invalid or expired token is rejected. | MVP | Realtime/security | Socket handshake negative tests | Not assessed |
| RT-03.a | FR-RT-03 | Socket authorization verifies identity, token validity and active account state before allowing subscription. | MVP | Realtime/security | Socket auth tests | Not assessed |
| RT-03.b | FR-RT-03 | Project/team membership is verified before joining any scoped room. | MVP | Realtime/security | Cross-project room-join tests | Not assessed |
| RT-04.a | FR-RT-04 | Authorized project subscribers join room name project:{projectId}; unauthorized users cannot join it. | MVP | Realtime/security | Room routing tests | Not assessed |
| RT-05.a | FR-RT-05 | User-specific events use user:{userId}; a user cannot subscribe to another user's private room. | MVP | Realtime/security | Cross-user room tests | Not assessed |
| RT-06.a | FR-RT-06 / FR-SOCK-05 | Multi-instance event distribution uses Redis Pub/Sub as the defined transport. | MVP | Infrastructure/realtime | Two-instance integration test | Not assessed |
| RT-07.a | FR-RT-07 | Two or more simultaneously connected clients receive the same authorized committed state changes without requiring manual page reload. | MVP | Realtime/UI | Multi-client acceptance test | Not assessed |
| RT-08.a | FR-RT-08 | CRUD, retrieval, pagination, filtering and auth remain REST API operations. | MVP | API | OpenAPI/contract review | Not assessed |
| RT-09.a | FR-RT-09 / FR-SOCK-02 | Each frozen event has a documented payload schema and runtime validation for required fields/types. | Extended | Realtime/API | Schema contract tests | Not assessed |
| RT-10.a | FR-RT-10 / NFR-RECON-01 | Socket client reconnects with exponential backoff after a dropped connection. | Extended | Frontend/realtime | Network interruption test | Not assessed |
| RT-11.a | FR-RT-11 / NFR-RECON-01 | Reconnected client can request missed event payloads for authorized project/user scopes. | Extended | Realtime/API | Disconnect-mutate-reconnect test | Not assessed |
| RT-12.a | FR-RT-12 | Server rejects unauthorized room join attempts even if client manually constructs a room name or socket payload. | MVP | Realtime/security | Adversarial socket test | Not assessed |
| SOCK-01.a | §7.1 | Every event envelope contains eventId UUID, event name, ISO-8601 timestamp, actorId, projectId where applicable, and data payload. | MVP | Realtime | Envelope schema test | Not assessed |
| SOCK-01.b | CA-07 / §7.2 | Exactly the 13 frozen event names below are emitted; no unapproved attachment.created/team.updated/kanban.* event is introduced. | MVP | Realtime | Event registry snapshot test | Not assessed |
| SOCK-02.a | §7.2 | task.created payload includes taskId, title, status and priority and targets project room. | MVP | Realtime | Event payload assertion | Not assessed |
| SOCK-02.b | §7.2 | task.updated payload includes taskId and changes and targets project room. | MVP | Realtime | Event payload assertion | Not assessed |
| SOCK-02.c | §7.2 | task.status_changed payload includes taskId, oldStatus and newStatus and targets project room. | MVP | Realtime | Event payload assertion | Not assessed |
| SOCK-02.d | §7.2 | task.assigned payload includes taskId and assigned data; targets project room and relevant assignee user room. | MVP | Realtime | Event payload/room test | Not assessed |
| SOCK-02.e | §7.2 | task.deleted payload includes taskId and targets project room. | MVP | Realtime | Event payload assertion | Not assessed |
| SOCK-02.f | §7.2 | comment.created payload includes commentId, taskId and body and targets project room. | MVP | Realtime | Event payload assertion | Not assessed |
| SOCK-02.g | §7.2 | comment.updated payload includes commentId, taskId, body and updatedAt and targets project room only for permitted edit. | MVP | Realtime | 15-minute edit/event test | Not assessed |
| SOCK-02.h | §7.2 | comment.deleted payload includes commentId and taskId and targets project room. | Extended | Realtime | Event payload assertion | Not assessed |
| SOCK-02.i | §7.2 | project.updated payload includes projectId and changes and targets the project room. | MVP | Realtime | Event payload assertion | Not assessed |
| SOCK-02.j | §7.2 | notification.created payload includes notificationId, type and payload and targets recipient user room. | MVP | Realtime | Event payload/recipient test | Not assessed |
| SOCK-02.k | §7.2 | risk.detected payload includes riskId, riskType, severity and reason and targets project room. | Extended | Realtime | Event payload assertion | Not assessed |
| SOCK-02.l | §7.2 | risk.updated payload includes riskId, status and resolvedAt and targets project room. | Extended | Realtime | Event payload assertion | Not assessed |
| SOCK-02.m | §7.2 | membership.changed payload includes userId, role and action and targets authorized relevant scope. | MVP | Realtime | Event payload/authorization test | Not assessed |
| SOCK-03.a | §7.3–7.4 | Server emits project-scoped events only to authorized project room members and user-scoped events only to the matching user room. | MVP | Realtime/security | Room isolation test | Not assessed |
| SOCK-04.a | §7.5 | State change flow is database commit → Redis Pub/Sub → Socket.IO → authorized clients; no event is announced for a rolled-back mutation. | MVP | Backend/realtime | Transaction failure injection | Not assessed |
| SOCK-05.a | §7.6 | Missed-event recovery rechecks current authorization and only replays events the requester may access. | Extended | Realtime/security | Replay authorization test | Not assessed |

## 11. Comments and mentions

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| COMM-01.a | FR-COMM-01 | Authorized project member can create a comment on an existing task. | MVP | UI/API | Comment create test | Not assessed |
| COMM-01.b | FR-COMM-01 | Non-member or read-only role cannot create a comment; request leaves no comment row. | MVP | API/security | Negative authorization test | Not assessed |
| COMM-02.a | FR-COMM-02 | Comment mention references a valid existing user and persists a unique comment_mentions relation. | MVP | API/database | Mention persistence test | Not assessed |
| COMM-02.b | FR-COMM-02 / Sprint 8 | Mentioning a user who is not a member of the task's project is rejected; a mention never grants access. | MVP | API/security | Non-member mention test | Not assessed |
| COMM-03.a | FR-COMM-03 | Comment author can edit their own comment within 15 minutes of creation. | MVP | UI/API | Clock-controlled positive test | Not assessed |
| COMM-03.b | FR-COMM-03 / BR-COL-02 | Edit after 15 minutes is rejected server-side; non-author edit is rejected regardless of elapsed time. | MVP | API/security | Time boundary and ownership tests | Not assessed |
| COMM-04.a | FR-COMM-04 | Successful comment edit updates updated_at and emits comment.updated with the updatedAt value. | MVP | API/database/realtime | Persistence/event test | Not assessed |
| COMM-05.a | FR-COMM-05 | Comment deletion is available only to the roles/owners allowed by the finalized permission matrix. | Extended | API/security | Comment deletion role matrix | Not assessed |
| COMM-05.b | FR-COMM-05 | Successful deletion persists and emits comment.deleted; denied deletion leaves record unchanged. | Extended | API/realtime | Mutation/event test | Not assessed |

## 12. Notifications

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| NOTIF-01.a | FR-NOTIF-01 | Required task/project events create the appropriate notification type and recipient. | MVP | Backend | Producer-to-notification test matrix | Not assessed |
| NOTIF-01.b | Sprint 9 supplemental | Supported categories include TASK_ASSIGNED, TASK_STATUS_CHANGED, TASK_DUE_SOON, COMMENT_CREATED, COMMENT_MENTIONED, RISK_DETECTED and RISK_UPDATED where applicable. | MVP/Extended | Backend/UI | Notification category contract test | Not assessed |
| NOTIF-02.a | FR-NOTIF-02 | Notification is persisted in PostgreSQL before realtime delivery is attempted. | MVP | Backend/database | Persistence/event ordering test | Not assessed |
| NOTIF-02.b | FR-NOTIF-02 | Notification recipient user_id is required and references an existing user. | MVP | Database | FK/NOT NULL test | Not assessed |
| NOTIF-03.a | FR-NOTIF-03 | Online recipient receives notification.created in their user room after successful persistence. | MVP | Realtime | Online recipient test | Not assessed |
| NOTIF-04.a | FR-NOTIF-04 | Offline recipient can retrieve persisted notifications after reconnect/login; socket delivery is not the only copy. | MVP | API/database/UI | Offline/online recovery test | Not assessed |
| NOTIF-04.b | FR-NOTIF-04 | A user can list/read/mark-read only their own notifications; another user's IDs do not reveal or mutate records. | MVP | API/security | Cross-user IDOR tests | Not assessed |
| NOTIF-04.c | §6.3 | Notifications are retained for six months and expiry/cleanup follows the retention policy. | Cross-cutting | Database/operations | Retention job test | Not assessed |
| NOTIF-05.a | A G-10 | Unread-count endpoint is not considered a frozen contract unless added to OpenAPI; UI must use documented data or an approved endpoint. | Cross-cutting | API/UI | OpenAPI comparison | Not assessed |

## 13. Attachments

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| ATT-01.a | FR-ATT-01 / Sprint 10 | Uploads larger than 10 MB are rejected before storage; boundary at 10 MB follows documented inclusive limit. | Extended | API/storage | File-size boundary test | Not assessed |
| ATT-01.b | FR-ATT-01 | Accepted file families are PDF, PNG, JPG/JPEG, DOCX, XLSX and TXT. | Extended | API/storage | MIME allowlist tests | Not assessed |
| ATT-01.c | FR-ATT-01 / Sprint 10 | File signature/magic bytes are validated in addition to extension and declared MIME; spoofed content is rejected. | Extended | API/security | Polyglot/spoof file tests | Not assessed |
| ATT-02.a | FR-ATT-02 | Only an authorized project member with ATTACHMENT_UPLOAD permission can upload to a permitted task/comment. | Extended | API/security | Role/membership upload tests | Not assessed |
| ATT-02.b | FR-ATT-02 | Download requires authentication and resource/project access; no permanent public storage URL bypasses authorization. | Extended | API/storage/security | Cross-project download tests | Not assessed |
| ATT-03.a | FR-ATT-03 | PostgreSQL stores storage_key, mime_type, file_size, original_filename, uploader and parent metadata; file bytes remain in backend-controlled storage. | Extended | Database/storage | Schema and storage test | Not assessed |
| ATT-03.b | FR-ATT-03 | storage_key is provider-neutral and internal storage keys are not exposed as a public access mechanism. | Extended | API/storage | Response schema/security review | Not assessed |
| ATT-04.a | FR-ATT-04 | Attachment deletion is permitted only for authorized uploader/manager/admin per the approved policy. | Extended | API/security | Role matrix test | Not assessed |
| ATT-04.b | FR-ATT-04 | Successful deletion removes metadata and safely removes/queues physical object cleanup; denied deletion changes nothing. | Extended | Database/storage | Failure/cleanup integration test | Not assessed |
| ATT-05.a | FR-ATT-05 / CA-11 | Exactly one of task_id and comment_id is non-null. | Extended | Database/API | XOR boundary test | Not assessed |
| ATT-05.b | FR-ATT-05 | XOR rule is enforced at request, service and database CHECK layers; both-null and both-present rows fail. | Extended | API/database | Direct SQL and API tests | Not assessed |
| ATT-06.a | §7.2 / CA-07 | Attachment operations do not add a 14th event; UI invalidates/refetches attachment data after a successful mutation. | Extended | UI/API/realtime | Event registry and query invalidation test | Not assessed |
| ATT-06.b | A G-11 | Parent-specific attachment-list endpoints are not assumed to exist unless present in OpenAPI or formally added. | Extended | API/UI | OpenAPI path comparison | Not assessed |
| ATT-07.a | §6.3 | Attachment data is retained until deletion/project archival according to the SRS retention policy. | Cross-cutting | Storage/operations | Retention/deletion test | Not assessed |

## 14. Analytics

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| AN-01.a | FR-AN-01 | Completion percentage is calculated from persisted task/project data using a documented denominator and handles an empty project. | MVP | API/UI | Fixture-based calculation test | Not assessed |
| AN-02.a | FR-AN-02 | Overdue count includes only tasks meeting the approved due-date/status definition and is calculated from stored data. | MVP | API/UI | Date-controlled fixture test | Not assessed |
| AN-03.a | FR-AN-03 | Status distribution counts TODO, IN_PROGRESS and DONE records and totals reconcile with the source task set. | MVP | API/UI | Aggregate-vs-records test | Not assessed |
| AN-04.a | FR-AN-04 | Priority distribution counts LOW, MEDIUM, HIGH and CRITICAL and reconciles with source records. | MVP | API/UI | Aggregate-vs-records test | Not assessed |
| AN-05.a | FR-AN-05 | Workload per member is calculated from actual persisted assignments/effort, with a stated unit and scope. | MVP | API/UI | Workload fixture test | Not assessed |
| AN-06.a | FR-AN-06 | Production analytics are sourced from persisted data; hard-coded/demo values are visibly identified as demo data and never presented as live facts. | MVP | UI/API | Source trace and UI review | Not assessed |
| AN-06.b | FR-AN-06 | Loading, empty, error and stale-data states are distinguishable; chart totals match the displayed data. | MVP | UI | Component and integration tests | Not assessed |
| AN-07.a | FR-AN-07 / A G-04/G-17 | Cycle time uses an approved authoritative start and completion timestamp source; missing historical timestamps are not fabricated. | Extended | API/database | Historical data fixture test | Blocked by contract gap |
| AN-08.a | FR-AN-08 | Completion trends use real timestamps and explicit date windows; changing window changes results predictably. | Extended | API/UI | Time-series fixture test | Not assessed |
| AN-09.a | FR-AN-09 | Dependency blocking metric derives from persisted dependency edges and current blocker state. | Extended | API/UI | Dependency fixture test | Not assessed |
| AN-10.a | FR-AN-10 | Risk trends derive from persisted risk assessments over a defined time window and project scope. | Extended | API/UI | Risk fixture test | Not assessed |
| AN-11.a | A G-09 | Extended analytics routes/response schemas are not treated as frozen until OpenAPI includes them or a contract change is approved. | Extended | API | OpenAPI comparison | Blocked by contract gap |
| AN-11.b | Sprint 11 | Workload detail, where exposed, reports active task count, estimated remaining effort, overdue task count and active HIGH/CRITICAL task count. | Extended | API/UI | Workload metric fixture test | Not assessed |

## 15. Audit trail

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| AUD-01.a | FR-AUD-01 | Every required audit row records actor_id, action, entity_type, entity_id, timestamp, old_values, new_values and correlation_id. | Extended | Database/backend | Schema/content assertion | Not assessed |
| AUD-01.b | CA-12 | correlation_id is UUID and NOT NULL for each audit record. | Extended | Database/backend | Direct insert and API tests | Not assessed |
| AUD-02.a | FR-AUD-02 | Audit rows are append-only; database rejects UPDATE and DELETE. | Extended | Database | Direct SQL negative test | Not assessed |
| AUD-03.a | FR-AUD-03 | Normal application users cannot update/delete audit rows through API or direct application service paths. | Extended | API/security | Negative API/service tests | Not assessed |
| AUD-04.a | FR-AUD-04 | Task create, assignment, status, deadline and priority changes generate audit entries. | Extended | Backend/database | Mutation-to-audit matrix | Not assessed |
| AUD-04.b | FR-AUD-04 | Project state and project/team membership changes generate audit entries. | Extended | Backend/database | Mutation-to-audit matrix | Not assessed |
| AUD-05.a | FR-AUD-05 | A correlation ID is generated or propagated per request/transaction and appears in response/log/audit context as defined. | Extended | Backend/operations | Correlation propagation test | Not assessed |
| AUD-06.a | FR-AUD-06 / §6.3 | Audit data is retained for at least 12 months. | Extended | Database/operations | Retention config/job review | Not assessed |
| AUD-07.a | Appendix A / Errata E-028/E-029 | Administrator can filter/page global audit; Project Manager queries are restricted to authorized project scope. | Extended | API/UI/security | Role and cross-project filter tests | Not assessed |
| AUD-07.b | Sprint 12 | Audit list supports filters for entity type/ID, actor, action, time range and correlation ID, plus pagination. | Extended | API/UI | Filter combination tests | Not assessed |
| AUD-07.c | FR-AUD-02 | Audit UI is read-only; no edit/delete controls are exposed as an alternate mutation path. | Extended | UI | UI route/action inspection | Not assessed |

## 16. PIRAE risk rules and lifecycle

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| PIR-01.a | FR-PIRAE-01 / CA-08 | Relevant task/project mutation enqueues PIRAE through BullMQ/Redis; request path does not synchronously execute the full analysis. | Extended | Backend/queue | Queue and request timing test | Not assessed |
| PIR-01.b | FR-PIRAE-01 | Event-triggered evaluation completes within 5 seconds of the committed mutation under the SRS test conditions. | Extended | Backend/operations | Timed integration test | Not assessed |
| PIR-01.c | FR-PIRAE-01 | Daily scheduled evaluation runs at 00:00 UTC and evaluates all active projects. | Extended | Worker/scheduler | Scheduler test with controlled clock | Not assessed |
| PIR-02.a | FR-PIRAE-02 | Workload ratio equals estimated_active_hours divided by configured_capacity_hours. | Extended | Business logic | Unit tests with known values | Not assessed |
| PIR-02.b | CH-06 / data dictionary | configured_capacity_hours defaults to 40 and accepts only integer values 10–80. | Extended | API/database | Default/boundary tests | Not assessed |
| PIR-03.a | FR-PIRAE-03 / CA-14 | Ratio <=0.70 yields Low workload severity. | Extended | Business logic | Threshold unit tests | Not assessed |
| PIR-03.b | FR-PIRAE-03 | 0.70 < ratio <=0.90 yields Medium workload severity. | Extended | Business logic | Threshold unit tests | Not assessed |
| PIR-03.c | FR-PIRAE-03 | 0.90 < ratio <=1.20 yields High workload severity. | Extended | Business logic | Threshold unit tests | Not assessed |
| PIR-03.d | FR-PIRAE-03 | Ratio >1.20 yields Critical workload severity; Critical is not assigned to other risk types by a generic threshold. | Extended | Business logic | Threshold and cross-type tests | Not assessed |
| PIR-03.e | FR-PIRAE-03 | Workload thresholds are configurable through approved environment/configuration mechanism without code changes. | Extended | Configuration | Config override test | Not assessed |
| PIR-04.a | FR-PIRAE-04 / CA-15 | Delay score uses the SRS formula: min(100,max(0,(1-remaining_days/max(1,total_days))*50+(remaining_effort_hours/max(1,configured_capacity_hours))*50)). | Extended | Business logic | Formula unit tests | Not assessed |
| PIR-04.b | FR-PIRAE-04 | Delay severity is Low for score <=40, Medium for 41–70, High for >70. | Extended | Business logic | Boundary tests | Not assessed |
| PIR-04.c | FR-PIRAE-04 | If projected completion exceeds project deadline by >20%, delay severity is forced to High regardless of score. | Extended | Business logic | Override boundary tests | Not assessed |
| PIR-05.a | FR-PIRAE-05 / CA-22 | Dependency score is 100 if blocker overdue and current task not DONE; 70 if blocker due within 24h; 40 if blocker at risk; otherwise 0. | Extended | Business logic | Rule table unit tests | Not assessed |
| PIR-05.b | FR-PIRAE-05 | Dependency severity follows SRS bands: <=40 Low, 41–70 Medium, >70 High. | Extended | Business logic | Boundary tests | Not assessed |
| PIR-06.a | FR-PIRAE-06 / CA-21 | Priority score is 90 for HIGH/CRITICAL due <=24h and not DONE; 70 for HIGH/CRITICAL due <=3 days; 50 for MEDIUM due <=24h; 20 for MEDIUM due <=3 days; otherwise 0. | Extended | Business logic | Rule table unit tests | Not assessed |
| PIR-06.b | FR-PIRAE-06 | Priority severity follows SRS bands: <=40 Low, 41–70 Medium, >70 High. | Extended | Business logic | Boundary tests | Not assessed |
| PIR-07.a | FR-PIRAE-07 | Every risk output includes risk_type, risk_score (0–100), severity, human-readable reason, recommendation and generated_at. | Extended | API/database/UI | Risk response schema test | Not assessed |
| PIR-07.b | FR-PIRAE-07 | Risk types are limited to WORKLOAD, DELAY, DEPENDENCY, PRIORITY. | Extended | API/database | Enum/schema test | Not assessed |
| PIR-08.a | FR-PIRAE-08 | Risk status is Open or Resolved; resolved_at is set on resolution and null while open. | Extended | API/database | Lifecycle transition tests | Not assessed |
| PIR-08.b | FR-PIRAE-08 | Risk lifecycle mutation affects only risk state and does not alter tasks/projects/assignments/deadlines/priorities. | Extended | Backend/business | Side-effect assertion | Not assessed |
| PIR-09.a | §8 / A G-06 | Risk identity model distinguishes target task/user so multiple risks in one project cannot be conflated; implementation remains blocked until schema decision adds target identity. | Extended | Database/API | Schema/uniqueness review | Blocked by contract gap |
| PIR-09.b | §8 / A G-15 | Workload risk scope is clearly project-scoped as documented; UI must not imply it is an aggregate of all projects unless implemented/approved. | Extended | Business/UI | Scope and fixture test | Not assessed |
| PIR-09.c | §8 / A G-16 | If the artifact-level workload score mapping is adopted, it remains separate from severity classification and never overrides the SRS ratio thresholds. | Extended | Business logic | Formula/threshold tests | Not assessed |
| PIR-10.a | Decision Boundary | No PIRAE job, event handler or frontend action automatically reassigns users, changes task priority/status/deadline, or reschedules work. | Extended | Backend/UI | Side-effect/permission test | Not assessed |
| PIR-10.b | §6.3 | Risk assessments are retained at least 12 months. | Extended | Database/operations | Retention policy test | Not assessed |

## 17. REST API contracts and error handling

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| API-01.a | FR-API-01 | All business endpoints are versioned under /api/v1/. | MVP | API | Route/OpenAPI inventory | Not assessed |
| API-02.a | FR-API-02 | Successful responses use {success:true,data:...} envelope; endpoint data schema is stable and documented. | MVP | API | Contract tests | Not assessed |
| API-03.a | FR-API-03 | Error responses use {success:false,error:{code,message}} and do not expose stack traces/secrets. | MVP | API/security | Error contract/security tests | Not assessed |
| API-04.a | FR-API-04 | List endpoints accept page and limit with documented defaults/bounds. | MVP | API | Query boundary tests | Not assessed |
| API-05.a | FR-API-05 | Paginated responses include data and meta.page, meta.limit, meta.total, meta.totalPages. | MVP | API | Pagination contract tests | Not assessed |
| API-06.a | FR-API-06 / NFR-SEC-03 | Request bodies/query parameters are validated with shared Zod schemas at API boundaries. | MVP | API | Invalid payload tests | Not assessed |
| API-06.b | NFR-SEC-03 | Malformed request data returns HTTP 422 and standard error envelope. | MVP | API | API tests | Not assessed |
| API-07.a | FR-API-07 | Each endpoint documents auth requirement, permission, expected status codes and error codes. | MVP | API/OpenAPI | Contract review | Not assessed |
| API-08.a | FR-API-08 | All list endpoints use the same pagination wrapper and semantics. | MVP | API | Cross-endpoint contract tests | Not assessed |
| API-09.a | FR-API-09 | Endpoints that require filtering/sorting validate allowed fields/directions and return deterministic ordering. | Extended | API | Query validation tests | Not assessed |
| API-10.a | FR-API-10 / NFR-SEC-08 | Rate limiter enforces 100 requests per 15-minute window per authenticated IP/user as configured; over-limit requests return 429. | Production | API/security | Load/rate-limit tests | Not assessed |
| API-11.a | FR-API-11 / NFR-MAINT-02 | OpenAPI/Swagger documents deployed paths, schemas, security, pagination, and errors; no undocumented endpoint is presented as frozen. | Production | API/docs | OpenAPI lint and route comparison | Not assessed |
| API-12.a | §3.3 / OpenAPI | Every implemented endpoint and method matches the approved OpenAPI request/response schema, or the contract is explicitly updated first. | Cross-cutting | API | Generated contract tests | Not assessed |
| API-12.b | A G-09/G-10/G-11 | Extended analytics, unread-count and parent attachment-list paths are treated as gaps until approved OpenAPI changes exist. | Cross-cutting | API/UI | OpenAPI gap checklist | Blocked by contract gap |
| API-13.a | Error catalogue | 401 means unauthenticated/invalid session; 403 means authenticated but forbidden; 404 means unavailable/not found according to anti-enumeration policy. | MVP | API/UI | Status-to-message mapping tests | Not assessed |
| API-13.b | Error catalogue | 409 is used for genuine state conflicts; 422 for invalid input; 423 for locked state/account only where specified; 429 for rate limiting. | MVP/Production | API/UI | Error status contract tests | Not assessed |
| API-13.c | Error handling | UI displays actionable safe errors and preserves form state where feasible; it does not silently pretend a failed mutation succeeded. | MVP | Frontend | API failure UI tests | Not assessed |
| API-13.d | Error handling | Network timeout, server error, empty result and permission denial have distinguishable UI states. | MVP | Frontend | Component/integration tests | Not assessed |

## 18. Data dictionary and database integrity

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| DATA-01.a | §6.2 users | users.id is UUID primary key; email is unique/non-null; password_hash and full_name are non-null; global_role defaults to Team Member; is_active defaults true; created_at defaults current timestamp. | MVP | Database | Migration/schema tests | Not assessed |
| DATA-01.b | §6.2 users / CH-06 | configured_capacity_hours is NOT NULL, defaults to 40, and has CHECK 10–80. | Extended | Database | Migration/boundary tests | Not assessed |
| DATA-02.a | §6.2 roles | roles.id is UUID PK and roles.name is unique/non-null. | Cross-cutting | Database | Schema tests | Not assessed |
| DATA-03.a | §6.2 teams | teams.id is UUID PK; name is non-null; description nullable; created_at has current-timestamp default. | MVP | Database | Migration/schema tests | Not assessed |
| DATA-04.a | §6.2 team_members | team_members references teams/users with FKs and ON DELETE CASCADE for team/user relationship. | MVP | Database | FK/cascade tests | Not assessed |
| DATA-04.b | §6.2 team_members | role defaults Member and CHECK restricts values to Admin-Assigned or Member. | MVP | Database | Enum/default tests | Not assessed |
| DATA-04.c | §6.2 team_members | assigned_by references users with ON DELETE SET NULL; assigned_at defaults to current timestamp. | MVP | Database | FK/default tests | Not assessed |
| DATA-05.a | §6.2 projects | projects.id UUID PK; team_id FK to teams with ON DELETE CASCADE; title non-null; status defaults Active; priority defaults Medium; deadline nullable. | MVP | Database | Migration/schema tests | Not assessed |
| DATA-05.b | FR-PROJ-02 / G-03 | Project objectives/start_date/end_date are explicitly represented in approved schema/API; frozen dictionary currently does not fully specify them. | MVP | Database/API | Contract/schema review | Blocked by contract gap |
| DATA-06.a | §6.2 project_members | project_id/user_id are FKs with cascade and role enum is Manager/Contributor/Viewer default Contributor. | MVP | Database | FK/enum/default tests | Not assessed |
| DATA-07.a | §6.2 tasks | tasks.id UUID PK; project_id FK cascade; title non-null; status defaults TODO; priority defaults MEDIUM; due_date nullable; effort defaults 0.00; subtasks defaults empty JSONB array; created_at defaults current timestamp. | MVP | Database | Migration/default tests | Not assessed |
| DATA-07.b | §6.2 tasks / CA-01/09 | SQL CHECK restricts task status and priority to frozen enum values. | MVP | Database | Direct SQL negative tests | Not assessed |
| DATA-07.c | §6.2 tasks | dependencies JSONB is absent; dependency edges use task_dependencies. | MVP | Database | Schema inspection | Not assessed |
| DATA-08.a | §6.2 task_dependencies | Dependency table has UUID PK, FKs to tasks with cascade, type BLOCKS and created_at default. | MVP | Database | Migration/FK tests | Not assessed |
| DATA-08.b | §6.2 task_dependencies | Unique(blocking_task_id, blocked_task_id) prevents duplicate edges. | MVP | Database | Duplicate insert test | Not assessed |
| DATA-09.a | §6.2 task_assignees | task_assignees uses composite primary key (task_id,user_id) and FKs cascade. | MVP | Database | Schema/duplicate test | Not assessed |
| DATA-10.a | §6.2 comments | comments references task and author with cascade; body non-null; created_at default; updated_at nullable. | MVP | Database | FK/default tests | Not assessed |
| DATA-11.a | §6.2 comment_mentions | comment_mentions uses composite PK (comment_id,user_id) and both FKs cascade. | MVP | Database | Schema/duplicate tests | Not assessed |
| DATA-12.a | §6.2 attachments | Attachment metadata includes UUID id, storage_key, mime_type, file_size, original_filename, uploader and created_at with documented nullability/FKs. | Extended | Database | Schema contract tests | Not assessed |
| DATA-12.b | §6.2 attachments / CA-11 | Database CHECK enforces task_id XOR comment_id. | Extended | Database | Direct SQL constraint tests | Not assessed |
| DATA-13.a | §6.2 notifications | notifications includes UUID id, recipient FK, type, JSONB payload, nullable read_at and created_at default. | MVP | Database | Schema tests | Not assessed |
| DATA-14.a | §6.2 audit_logs | audit_logs stores actor FK (SET NULL), entity type/id, action, old/new JSONB, non-null correlation_id and timestamps as specified. | Extended | Database | Schema/content tests | Not assessed |
| DATA-14.b | §6.2 audit_logs | Audit append-only enforcement prevents update/delete at database level. | Extended | Database | Direct SQL tests | Not assessed |
| DATA-15.a | §6.2 risk_assessments | Risk assessment schema stores project_id, type, risk_score, severity, reason, recommendation, status, resolved_at and generated_at per frozen dictionary. | Extended | Database | Migration/round-trip tests | Not assessed |
| DATA-15.b | §6.2 / G-06 | Risk target identity (task/user) is explicitly represented before claiming multiple per-target risk correctness; current dictionary lacks target identity. | Extended | Database/API | Schema/uniqueness review | Blocked by contract gap |
| DATA-16.a | §6.2 Mandatory Indexes | Required indexes from the SRS are present for lookup/filter paths; index list is checked against the complete SRS section before sign-off. | Cross-cutting | Database | Migration/index review | Not assessed |
| DATA-17.a | §6.3 | Notifications retention is 6 months; audit and risk assessments retention is at least 12 months; attachment retention follows deletion/project archival policy. | Cross-cutting | Database/storage | Retention policy tests | Not assessed |
| DATA-18.a | §6.4 | Schema changes are migration-managed and can be applied to a clean database and upgraded database reproducibly. | Production | Database/CI | Migration CI test | Not assessed |

## 19. Non-functional requirements

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| NFR-01.a | NFR-PERF-01 | At 1,000 concurrent authenticated users under documented load profile, API p95 latency is <=500 ms. | Production Hardening | API/performance | Repeatable load test | Not assessed |
| NFR-01.b | NFR-PERF-02 / CA-02 | Real-time event latency is <=200 ms under documented test conditions. | Production Hardening | Realtime/performance | Timestamped multi-client test | Not assessed |
| NFR-01.c | NFR-PERF-03 | System sustains 1,000 authenticated concurrent users in the defined load scenario. | Production Hardening | Infrastructure | Load test report | Not assessed |
| NFR-02.a | NFR-AVAIL-01 | FYP-scoped monthly availability target is 90%; measurement window and excluded downtime are documented. | FYP target | Operations | Monitoring calculation | Not assessed |
| NFR-02.b | NFR-AVAIL-02 | 99.5% availability is a future production target dependent on HA/replica/failover; it is not claimed as current achieved availability. | Future target | Architecture/operations | Architecture/ops review | Not assessed |
| NFR-03.a | NFR-SEC-01 | Production transport enforces TLS 1.3 for external communication. | Production Hardening | Infrastructure/security | TLS config/scan | Not assessed |
| NFR-03.b | NFR-SEC-05 | CORS allowed origins are explicit and environment-specific; wildcard origin is not used with credentials. | Production Hardening | Security | Config/security tests | Not assessed |
| NFR-03.c | NFR-SEC-07a | HSTS header is Strict-Transport-Security: max-age=31536000; includeSubDomains. | Production Hardening | Infrastructure/security | Header scan | Not assessed |
| NFR-03.d | NFR-SEC-07b | X-Content-Type-Options is nosniff. | Production Hardening | Infrastructure/security | Header scan | Not assessed |
| NFR-03.e | NFR-SEC-07c | X-Frame-Options is DENY. | Production Hardening | Infrastructure/security | Header scan | Not assessed |
| NFR-03.f | NFR-SEC-07d | CSP uses default-src 'self' plus explicit allowlists for required assets/Socket.IO. | Production Hardening | Infrastructure/security | CSP/header review | Not assessed |
| NFR-03.g | NFR-SEC-07e | Referrer-Policy is strict-origin-when-cross-origin. | Production Hardening | Infrastructure/security | Header scan | Not assessed |
| NFR-03.h | NFR-SEC-07f | Permissions-Policy disables camera, microphone and geolocation as recommended. | Production Hardening | Infrastructure/security | Header scan | Not assessed |
| NFR-04.a | NFR-DATA-01 | Foreign keys, CHECK constraints and transactions enforce referential/business integrity. | Cross-cutting | Database | DB integration tests | Not assessed |
| NFR-04.b | NFR-DATA-02 | Reliability tests show no data corruption in defined test scenarios; failures/rollback preserve invariants. | Cross-cutting | Database | Failure injection/integrity tests | Not assessed |
| NFR-05.a | NFR-AUD-01 | Auditability records actor/action/entity/timestamp/changes for required mutations. | Extended | Database/backend | Audit coverage test | Not assessed |
| NFR-05.b | NFR-AUD-02 | Audit records are immutable and database-enforced append-only. | Extended | Database | DB update/delete rejection test | Not assessed |
| NFR-06.a | NFR-MAINT-01 | Modules expose stable service-level interfaces; internal deep imports across module boundaries are avoided. | Cross-cutting | Architecture | Static dependency review | Not assessed |
| NFR-06.b | NFR-MAINT-02 | OpenAPI is maintained alongside API implementation and reflects deployed endpoints. | Production | API/docs | Spec/route diff | Not assessed |
| NFR-07.a | NFR-USA-01 | Representative non-technical users can complete core workflows without requiring technical knowledge. | Cross-cutting | UI/UX | Usability test | Not assessed |
| NFR-07.b | NFR-USA-02 / UI-03 | Core interface meets WCAG 2.1 AA where feasible, including keyboard navigation, visible focus, accessible names, contrast and error announcements. | Cross-cutting | UI/accessibility | Automated + manual accessibility audit | Not assessed |
| NFR-07.c | NFR-USA-03 | A new user can complete core task creation within five minutes under the defined usability test. | Cross-cutting | UI/UX | Timed usability test | Not assessed |
| NFR-08.a | NFR-PRIV-01 | Users can access only authorized data; API responses, socket events and client caches do not leak other users'/projects' data. | Cross-cutting | Security/privacy | IDOR and cache isolation tests | Not assessed |
| NFR-09.a | NFR-BAK-01 | Backup procedure documents data/object-store scope, schedule, encryption, access control and restore procedure. | Production | Operations | Ops review | Not assessed |
| NFR-09.b | NFR-BAK-02 / AS-08 | Backup/restore process targets RPO <=24 hours and RTO <=4 hours for FYP scope. | Production | Operations | Restore drill | Not assessed |
| NFR-10.a | NFR-SCAL-01 | App, Redis and database have documented horizontal/vertical scaling paths and connection/resource limits. | Future/Production | Architecture | Architecture review/load test | Not assessed |
| NFR-11.a | NFR-TEST-01 | Critical modules meet >=80% automated test coverage in CI. | Production Hardening | CI/testing | Coverage report gate | Not assessed |
| NFR-12.a | NFR-OPS-01 | Application logging, error tracking and health checks are configured without logging secrets/passwords/tokens. | Production Hardening | Operations/security | Config/log review | Not assessed |
| NFR-12.b | NFR-OPS-02 | Logs are centralized where appropriate with correlation IDs and controlled retention/access. | Production Hardening | Operations | Log pipeline test | Not assessed |
| NFR-12.c | NFR-OPS-03 | Health endpoint reports application and dependency health (including required database/Redis dependencies). | Production Hardening | Operations | Health endpoint dependency failure test | Not assessed |
| NFR-13.a | NFR-RECON-01 | Reconnect uses exponential backoff and recovers missed events without duplicate or unauthorized replay. | Extended | Realtime | Reconnect/replay tests | Not assessed |
| NFR-13.b | NFR-INF-01 | Nginx passes Upgrade and Connection headers for WebSocket/Socket.IO traffic. | Production Hardening | Infrastructure | Deployed socket test | Not assessed |
| NFR-13.c | NFR-SESS-01 | Redis refresh-session and JTI blacklist lifecycle is validated for login, refresh, logout, expiry and revocation. | MVP/Production Hardening | Security | Session lifecycle test suite | Not assessed |

## 20. UI/UX, accessibility and frontend behaviour

The SRS specifies a React/Vite/Tailwind UI and WCAG 2.1 AA where feasible. The checks below operationalize those constraints without inventing new product functionality.

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| UI-01.a | UI-01 | Pages use the existing React/Vite/Tailwind stack and shared components/tokens rather than duplicating incompatible primitives. | Frontend | UI/build | Code review/build | Not assessed |
| UI-02.a | §3.1 / NFR-USA-01 | Core navigation and primary actions are labelled in understandable language and consistent across modules. | MVP | UI/UX | Heuristic/usability review | Not assessed |
| UI-02.b | NFR-USA-01 | Core workflows provide visible loading, empty, success, validation-error, permission-denied and server-error states as applicable. | MVP | UI | Scenario-based UI tests | Not assessed |
| UI-02.c | NFR-USA-03 | Task creation flow is completable by a new user in <=5 minutes under defined usability test conditions. | MVP | UI/UX | Timed usability test | Not assessed |
| UI-03.a | UI-03 / NFR-USA-02 | All interactive controls are reachable and operable using keyboard alone; focus order is logical and focus indicator visible. | Cross-cutting | Accessibility | Manual keyboard audit | Not assessed |
| UI-03.b | UI-03 / NFR-USA-02 | Form controls have programmatic labels; icon-only controls have accessible names; validation errors are associated with fields. | Cross-cutting | Accessibility | Automated/manual audit | Not assessed |
| UI-03.c | UI-03 / NFR-USA-02 | Text, controls, focus indicators and meaningful visual states meet WCAG 2.1 AA contrast criteria where applicable. | Cross-cutting | Accessibility | Contrast scanner/manual review | Not assessed |
| UI-03.d | UI-03 / NFR-USA-02 | Dialogs/modals manage focus, support keyboard dismissal where safe, and return focus to the triggering control. | Cross-cutting | Accessibility | Keyboard/modal tests | Not assessed |
| UI-03.e | UI-03 / NFR-USA-02 | Dynamic updates/errors are announced appropriately to assistive technology without unnecessary focus theft. | Cross-cutting | Accessibility | Screen reader/manual test | Not assessed |
| UI-04.a | FR-API-03 | Failed saves do not show success notifications or permanently discard entered data without warning. | MVP | UI | API failure injection | Not assessed |
| UI-04.b | DC-06 / NFR-AUTH-02 | Hiding a button or protecting a route is treated as UX only; backend permission tests independently prove access control. | Cross-cutting | UI/security | UI review plus API tests | Not assessed |
| UI-05.a | FR-AN-06 | Mock/demo data is explicitly labelled and visually distinguishable from server-backed/production data. | MVP prototype | UI/data | Data provenance review | Not assessed |
| UI-05.b | FR-AN-06 | No fabricated values are shown as live analytics or risk insights; charts match their underlying data. | MVP | UI/data | Fixture/source trace | Not assessed |
| UI-06.a | §3.1 | Core screens remain usable at supported viewport sizes; no required control is clipped or inaccessible. | Frontend | UI/responsive | Responsive viewport tests | Not assessed |
| UI-07.a | §3.1 | Destructive actions have clear intent and an appropriate confirmation/recovery pattern; accidental duplicate submission is prevented. | Frontend | UI | Interaction tests | Not assessed |
| UI-08.a | §3.1 / API standards | Dates, times, numeric effort and status/priority labels are presented consistently with API values and timezone semantics. | Frontend | UI/data | Format and timezone tests | Not assessed |

## 21. Deployment, CI/CD and operational acceptance

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| DEP-01.a | FR-DEP-01 | Docker Compose defines frontend, backend, PostgreSQL, Redis and Nginx services. | Production | Infrastructure | Compose config validation | Not assessed |
| DEP-01.b | §10.2 | Migration and seed jobs are explicit and repeatable; startup ordering waits for required dependencies/health. | Production | Infrastructure/database | Clean environment deployment test | Not assessed |
| DEP-02.a | FR-DEP-02 | Nginx reverse-proxies HTTP/API and Socket.IO/WebSocket traffic with correct Upgrade/Connection headers. | Production | Infrastructure | Deployed HTTP/socket smoke tests | Not assessed |
| DEP-03.a | FR-DEP-03 / NFR-SEC-01 | HTTPS/TLS is enabled and insecure production HTTP is redirected or rejected according to deployment policy. | Production | Infrastructure/security | TLS scan | Not assessed |
| DEP-04.a | FR-DEP-04 | Production secrets are injected through environment/secret management and are not committed to repository or exposed in client bundles/logs. | Production | Security/operations | Secret scan/config review | Not assessed |
| DEP-04.b | §10.3 | Database access is restricted to required services; CORS, JWT, rate limiting and secure headers are configured per environment. | Production | Security | Deployment security checklist | Not assessed |
| DEP-05.a | FR-DEP-05 | Prisma Migrate applies versioned schema changes reproducibly to a clean and existing database. | Production | Database/CI | Migration CI test | Not assessed |
| DEP-06.a | FR-DEP-06 | Development/demo seed data is reproducible and clearly separated from production data. | Production | Database | Seed idempotency test | Not assessed |
| DEP-07.a | FR-DEP-07 | GitHub CI/CD pipeline runs install, lint, tests, build and deployment gates in the documented order. | Production | CI/CD | Workflow run evidence | Not assessed |
| DEP-08.a | FR-DEP-08 | Backup strategy covers PostgreSQL and uploaded object/file storage, not just database metadata. | Production | Operations | Backup scope review | Not assessed |
| DEP-08.b | FR-DEP-08 / NFR-BAK-02 | Restore drill demonstrates the FYP RPO/RTO targets and records the outcome. | Production | Operations | Restore drill evidence | Not assessed |
| DEP-09.a | NFR-OPS-03 | Health endpoint identifies app and dependency health; unhealthy dependency is reflected in readiness/health output. | Production | Operations | Dependency-failure test | Not assessed |
| DEP-09.b | NFR-OPS-01/02 | Logs and error tracking are usable for diagnosis and correlate request/event/audit context without leaking sensitive values. | Production | Operations/security | Log review/test | Not assessed |
| DEP-10.a | §9 | CI includes unit, integration, API, realtime, PIRAE, security and performance test jobs appropriate to the delivered scope. | Production | CI/testing | Workflow/test inventory | Not assessed |

## 22. OpenAPI contract coverage checklist

This section is intentionally an operation-level cross-check gate rather than an invented endpoint catalogue. The approved OpenAPI document is the contract for exact paths, methods, parameters, request bodies, response schemas, security declarations and status codes.

| Atomic ID | Parent ID | Acceptance check | Phase | Layer | Verification | Audit status |
|---|---|---|---|---|---|---|
| OAS-01 | FR-API-01–08 | Inventory every OpenAPI path/method and map it to a UI operation, request schema, response schema, auth rule and error contract. | MVP | API/frontend | Generated route-to-screen mapping | Not assessed |
| OAS-02 | FR-AUTH-01–12 | Auth endpoints cover login, refresh, logout, current user/profile and admin-provisioned user lifecycle according to the spec. | MVP | API/frontend | OpenAPI/auth endpoint tests | Not assessed |
| OAS-03 | FR-TEAM-01–05 | Team create/list/detail/membership operations match the approved paths and RBAC rules. | MVP | API/frontend | Route contract tests | Not assessed |
| OAS-04 | FR-PROJ-01–07 | Project CRUD/membership operations include required project fields and role semantics. | MVP | API/frontend | Schema/contract tests | Not assessed |
| OAS-05 | FR-TASK-01–16 | Task CRUD/assignment/subtask/dependency/status operations match frozen enum/schema and phase semantics. | MVP/Extended | API/frontend | Contract/integration tests | Not assessed |
| OAS-06 | FR-COMM-01–05 | Comment/mention operations document edit-window and deletion permission/error behaviour. | MVP/Extended | API/frontend | Contract tests | Not assessed |
| OAS-07 | FR-NOTIF-01–04 | Notification list/read/read-all operations enforce recipient ownership and pagination contract. | MVP | API/frontend | Contract/security tests | Not assessed |
| OAS-08 | FR-ATT-01–05 | Upload/download/delete operations document multipart schema, max size/type errors, parent XOR and authorization. | Extended | API/frontend | Contract/file tests | Not assessed |
| OAS-09 | FR-AN-01–10 | Basic analytics paths are documented; Extended metrics require approved schema/routes before implementation. | MVP/Extended | API/frontend | OpenAPI coverage/gap review | Not assessed |
| OAS-10 | FR-AUD-01–06 | Audit query paths document role scope, filters, pagination and immutable read-only behaviour. | Extended | API/frontend | Contract/security tests | Not assessed |
| OAS-11 | FR-PIRAE-01–08 | Risk query/resolve operations document output schema, lifecycle, authorization and advisory-only semantics. | Extended | API/frontend | Contract/lifecycle tests | Not assessed |
| OAS-12 | FR-SOCK-01–05 | OpenAPI/realtime companion documentation links all 13 socket event schemas and authorization rules. | MVP/Extended | API/realtime | Event schema inventory | Not assessed |
| OAS-13 | Error catalogue | Every endpoint has documented 400/401/403/404/409/422/423/429/5xx behaviour where applicable; implementation and UI map the actual response. | Cross-cutting | API/frontend | Contract test matrix | Not assessed |
| OAS-14 | A G-03/G-04/G-06/G-09/G-10/G-11 | Known schema/path gaps are explicitly blocked from being represented as complete until approved contract changes exist. | Cross-cutting | API/database | Gap register sign-off | Not assessed |

## 23. Artifact reconciliation and source traceability

| Source | How it is used in this matrix | Conflict handling |
|---|---|---|
| SRS 3.0 consolidated baseline | Normative parent IDs, phases, role matrix, data dictionary, 13 events, NFRs, PIRAE formulas, testing/deployment constraints | Wins over every older source |
| OpenAPI specification | Exact REST operation/schema/security/error contract | Any mismatch becomes a contract gap; do not infer a missing endpoint |
| Errata Sheet | Correction provenance for role boundaries, error semantics, module ownership, logout, attachment and audit issues | Apply where compatible with SRS; SRS remains final authority |
| Sprint 1–2 | Repository scaffolding, architecture, authentication/session lifecycle | Treat sprint order as provenance, not priority override |
| Sprint 3–5 | Users/RBAC, Teams, Projects | Enforce independent global/team/project role scopes |
| Sprint 6–7 | Tasks, Kanban, dependency model and DONE gate | Dependency CRUD is MVP; DONE gate is Extended per SRS phase allocation |
| Sprint 8–10 | Comments/mentions, notifications, attachments | 15-minute edit rule, persistence/offline recovery, attachment policy and frozen event list |
| Sprint 11–12 | Analytics, audit, PIRAE | Separate basic/Extended analytics; audit scope/immutability; advisory-only risk rules |
| Sprint 13–14 | Deployment, operational and final documentation | Operational requirements remain distinct from frontend feature-completion claims |

## 24. Known contract gaps carried forward from Deliverable A

| Gap ID | Impacted atomic IDs | Decision required | Interim status |
|---|---|---|---|
| G-03 | PROJ-02.b, DATA-05.b | Explicit project start/end date fields and DTO/schema alignment | Blocked by contract gap |
| G-04 | TASK-04.d, TASK-14.a, AN-07.a | Task start date and authoritative completion timestamp/cycle-time source | Blocked by contract gap |
| G-05 | AUTH-01.c | Email-only login vs adding username column/unique normalization | Blocked by contract gap |
| G-06 | PIR-09.a, DATA-15.b | Risk target discriminator/FKs and uniqueness model | Blocked by contract gap |
| G-07 | PROJ-08.a | Freeze project status/priority enum values and validation | Blocked by contract gap |
| G-09 | AN-11.a, OAS-09 | Approve Extended analytics paths and response schemas | Blocked by contract gap |
| G-10 | NOTIF-05.a | Decide whether unread-count is a new API endpoint or derived from existing data | Not frozen |
| G-11 | ATT-06.b, OAS-08 | Approve attachment list endpoint(s) or define parent response source | Blocked by contract gap |
| G-14 | PIR-08.b, PIR-09.c | Confirm risk persistence/reoccurrence and supplemental score policy against schema/tests | Decision needed |
| G-20 | AUTH-11.e | Ensure expired-access logout revokes refresh session | Must be tested/fixed |

## 25. Definition of Done for an atomic requirement

An atomic row may be marked **Pass** in Deliverable C only when all applicable conditions are satisfied:

- [ ] The SRS parent ID and phase are correctly mapped.
- [ ] The implementation evidence is identified by exact repository path/line or deployed endpoint/config.
- [ ] The acceptance check is executed in a repeatable test (unit, integration, API, realtime, accessibility, performance, or operations test as appropriate).
- [ ] Negative cases are tested for permissions, invalid inputs and failure paths where applicable.
- [ ] UI-only evidence is not substituted for API/database/realtime/security evidence.
- [ ] Contract gaps are marked Blocked, not silently passed.
- [ ] Evidence records test environment, build/commit, observed result and reviewer/date.
- [ ] Related parent requirement is not marked complete if any mandatory child check fails.

## 26. Deliverable B completion checklist

- [x] SRS 3.0 canonical functional requirement families are represented and subdivided into individually verifiable checks.
- [x] Non-functional targets include a verification method and measurable acceptance threshold where the SRS supplies one.
- [x] UI/UX and accessibility checks are separated from backend/system guarantees.
- [x] Business rules cover role scope, state transitions, comment window, attachment XOR, event authorization and PIRAE non-autonomy.
- [x] Frozen domain entities and integrity constraints are mapped to schema-level checks.
- [x] All 13 frozen realtime events have individual payload/room acceptance checks.
- [x] PIRAE workload/delay/dependency/priority formulas and boundaries have individual checks.
- [x] API envelope, pagination, validation, error status, rate limiting and OpenAPI contract checks are included.
- [x] Deployment, CI/CD, secrets, TLS, backups, health and logging requirements are included.
- [x] Artifact-derived requirements and unresolved contract gaps remain explicitly traceable.
- [x] Audit status is left unassessed so Deliverable C can determine implemented/partial/missing/out-of-scope from actual code and tests.
- [x] No prototype code has been changed as part of Deliverable B.

**Deliverable B conclusion:** This matrix is the acceptance-test baseline for the next frontend audit. It does not assert that the prototype passes any requirement. The next deliverable should attach actual repository evidence to these atomic checks, assign defensible statuses, and report frontend-specific compliance separately from backend/infrastructure dependencies.


## 27. Exact OpenAPI operation-by-operation traceability (60 operations)

The source file `public/assets/aistudio/OpenApi-Specification.txt` declares 43 paths and 60 operations. Its version label is not authoritative; operation contracts are accepted only where compatible with SRS 3.0. The following rows make the operation inventory explicit. For each operation, the test must additionally validate the actual OpenAPI schema and role/permission declaration, not merely the generic outcome text.

| Atomic ID | Method | Path | operationId | Acceptance check | Audit status |
|---|---|---|---|---|---|
| OAS-OP-01 | POST | `/auth/login` | `authLogin` | Authenticate user and issue tokens: request matches application/json; parameters —; success 200 Authenticated; documented responses [200, 401, 422, 423, 429] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-02 | POST | `/auth/refresh` | `authRefresh` | Exchange refresh token for a new access token: request matches application/json; parameters —; success 200 New access token issued; documented responses [200, 401] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-03 | POST | `/auth/logout` | `authLogout` | Logout: blacklist access JTI and revoke refresh session (AC-AUTH-11): request matches —; parameters —; success 200; documented responses [200, 401] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-04 | GET | `/auth/me` | `authMe` | Get current authenticated user: request matches —; parameters —; success 200 Current user; documented responses [200, 401] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-05 | PATCH | `/auth/password` | `authChangePassword` | Change own password (revokes all refresh sessions): request matches application/json; parameters —; success 200; documented responses [200, 401, 422] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-06 | POST | `/auth/register` | `authRegister` | Admin-provisioned account creation (CA-04: no public self-registration): request matches application/json; parameters —; success 201 User created; documented responses [201, 403, 409, 422] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-07 | GET | `/users` | `listUsers` | List users (admin only): request matches —; parameters undefined:undefined, undefined:undefined, query:search, query:role, query:isActive; success 200 Paginated users; documented responses [200, 403] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-08 | POST | `/users` | `createUser` | Create user (admin only): request matches application/json; parameters —; success 201 User created; documented responses [201, 403, 409, 422] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-09 | PATCH | `/users/{userId}/role` | `updateUserRole` | Change user global role (admin only): request matches application/json; parameters —; success 200 Role updated; documented responses [200, 403] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-10 | PATCH | `/users/{userId}/status` | `updateUserStatus` | Activate / deactivate user (admin only, FR-AUTH-07): request matches application/json; parameters —; success 200 Status updated; documented responses [200, 403] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-11 | GET | `/teams` | `listTeams` | List teams visible to caller: request matches —; parameters undefined:undefined, undefined:undefined; success 200 Paginated teams; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-12 | POST | `/teams` | `createTeam` | Create team (Administrator only, FR-AUTH-12 / CA-05): request matches application/json; parameters —; success 201 Team created; documented responses [201, 403, 409, 422] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-13 | GET | `/teams/{teamId}` | `getTeam` | Get team details: request matches —; parameters —; success 200 Team; documented responses [200, 404] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-14 | PATCH | `/teams/{teamId}` | `updateTeam` | Update team: request matches —; parameters —; success 200 Updated; documented responses [200] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-15 | DELETE | `/teams/{teamId}` | `deleteTeam` | Delete team (admin only): request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized deletion/archive takes effect once and denied/invalid requests leave state unchanged. | Not assessed |
| OAS-OP-16 | GET | `/teams/{teamId}/members` | `listTeamMembers` | List team members: request matches —; parameters —; success 200 Members; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-17 | POST | `/teams/{teamId}/members` | `addTeamMember` | Add team member (Admin/PM): request matches —; parameters —; success 201 Added; documented responses [201] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-18 | DELETE | `/teams/{teamId}/members/{userId}` | `removeTeamMember` | Remove team member: request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized deletion/archive takes effect once and denied/invalid requests leave state unchanged. | Not assessed |
| OAS-OP-19 | GET | `/projects` | `listProjects` | List projects visible to caller (FR-PROJ-05): request matches —; parameters undefined:undefined, undefined:undefined, query:teamId, query:status, query:priority; success 200 Paginated projects; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-20 | POST | `/projects` | `createProject` | Create project (Admin/PM, FR-PROJ-01): request matches application/json; parameters —; success 201 Project created; documented responses [201, 403, 422] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-21 | GET | `/projects/{projectId}` | `getProject` | Get project by ID: request matches —; parameters —; success 200 Project; documented responses [200, 404] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-22 | PATCH | `/projects/{projectId}` | `updateProject` | Update project (Manager+ only): request matches —; parameters —; success 200 Updated; documented responses [200] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-23 | DELETE | `/projects/{projectId}` | `archiveProject` | Archive project (Manager+): request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized deletion/archive takes effect once and denied/invalid requests leave state unchanged. | Not assessed |
| OAS-OP-24 | GET | `/projects/{projectId}/members` | `listProjectMembers` | List project members: request matches —; parameters —; success 200 Members; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-25 | POST | `/projects/{projectId}/members` | `addProjectMember` | Add project member with role (FR-PROJ-04): request matches —; parameters —; success 201 Added; documented responses [201] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-26 | PATCH | `/projects/{projectId}/members/{userId}` | `updateProjectMemberRole` | Change project member role: request matches —; parameters —; success 200 Updated; documented responses [200] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-27 | DELETE | `/projects/{projectId}/members/{userId}` | `removeProjectMember` | Remove project member: request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized deletion/archive takes effect once and denied/invalid requests leave state unchanged. | Not assessed |
| OAS-OP-28 | GET | `/projects/{projectId}/progress` | `getProjectProgress` | Project progress snapshot (FR-PROJ-05, FR-AN-01): request matches —; parameters —; success 200 Progress; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-29 | GET | `/projects/{projectId}/tasks` | `listProjectTasks` | List project tasks (FR-TASK-01..09): request matches —; parameters undefined:undefined, undefined:undefined, query:status, query:priority, query:assigneeId; success 200 Paginated tasks; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-30 | POST | `/projects/{projectId}/tasks` | `createTask` | Create task (FR-TASK-01): request matches application/json; parameters —; success 201 Task created; documented responses [201] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-31 | GET | `/tasks/{taskId}` | `getTask` | Get task by ID: request matches —; parameters —; success 200 Task; documented responses [200, 404] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-32 | PATCH | `/tasks/{taskId}` | `updateTask` | Update task (FR-TASK-02): request matches —; parameters —; success 200 Updated; documented responses [200] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-33 | DELETE | `/tasks/{taskId}` | `deleteTask` | Delete/archive task (FR-TASK-03): request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized deletion/archive takes effect once and denied/invalid requests leave state unchanged. | Not assessed |
| OAS-OP-34 | PATCH | `/tasks/{taskId}/status` | `updateTaskStatus` | Change task status - Kanban transition (FR-KAN-02, AC-KAN-03): request matches application/json; parameters —; success 200 Status updated; documented responses [200, 409] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-35 | POST | `/tasks/{taskId}/assignees` | `assignTask` | Assign user to task (FR-TASK-04): request matches —; parameters —; success 200 Assignee added; documented responses [200] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-36 | DELETE | `/tasks/{taskId}/assignees/{userId}` | `unassignTask` | Unassign user from task: request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized deletion/archive takes effect once and denied/invalid requests leave state unchanged. | Not assessed |
| OAS-OP-37 | POST | `/tasks/{taskId}/subtasks` | `addSubtask` | Add subtask (FR-TASK-06): request matches —; parameters —; success 200 Subtask added; documented responses [200] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-38 | GET | `/tasks/{taskId}/history` | `getTaskHistory` | Task change history (FR-TASK-09): request matches —; parameters —; success 200 History; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-39 | GET | `/tasks/{taskId}/dependencies` | `listTaskDependencies` | List dependencies of a task (FR-TASK-07): request matches —; parameters —; success 200 Dependencies; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-40 | POST | `/tasks/{taskId}/dependencies` | `addTaskDependency` | Add blocking dependency: request matches application/json; parameters —; success 201 Dependency created; documented responses [201, 409] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-41 | DELETE | `/tasks/{taskId}/dependencies/{dependencyId}` | `removeTaskDependency` | Remove dependency: request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized deletion/archive takes effect once and denied/invalid requests leave state unchanged. | Not assessed |
| OAS-OP-42 | GET | `/tasks/{taskId}/comments` | `listTaskComments` | List task comments (FR-COMM-01): request matches —; parameters —; success 200 comments; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-43 | POST | `/tasks/{taskId}/comments` | `createComment` | Add comment with optional mentions (FR-COMM-01, FR-COMM-02): request matches application/json; parameters —; success 201 Comment created; documented responses [201] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-44 | PATCH | `/comments/{commentId}` | `updateComment` | Edit own comment within 15 minutes (FR-COMM-03, AC-COL-03): request matches application/json; parameters —; success 200 Comment updated; documented responses [200, 403] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-45 | DELETE | `/comments/{commentId}` | `deleteComment` | Delete comment (FR-COMM-05): request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized deletion/archive takes effect once and denied/invalid requests leave state unchanged. | Not assessed |
| OAS-OP-46 | GET | `/notifications` | `listNotifications` | List notifications for current user (FR-NOTIF-02): request matches —; parameters undefined:undefined, undefined:undefined, query:unreadOnly; success 200 Notifications; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-47 | PATCH | `/notifications/{notificationId}/read` | `markNotificationRead` | Mark notification as read: request matches —; parameters —; success 200 Marked read; documented responses [200] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-48 | PATCH | `/notifications/read-all` | `markAllNotificationsRead` | Mark all notifications as read: request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |
| OAS-OP-49 | POST | `/attachments` | `uploadAttachment` | Upload attachment linked to task XOR comment (FR-ATT-01..05, AC-DATA-07): request matches multipart/form-data; parameters —; success 201 Uploaded; documented responses [201, 413, 415] are returned using the standard envelope/schema; authorized request persists exactly one intended mutation and read-back reflects accepted state. | Not assessed |
| OAS-OP-50 | GET | `/attachments/{attachmentId}` | `downloadAttachment` | Download attachment: request matches —; parameters —; success 200 Binary file; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-51 | DELETE | `/attachments/{attachmentId}` | `deleteAttachment` | Delete attachment (FR-ATT-04): request matches —; parameters —; success 200; documented responses [200] are returned using the standard envelope/schema; authorized deletion/archive takes effect once and denied/invalid requests leave state unchanged. | Not assessed |
| OAS-OP-52 | GET | `/analytics/projects/{projectId}` | `getProjectAnalytics` | Project analytics (FR-AN-01..10): request matches —; parameters —; success 200 Analytics; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-53 | GET | `/analytics/projects/{projectId}/workload` | `getProjectWorkload` | Project workload distribution (FR-AN-04): request matches —; parameters —; success 200 Workload; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-54 | GET | `/analytics/projects/{projectId}/overdue` | `getOverdueTasks` | Overdue tasks (FR-AN-02): request matches —; parameters —; success 200 Overdue tasks; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-55 | GET | `/audit` | `listAuditLogs` | Query audit trail (Admin/PM; FR-AUD-01..06): request matches —; parameters undefined:undefined, undefined:undefined, query:entityType, query:entityId, query:actorId, query:action, query:from, query:to; success 200 Audit entries; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-56 | GET | `/audit/{auditId}` | `getAuditLog` | Get a single audit record: request matches —; parameters —; success 200 Audit entry; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-57 | GET | `/risks` | `listRisks` | List risk assessments (PM/Admin; FR-PIRAE-07): request matches —; parameters undefined:undefined, undefined:undefined, query:projectId, query:riskType, query:severity, query:status; success 200 Risks; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-58 | GET | `/risks/projects/{projectId}` | `getProjectRisks` | Latest risk snapshot for a project (FR-PIRAE-07): request matches —; parameters —; success 200 Risks; documented responses [200] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-59 | GET | `/risks/{riskId}` | `getRisk` | Get single risk assessment: request matches —; parameters —; success 200 Risk; documented responses [200, 404] are returned using the standard envelope/schema; response is scoped to caller permissions and returns authoritative data. | Not assessed |
| OAS-OP-60 | PATCH | `/risks/{riskId}/resolve` | `resolveRisk` | Mark risk resolved (PM/Admin; FR-PIRAE-08). Advisory only.: request matches —; parameters —; success 200 Resolved; documented responses [200, 403] are returned using the standard envelope/schema; authorized update persists and read-back reflects accepted changes; denied/invalid requests do not mutate state. | Not assessed |

### 27.1 OpenAPI-wide contract acceptance

- [ ] Every path above is compared to the checked-out OpenAPI file at the same branch/commit as the implementation.
- [ ] Every operation has a role/permission test for each system role and resource scope.
- [ ] Every request schema is tested for valid, invalid, missing, extra, and boundary values where applicable.
- [ ] Every response schema and status code is validated against the operation definition.
- [ ] List operations prove pagination/filter/sort behaviour where the contract defines them.
- [ ] Destructive/mutation operations prove no state change on 401/403/404/409/422/423/429 and server errors as applicable.
- [ ] Any endpoint added to UI but absent from the approved OpenAPI is recorded as a contract gap, not silently accepted.
