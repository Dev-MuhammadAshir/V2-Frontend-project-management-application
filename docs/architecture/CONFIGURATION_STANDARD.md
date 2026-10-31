# Frontend Configuration and Environment Standard

**Status:** Proposed implementation standard.  
**Scope:** Browser SPA configuration only.

## 1. Principles

- Validate configuration once at startup and expose a typed object.
- Build-time public variables are public; bundled values are inspectable.
- No password, JWT signing secret, database URL, Redis credential, private key or storage secret belongs in frontend config.
- Demo/API mode is explicit. API mode without required config fails closed.
- Components do not read environment variables directly.
- Deployment secret injection and server configuration belong to DevOps/backend.

## 2. Proposed public configuration shape

~~~ts
type RuntimeMode = "demo" | "api";

type FrontendConfig = {
  mode: RuntimeMode;
  apiBaseUrl: string | null;
  requestTimeoutMs: number;
  appName: string;
  buildVersion: string;
  realtimeEnabled: boolean;
  realtimeUrl: string | null;
};
~~~

This is a design shape, not a frozen variable-name contract. Final injection method depends on deployment constraints.

## 3. Validation rules

| Setting | Demo | API |
|---|---|---|
| Mode | Explicit demo | Explicit api |
| API base URL | Not required | Required absolute URL; HTTPS in production; local HTTP only in local development |
| Timeout | Positive bounded integer | Positive bounded integer |
| Realtime | Disabled or clearly simulated | Enabled only with verified endpoint and handshake |
| Build version | Public metadata | Public metadata |
| Secrets | Prohibited | Prohibited |

Production must reject demo mode and non-HTTPS service URLs unless an approved local-development exception applies.

## 4. Runtime behaviour

**Demo:** deterministic fixtures; versioned/namespaced local storage; visible demo label; simulated status labelled; no production credentials.

**API:** REST origin from config; no local fallback on errors; session follows approved auth contract; realtime disabled until verified; API failure shown as error/offline.

## 5. Demo persistence

Demo storage uses a dedicated namespace, schema version and runtime validation. Handle malformed, unavailable and quota-exceeded storage without crashing startup. Provide deterministic reset/seed. Never read demo records in API mode. Never store credentials or sensitive user data.

Migration:
1. Read schema version.
2. Validate.
3. Apply only an explicit migration.
4. If invalid/unknown, safely reset or quarantine and notify.
5. Never silently coerce unknown enum values.

## 6. Change control

Each config change documents purpose/environment, public exposure, validation/default, mode behaviour, security implications, missing/invalid tests and deployment docs update.

## 7. Operational caution

SRS describes API URLs and Docker Compose/Nginx deployment. These are not automatically browser-reachable origins. Production frontend must use an approved browser origin with CORS and WebSocket proxy configuration. Never ship internal hostnames or service credentials in a public bundle.

## 8. Acceptance

- [ ] Single validated configuration module.
- [ ] API mode fails closed without base URL.
- [ ] Production build cannot select demo via login UI.
- [ ] No secret appears in built assets.
- [ ] Demo storage is versioned, validated and isolated.
- [ ] Realtime disabled until endpoint exists.
- [ ] Local/test/staging/production settings documented and tested.
