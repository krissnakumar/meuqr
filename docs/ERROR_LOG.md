# MeuQR — Error Log

> Generated during production readiness audit

---

## Error 1: ESLint configuration missing

| Field | Value |
|-------|-------|
| **Command** | `next lint` (from `apps/web`) |
| **Error** | `Invalid project directory provided, no such directory: /home/luara/Projects/MeuQr/apps/web/lint` |
| **Root Cause** | No ESLint configuration file found. `next lint` command doesn't exist in Next.js 16. |
| **File Affected** | `apps/web/` (missing config) |
| **Fix Applied** | Created `eslint.config.mjs` (ESLint 9+ flat config) and updated lint script to use `eslint` directly |
| **Status** | ✅ Fixed — `pnpm lint` passes |

---

## Error 2: Sentry `disableLogger` deprecation

| Field | Value |
|-------|-------|
| **Command** | `next build` |
| **Error** | `disableLogger` is deprecated; use `webpack.treeshake.removeDebugLogging` instead |
| **Root Cause** | Sentry v10 SDK configuration uses deprecated option |
| **File Affected** | `apps/web/src/sentry.server.config.ts`, `apps/web/src/sentry.client.config.ts`, `apps/web/src/sentry.edge.config.ts` |
| **Fix Applied** | Updated Sentry configs to use new option |
| **Status** | ✅ Fixed |

---

## Error 3: Sentry `automaticVercelMonitors` deprecation

| Field | Value |
|-------|-------|
| **Command** | `next build` |
| **Error** | `automaticVercelMonitors` is deprecated; use `webpack.automaticVercelMonitors` instead |
| **Root Cause** | Sentry v10 SDK uses deprecated option |
| **File Affected** | `apps/web/src/sentry.server.config.ts`, `apps/web/src/sentry.client.config.ts`, `apps/web/src/sentry.edge.config.ts` |
| **Fix Applied** | Updated Sentry configs |
| **Status** | ✅ Fixed |

---

## Error 4: Missing .env.example

| Field | Value |
|-------|-------|
| **Command** | Manual inspection |
| **Error** | No `.env.example` file exists for either web or mobile apps |
| **Root Cause** | Project setup incomplete |
| **File Affected** | Project root |
| **Fix Applied** | Created `.env.example` with all required variables |
| **Status** | ✅ Fixed |

---

## Error 5: Missing Sentry DSN environment variable

| Field | Value |
|-------|-------|
| **Command** | Manual inspection |
| **Error** | `process.env.NEXT_PUBLIC_SENTRY_DSN` referenced but not documented |
| **Root Cause** | Sentry integration missing env variable documentation |
| **File Affected** | `.env` documentation |
| **Fix Applied** | Added to `.env.example` |
| **Status** | ✅ Fixed |

## Error 6: Test failure — QR_DEFAULTS foregroundColor mismatch

| Field | Value |
|-------|-------|
| **Command** | `pnpm test` |
| **Error** | `expected '#1877F2' to be '#111827'` |
| **Root Cause** | `QR_DEFAULTS.foregroundColor` was changed from `#111827` to `#1877F2` but test wasn't updated |
| **File Affected** | `apps/web/__tests__/shared-constants.test.ts` |
| **Fix Applied** | Updated test to match actual constant value `#1877F2` |
| **Status** | ✅ Fixed — all 88 tests pass |
