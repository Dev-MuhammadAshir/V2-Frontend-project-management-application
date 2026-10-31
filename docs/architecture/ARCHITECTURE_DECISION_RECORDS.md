# Frontend Architecture Decision Records

**Status:** Proposed decisions for review; not yet approved for implementation.  
**Authority:** SRS 3.0. These ADRs cannot override the requirements baseline.

## ADR-001 — Preserve the existing SPA
**Decision:** Modernize the React SPA incrementally. Preserve route URLs, pages, layout, shared UI, modals, drawers and workflows.  
**Context:** Existing product surface is substantial; rewrite introduces avoidable migration and parity risk.  
**Consequences:** Transitional compatibility is allowed with explicit removal criteria.  
**Rejected:** Full rewrite, microfrontend split, unapproved redesign.  
**Verification:** Route inventory and E2E parity.

## ADR-002 — Backend authority for security and business state
**Decision:** Backend validates identity, role, membership, resource access, mutations, audit and risk. Client guards are UX only.  
**Context:** SRS requires backend authorization for every protected operation and PostgreSQL as system of record.  
**Consequences:** UI handles 401/403/conflict and reconciles rejected changes.  
**Rejected:** Client-only RBAC, browser-generated immutable audit, client-side final state.  
**Verification:** Negative API authorization tests.

## ADR-003 — Ports/adapters and explicit composition
**Decision:** Feature use cases depend on capability ports; composition root selects demo or API adapters.  
**Context:** AppContext currently combines domain state, browser persistence, UI effects and simulated realtime.  
**Consequences:** Extract incrementally; do not mechanically split context.  
**Rejected:** Direct fetch in pages or one global repository for every capability.  
**Verification:** Provider substitution and import-boundary tests.

## ADR-004 — Honest isolated demo mode
**Decision:** Demo fixtures and local persistence live behind a demo provider, namespaced/versioned. API mode never falls back to demo on failure.  
**Context:** Prototype data is useful but is not shared production persistence or real authentication.  
**Consequences:** Role switch and simulated latency are demo-only; production labels require service evidence.  
**Rejected:** localStorage as production database; silent demo fallback.  
**Verification:** Production config cannot enable demo identity selection.

## ADR-005 — REST primary; Socket.IO supplemental
**Decision:** REST handles CRUD/query; Socket.IO events trigger targeted invalidation/refetch. Reconnect uses REST snapshots unless replay cursor is specified.  
**Context:** SRS defines REST primary and Socket.IO complementary.  
**Consequences:** Event receipt is not mutation confirmation or authorization.  
**Rejected:** Socket-only writes.  
**Verification:** Reconnect, missed-event and API integration tests.

## ADR-006 — Runtime validation at trust boundaries
**Decision:** Parse API JSON and form inputs with Zod schemas aligned to approved OpenAPI; map DTOs into view models.  
**Context:** TypeScript alone does not validate runtime JSON; current types include compatibility drift.  
**Consequences:** Contract changes require schema/mapping tests.  
**Rejected:** Blind type assertions on response payloads.  
**Verification:** Valid/invalid contract fixtures.

## ADR-007 — No dependency additions in Phase 2
**Decision:** Add no packages in this documentation phase. Evaluate TanStack Query and Socket.IO Client in separate implementation PRs.  
**Context:** SRS names them as target technologies; current package manifest does not declare them.  
**Consequences:** Version, bundle, security, license and migration review before addition.  
**Rejected:** Unreviewed dependency install.  
**Verification:** Phase 2 package diff remains empty.

## ADR-008 — Canonical enums and role scopes
**Decision:** API DTOs use SRS values exactly. Legacy values are mapped at a temporary boundary. Global, team and project roles remain distinct.  
**Context:** SRS freezes status, priority, role and risk lifecycle vocabularies.  
**Consequences:** Unknown legacy values require explicit reconciliation.  
**Rejected:** Expanding server enums merely to fit current UI aliases.  
**Verification:** Exhaustive mapper tests.

## ADR-009 — No fabricated operational/analytics status
**Decision:** Production metrics/status derive from verified backend/operational signals. Demo values are labelled.  
**Context:** Static audit found simulated realtime, hard-coded historical velocity, client audit and unsupported compliance claims.  
**Consequences:** Missing data is unavailable/empty, not invented.  
**Rejected:** Random latency, synthetic production metrics and UI-only compliance claims.  
**Verification:** Data provenance review.

## ADR-010 — PIRAE remains advisory
**Decision:** Display risk/reason/recommendation and supported lifecycle only. No automatic task/deadline/assignment mutation.  
**Context:** SRS explicitly prohibits autonomous project/task mutation.  
**Consequences:** No auto-fix/reschedule feature.  
**Rejected:** Autonomous project management.  
**Verification:** Risk action tests prove no task mutation.

## ADR-011 — Attachments are protected resources
**Decision:** UI performs feedback validation and transfers bytes through approved backend/storage contract. Never expose raw storage keys as public URLs.  
**Context:** SRS requires upload/download authorization, metadata and XOR parent association.  
**Consequences:** Upload transport and signed URL lifecycle require contract confirmation.  
**Rejected:** Metadata-only action presented as completed upload.  
**Verification:** Content, size, parent and authorization tests.

## ADR-012 — Design is not runtime verification
**Decision:** Phase 2 is architecture documentation only. Phase 0 build/typecheck/tests/browser/a11y/security/performance checks remain outstanding.  
**Context:** Static repository inspection did not execute application checks.  
**Consequences:** No production-ready or build-passed claim.  
**Rejected:** Treating unrun checks as pass.  
**Verification:** CI artifacts tied to exact commit.

## Approval register

| ADR | Status | Required reviewers | Required before |
|---|---|---|---|
| 001–012 | Proposed | Product owner, frontend lead, architect; security/DevOps where relevant | Implementation PR |

Any conflict with SRS 3.0 must be escalated through formal requirements change control.
