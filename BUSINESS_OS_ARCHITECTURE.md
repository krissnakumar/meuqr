# MeuQR Business OS Architecture Guide

## Overview
The MeuQR platform has transitioned from a flat, user-centric structure to a **Multi-Tenant Business OS**. This document serves as a guideline for developers and maintainers working on the platform to ensure new features adhere to the correct data and routing models.

## The Core Concept
Previously, all resources (Pages, Products, Leads, Orders) were globally attached to the logged-in User. 

In the **Business OS**, the `Business` is the central entity. A single user can own or be a staff member of multiple Businesses. All operational data must belong to a specific Business, not directly to the User.

### 1. Routing Hierarchy
All operational management pages **MUST** be nested under the business route:
`apps/web/src/app/(dashboard)/dashboard/business/[id]/`

**Correct (Business-Scoped):**
- `/dashboard/business/[id]/pages` (Manage pages for this business)
- `/dashboard/business/[id]/orders` (Manage orders for this business)
- `/dashboard/business/[id]/leads` (View leads for this business)

**Incorrect (Legacy Global Routes - Do Not Use):**
- `/dashboard/pages`
- `/dashboard/orders`
- `/dashboard/leads`

*Note: Global routes like `/dashboard/analytics`, `/dashboard/settings`, and `/dashboard/billing` still exist, but they are strictly for account-level settings and cross-business aggregated summaries.*

## 2. Database & Data Fetching
When interacting with Supabase, you must **always filter by `business_id`**, rather than just the `user.id`.

**Incorrect (Old Way):**
```typescript
const { data: pages } = await supabase
  .from('pages')
  .select('*')
  .eq('owner_id', user.id); // This will fetch pages from ALL businesses mixed together
```

**Correct (Business OS Way):**
```typescript
const { data: pages } = await supabase
  .from('pages')
  .select('*')
  .eq('business_id', params.id); // Securely scopes data to the current workspace
```

## 3. Sidebar and Navigation
The global sidebar (located in `apps/web/src/app/(dashboard)/layout.tsx`) is designed to be "smart".
- It dynamically queries the user's primary business (or most recently accessed business).
- It injects links to `Pages`, `Orders`, and `Leads` that point directly to `/dashboard/business/[id]/...`.
- If you add a new operational feature (e.g., `Marketing`), it **must** be added dynamically using the `primaryBusinessId` state, rather than hardcoded as a global route.

## 4. Security & RLS (Row Level Security)
Because users can now have access to multiple businesses (as owners or staff), Supabase RLS policies are structured around the `business_members` table.
- A user can only fetch rows where the `business_id` matches a business they are a member of.
- When creating new tables (e.g., `appointments`, `coupons`), you must ensure the table has a `business_id` foreign key, and that the RLS policy validates the user's role in that specific business.

## Summary Checklist for New Features
- [ ] Does the URL contain `business/[id]`?
- [ ] Are Supabase queries filtering by `business_id`?
- [ ] Is the database table linked to a `business_id`?
- [ ] Is the sidebar link dynamically generated using the current business ID?
