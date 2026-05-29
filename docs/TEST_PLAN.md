# MeuQR — Test Plan

> Testing strategy for production readiness

---

## 1. Unit Tests (Vitest)

Existing tests in `apps/web/__tests__/`:

| Test File | Status | Coverage |
|-----------|--------|----------|
| `shared-constants.test.ts` | ✅ | Tests `TEMPLATES`, `PLANS`, business categories |
| `shared-schemas.test.ts` | ✅ | Tests Zod schema validation |
| `shared-utils.test.ts` | ✅ | Tests `generateSlug`, `formatPhone`, WhatsApp helpers |
| `template-cloning.test.ts` | ✅ | Tests template data structure |
| `qr-routing.test.ts` | ✅ | Tests QR short code generation |
| `rls-policies.test.ts` | ✅ | Tests RLS policy expectations |

### Test Commands
```bash
# Run all tests
pnpm test

# Run tests for web app
cd apps/web && pnpm test

# Watch mode
cd apps/web && pnpm vitest
```

## 2. Route Smoke Tests

Manual tests needed:

| Test | Steps | Expected |
|------|-------|----------|
| Landing page | Visit `/` | Page loads with categories |
| Pricing | Visit `/pricing` | Pricing cards display |
| Login | Visit `/login` | Login form displays |
| Register | Visit `/register` | Registration form displays |
| Auth redirect | Visit `/dashboard` w/o login | Redirect to `/login` |
| Public QR page | Visit `/q/[shortCode]` | Redirect to business page |
| Business page | Visit `/[businessSlug]` | Page loads with sections/items |
| 404 | Visit `/nonexistent` | 404 page or redirect |

## 3. Authentication Tests

| Test | Steps | Expected |
|------|-------|----------|
| Register | Fill form, submit | Account created, redirect to dashboard |
| Login | Enter credentials, submit | Redirect to dashboard |
| Logout | Click logout | Redirect to landing page |
| Protected route | Direct URL access | Redirect to login with `redirect` param |

## 4. Business Creation Tests

| Test | Steps | Expected |
|------|-------|----------|
| Create business | Fill form, select type, submit | Business created, redirect to setup |
| Template selection | Choose template | Page/sections/items created |
| Skip template | Click skip | Redirect to business dashboard |

## 5. Page Builder Tests

| Test | Steps | Expected |
|------|-------|----------|
| View page | Click page | Sections and items display |
| Add section | Fill section form | Section appears in list |
| Edit section | Modify name, save | Section updates |
| Delete section | Confirm delete | Section removed |
| Add item | Fill item form | Item appears in section |
| Edit item | Modify fields, save | Item updates |
| Delete item | Confirm delete | Item removed |

## 6. QR Code Tests

| Test | Steps | Expected |
|------|-------|----------|
| Generate QR | Click generate | QR code displays |
| Style QR | Change colors | QR updates visually |
| Download QR | Click download | PNG/SVG file downloads |

## 7. WhatsApp Integration Tests

| Test | Steps | Expected |
|------|-------|----------|
| WhatsApp button | Click on public page | Opens `wa.me` link |
| Quote request | Submit form | WhatsApp link with pre-filled message |
| Order | Submit order | WhatsApp notification |

## 8. Playwright (E2E) Tests — Optional

If Playwright is added, test:
- Homepage loads
- Pricing loads
- Login loads
- Dashboard redirects when logged out
- Public QR page loads
- No broken links on landing page
