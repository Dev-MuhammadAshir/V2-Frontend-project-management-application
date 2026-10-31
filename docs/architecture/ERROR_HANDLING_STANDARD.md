# Frontend Error Handling Standard

**Status:** Proposed implementation standard.  
**Contract authority:** SRS 3.0 and operation-specific OpenAPI responses.

## 1. Objectives

Provide predictable, accessible and secure feedback without hiding failures, leaking server internals or treating optimistic state as authoritative. Preserve existing UI patterns.

## 2. Error categories

| Category | Meaning | UI response | Retry |
|---|---|---|---|
| Validation | Invalid input/payload; OpenAPI includes 422 | Inline field errors and summary | Correct input |
| Unauthenticated | 401 | One approved refresh attempt, otherwise login | Never loop |
| Forbidden | 403 | Explain unavailable access | No blind retry |
| Not found | 404 | Not-found state or safe navigation | Usually no |
| Conflict | 409 | Explain conflict and refresh authoritative state | User-mediated |
| Locked | 423 where operation specifies it | Safe lockout guidance | No automatic retry |
| Rate limited | 429 | Respect Retry-After | Bounded retry for safe reads |
| Network | Offline, DNS, timeout | Connection-lost state; preserve safe draft | Bounded retry for idempotent reads |
| Server | 5xx | Generic message plus correlation ID | Bounded retry for idempotent reads |
| Unexpected | Invalid response or client defect | Safe fallback and sanitized diagnostics | No blind retry |

Use exact status and application code per operation. Do not assume every endpoint returns every listed status.

## 3. Error envelope

The OpenAPI companion contract describes:

~~~json
{
  "success": false,
  "error": {
    "code": "APPLICATION_ERROR_CODE",
    "message": "Safe user-facing message"
  }
}
~~~

Preserve HTTP status, application code, safe message, field details only when contractually supplied, Retry-After and correlation ID. Do not assume undocumented properties.

## 4. Handling flow

~~~mermaid
flowchart TD
  REQ[Request] --> RES{Result}
  RES -->|2xx| PARSE[Validate response schema]
  PARSE -->|valid| MAP[Map DTO]
  PARSE -->|invalid| BAD[Unexpected contract error]
  RES -->|401| AUTH[Single approved refresh]
  AUTH -->|success| RETRY[Retry original once]
  AUTH -->|failure| SIGNOUT[Clear session and redirect]
  RES -->|403| DENY[Forbidden]
  RES -->|404| MISS[Not found]
  RES -->|409| CONFLICT[Refresh and explain]
  RES -->|422| VALID[Map field errors]
  RES -->|429| LIMIT[Respect Retry-After]
  RES -->|5xx/network| FAIL[Retryable failure state]
~~~

## 5. Mutation and optimistic UI

- Prefer server-confirmed updates for sensitive workflows.
- If optimistic updates are used, keep previous snapshot and rollback on failure.
- On conflict, refetch before offering retry.
- Never show success before server confirmation.
- Never automatically retry non-idempotent mutations without idempotency/replay contract.
- Preserve safe form drafts; never persist credentials.
- Realtime event receipt does not prove a mutation succeeded.

## 6. Accessibility

- Associate field errors with inputs and announce them.
- Focus an error summary after failed submission where appropriate.
- Toasts supplement; important errors remain in context.
- Use plain language and next steps.
- Stop loading indicators on success, failure, cancellation and timeout.
- Distinguish empty data from failed loading.
- Offer retry only for safe/retryable operations.

## 7. Security and diagnostics

Never log passwords, authorization headers, tokens, secrets, private file URLs or sensitive payloads. Do not render stack traces, SQL errors, internal paths or exception messages. Preserve a correlation ID and sanitized operation/status/code/timestamp context. Respect backend resource-masking policy.

## 8. Demo mode

Demo errors are labelled demo/local. They must not mimic successful remote authentication, production connectivity or server-side audit guarantees. Simulated delay is not a network health metric.

## 9. Acceptance

- [ ] Known response categories mapped.
- [ ] Unknown/malformed responses fail safely.
- [ ] Unsafe mutations are not automatically retried.
- [ ] 401 refresh cannot loop or stampede.
- [ ] Conflicts restore authoritative state.
- [ ] Field errors are accessible.
- [ ] Sensitive values are redacted.
- [ ] Tests cover success, validation, 401, 403, 404, 409, 422, 429, network and 5xx.
