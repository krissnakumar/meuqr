# MeuQR — Security Policies & API Hardening

This document outlines the security architecture and countermeasures deployed to protect MeuQR's public APIs and data flows.

## 1. Zero-Trust Public Inputs

Public forms (orders, quote requests, appointments, leads) submit data to anonymous REST endpoints (`/api/*`). The system treats all public requests as untrusted.

### Countermeasures:
1. **Zod Parsing**: Every request payload is strictly validated using its shared Zod schema. Extra fields are stripped.
2. **Spam Honey Pot**: Forms contain a hidden `honeypot` field. If filled in, the request is flagged as a bot submission and immediately blocked (status code `400`).
3. **Data Constraint Boundaries**:
   - Customer name max length: 80 chars.
   - Message length limit: 500 chars (prevents database column exhaustion).
   - Order items size: max 30 items per request.
   - Phone validation: strict regex validation checking for standard Brazilian format with DDD.

---

## 2. Supabase RLS & Admin Client Isolation

To safeguard business operational data, Supabase Row-Level Security (RLS) is active on all main tables.
- **Client SDK**: Uses the standard Supabase client with active user session tokens. This ensures users can only read/edit resources they own.
- **Anonymous Guests**: Cannot directly execute operations on other businesses' tables.
- **Public API Route (`/api/*`)**: To allow public guests to insert orders/quotes, the server client securely queries permissions, performs security checks, and then executes the database insertion using the private `supabaseAdmin` service role client.

---

## 3. Operations Scoping Validation

Before the server client executes an insert on behalf of a public guest, it performs two essential scoping queries in the database:
1. **Business Status**: Checks if the target business exists and is active (`is_active = true`). If inactive or disabled, the insert is rejected with status `403`.
2. **Module Validation**: Checks if the specific operational module is enabled in `business_enabled_modules` for that business. This prevents orders or appointments from being submitted to a business that doesn't offer these services.

---

## 4. Rate Limiting

Rate limits are configured on all tracking and operational endpoints (`/api/track/*` and `/api/orders`, `/api/quote-requests`, `/api/appointments`, `/api/leads`).
- Identifies requests by client IP.
- Uses sliding window counters.
- Exceeded limits trigger status code `429 Too Many Requests`.
