# MeuQR — Production Audit

> Audit date: May 29, 2026
> Project: MeuQR — QR-powered digital business page builder for Brazilian small businesses

---

## 1. Project Structure Summary

```
meuqr/
├── apps/
│   ├── web/                          # Next.js 16 web application
│   │   ├── src/app/                  # App Router routes
│   │   ├── src/lib/                  # Auth, Supabase client
│   │   ├── src/hooks/                # React hooks (useAuth, useBusiness)
│   │   ├── src/components/           # (absent — minimal)
│   │   └── __tests__/                # Vitest tests
│   └── mobile/                       # Expo React Native app
│       ├── app/                      # Expo Router screens
│       └── src/lib/                  # Supabase client (expo-secure-store)
├── packages/
│   ├── shared/                       # Types, schemas, constants, templates
│   ├── ui/                           # shadcn/ui components (button, card, input, badge, etc.)
│   └── supabase/                     # Supabase client factory
├── supabase/
│   ├── migrations/                   # Database migrations
│   └── functions/process-payment/    # Edge Function (Mercado Pago)
├── docs/                             # Documentation
├── pnpm-workspace.yaml
└── package.json
```

## 2. Detected Apps & Packages

| Package | Path | Type | Status |
|---------|------|------|--------|
| `@meuqr/shared` | `packages/shared` | Shared types, schemas, constants, templates | ✅ Complete |
| `@meuqr/ui` | `packages/ui` | shadcn/ui components (6 components) | ✅ Basic |
| `@meuqr/supabase` | `packages/supabase` | Supabase client factory | ✅ Complete |
| `@meuqr/web` | `apps/web` | Next.js 16 web app | ⚠️ Missing ESLint |
| `@meuqr/mobile` | `apps/mobile` | Expo mobile app | ⚠️ Review needed |

## 3. Scripts & Commands

### Root workspace
| Script | Command | Status |
|--------|---------|--------|
| `dev` | `turbo dev` | ✅ |
| `build` | `turbo build` | ✅ |
| `lint` | `turbo lint` | ❌ Fails (no ESLint config) |
| `typecheck` | `turbo typecheck` | ✅ Passes |
| `clean` | `turbo clean` | ✅ |

### Web app (`@meuqr/web`)
| Script | Command | Status |
|--------|---------|--------|
| `dev` | `next dev` | ✅ |
| `build` | `next build` | ⚠️ Succeeds with deprecation warnings |
| `lint` | `next lint` | ❌ Fails (no ESLint config) |
| `typecheck` | `tsc --noEmit` | ✅ Passes |
| `test` | `vitest run` | ⚠️ Not tested yet |

## 4. Missing Environment Variables

No `.env.example` or `.env.local` files exist. Required variables:

| Variable | Used In | Required | Notes |
|----------|---------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `apps/web/src/lib/supabase.ts`, `apps/web/src/middleware.ts` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `apps/web/src/lib/supabase.ts`, `apps/web/src/middleware.ts` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Referenced in DEPLOYMENT.md | 🔶 | Server-only |
| `NEXT_PUBLIC_APP_URL` | `apps/web` (referenced in DEPLOYMENT.md) | 🔶 | For OG images, redirects |
| `EXPO_PUBLIC_SUPABASE_URL` | `apps/mobile/src/lib/supabase.ts` | ✅ | Missing from mobile |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `apps/mobile/src/lib/supabase.ts` | ✅ | Missing from mobile |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry config files | 🔶 | Sentry error tracking |
| `SENTRY_AUTH_TOKEN` | Sentry config | 🔶 | Sentry source maps |

## 5. Build Issues

| Issue | Severity | Status | Details |
|-------|----------|--------|---------|
| No ESLint config | High | ❌ Unfixed | `next lint` fails — no `.eslintrc.*` or `eslint.config.*` |
| Sentry `disableLogger` deprecation | Low | ⚠️ Warning | Use `webpack.treeshake.removeDebugLogging` instead |
| Sentry `automaticVercelMonitors` deprecation | Low | ⚠️ Warning | Use `webpack.automaticVercelMonitors` instead |
| Middleware file deprecation | Low | ⚠️ Warning | Middleware convention deprecated |
| No `useAuth` hook usage in client pages | Medium | ⚠️ Review | Dashboard pages don't show user info |

## 6. Web Routes Audit

### Routes Found

| Route | Type | Status | Description |
|-------|------|--------|-------------|
| `/` | Public | ✅ | Landing page |
| `/pricing` | Public | ✅ | Pricing page |
| `/login` | Public | ✅ | Login page |
| `/register` | Public | ✅ | Registration page |
| `/q/[shortCode]` | Public | ✅ | QR redirect page |
| `/[businessSlug]` | Public | ✅ | Business public page |
| `/dashboard` | Protected | ✅ | Dashboard home |
| `/dashboard/analytics` | Protected | ✅ | Global analytics |
| `/dashboard/qr-codes` | Protected | ✅ | Global QR list |
| `/dashboard/settings` | Protected | ✅ | User settings/profile |
| `/dashboard/billing` | Protected | ✅ | Subscription plans |
| `/dashboard/business` | Protected | ✅ | Business list |
| `/dashboard/business/new` | Protected | ✅ | Create business |
| `/dashboard/business/[id]` | Protected | ✅ | Business detail |
| `/dashboard/business/[id]/analytics` | Protected | ✅ | Business analytics |
| `/dashboard/business/[id]/members` | Protected | ✅ | Team management |
| `/dashboard/business/[id]/orders` | Protected | ✅ | Orders list |
| `/dashboard/business/[id]/leads` | Protected | ✅ | Leads list |
| `/dashboard/business/[id]/quote-requests` | Protected | ✅ | Quote requests |
| `/dashboard/business/[id]/pages/[pageId]` | Protected | ✅ | Page editor |
| `/dashboard/business/[id]/pages/[pageId]/settings` | Protected | ✅ | Page settings |
| `/dashboard/business/[id]/qr` | Protected | ✅ | QR management |
| `/dashboard/business/[id]/qr/[qrId]` | Protected | ✅ | Individual QR detail |
| `/dashboard/business/[id]/setup` | Protected | ✅ | Template selection |
| `/api/track/scan` | Public | ✅ | Scan tracking API |
| `/api/track/click` | Public | ✅ | Click tracking API |
| `/api/public-page` | Public | ✅ | Public page API |

### Issues Found
- Dashboard navigation sidebar uses inline SVG icons — could use lucide-react
- No 404/not-found page customization beyond default
- No error boundary pages
- Dashboard `useBusiness` hook doesn't filter by user ownership
- No loading skeletons in some pages

## 7. Mobile Screens Audit

| Screen | Path | Status | Description |
|--------|------|--------|-------------|
| Auth | `app/auth.tsx` | ✅ | Login/Register |
| Scanner | `app/scanner.tsx` | ✅ | QR scanner |
| Tab Layout | `app/(tabs)/_layout.tsx` | ✅ | Tab navigation |
| Dashboard | `app/(tabs)/dashboard.tsx` | ✅ | Dashboard tab |
| Analytics | `app/(tabs)/analytics.tsx` | ⚠️ | Placeholder content |
| QR Codes | `app/(tabs)/qr-codes.tsx` | ✅ | QR code list |
| Scanner Tab | `app/(tabs)/scanner-tab.tsx` | ✅ | Inline scanner |
| Settings | `app/(tabs)/settings.tsx` | ⚠️ | Basic settings |
| Businesses | `app/(tabs)/businesses.tsx` | ✅ | Business list |
| Business New | `app/business/new.tsx` | ✅ | Create business |
| Business Detail | `app/business/[id]/page.tsx` | ✅ | Business detail |
| Business Analytics | `app/business/[id]/analytics.tsx` | ⚠️ | Basic analytics |
| Business Members | `app/business/[id]/members.tsx` | ✅ | Team management |
| Business Orders | `app/business/[id]/orders.tsx` | ✅ | Orders |
| Business Leads | `app/business/[id]/leads.tsx` | ✅ | Leads |
| Business Quote Req. | `app/business/[id]/quote-requests.tsx` | ✅ | Quote requests |
| Business Pages | `app/business/[id]/pages/[pageId].tsx` | ⚠️ | Page editor missing |
| Page Settings | `app/business/[id]/pages/[pageId]/settings.tsx` | ✅ | Page settings |
| QR List | `app/business/[id]/qr/page.tsx` | ✅ | QR list |
| QR Detail | `app/business/[id]/qr/[qrId].tsx` | ✅ | QR detail/edit |

## 8. Database Schema Overview

Tables defined in migrations:

| Table | Status | Key Columns |
|-------|--------|-------------|
| `profiles` | ✅ | id, email, full_name, phone, avatar_url, created_at |
| `businesses` | ✅ | id, name, slug, category, description, phone, whatsapp, address, owner_id, subscription_tier |
| `business_members` | ✅ | id, business_id, user_id, role |
| `templates` | ✅ | id, name, slug, category, description, popularity |
| `template_sections` | ✅ | id, template_id, name, slug, sort_order |
| `template_items` | ✅ | id, section_id, name, description, price |
| `pages` | ✅ | id, business_id, title, slug, is_published, seo_title, seo_description |
| `sections` | ✅ | id, page_id, name, slug, section_type, sort_order |
| `items` | ✅ | id, section_id, name, description, price, sort_order |
| `qr_codes` | ✅ | id, business_id, page_id, short_code, title, style_config |
| `qr_styles` | ✅ | (not explicitly defined — might be part of qr_codes) |
| `scans` | ✅ | id, qr_code_id, device_type, user_agent, ip_address, created_at |
| `clicks` | ✅ | id, qr_code_id, click_type, target_url, created_at |
| `leads` | ✅ | id, business_id, name, email, phone, message, source |
| `quote_requests` | ✅ | id, business_id, customer_name, customer_phone, items, message |
| `orders` | ✅ | id, business_id, customer_name, customer_phone, items, total, status |
| `subscriptions` | ✅ | id, user_id, plan_tier, status, start_date, end_date |
| `payments` | ✅ | id, user_id, amount, currency, provider, status |

## 9. Security Assessment

| Check | Status | Notes |
|-------|--------|-------|
| RLS enabled on tables | ✅ | Present in migrations |
| Service role key in frontend | ✅ | Not exposed |
| Environment variables gitignored | ✅ | `.env*` in `.gitignore` |
| Input validation (Zod) | ✅ | `packages/shared/src/schemas.ts` |
| File upload validation | ⚠️ | No type/size checks visible |
| Rate limiting on public endpoints | ⚠️ | Not implemented |
| Auth redirects safe | ✅ | Using NextResponse.redirect |
| CORS on Edge Functions | ⚠️ | Not configured in deno.json |

## 10. Performance Assessment

| Check | Status | Notes |
|-------|--------|-------|
| Next.js ISR/SSR | ✅ | Public pages use SSR |
| Image optimization | ✅ | Next/Image available |
| Database indexes | ✅ | Present in migrations |
| Bundle splitting | ✅ | Next.js automatic |
| Lazy loading | ⚠️ | Not implemented on heavy pages |

## 11. Launch Blockers

| Blocker | Priority | Notes |
|---------|----------|-------|
| No ESLint config — lint fails | Medium | Prevents CI from passing |
| No `.env.example` file | Medium | Setup friction |
| Missing Sentry config fix | Low | Deprecation warnings |
| Missing storage bucket setup in migrations | Low | Referenced only in docs |
| No rate limiting on public forms | Medium | Spam vulnerability |
| Mobile page editor missing fields | Medium | Incomplete flow |
