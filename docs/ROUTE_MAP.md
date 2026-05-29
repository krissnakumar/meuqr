# MeuQR — Route Map (Web)

> Routes in `apps/web/src/app/`

---

## Public Routes

| Route | File | Purpose | Linked From | Status |
|-------|------|---------|-------------|--------|
| `/` | `app/page.tsx` | Landing page with category showcase | Navbar, Logo | ✅ Active |
| `/pricing` | `app/pricing/page.tsx` | Pricing plans comparison | Landing page, Navbar | ✅ Active |
| `/login` | `app/(auth)/login/page.tsx` | User login | Navbar, Auth redirect | ✅ Active |
| `/register` | `app/(auth)/register/page.tsx` | User registration | Login page link | ✅ Active |
| `/q/[shortCode]` | `app/q/[shortCode]/page.tsx` | QR code redirect to business page | QR scans | ✅ Active |
| `/[businessSlug]` | `app/[businessSlug]/page.tsx` | Public business page (mobile-first) | QR codes, Direct link | ✅ Active |

## Protected Routes (Dashboard)

### Dashboard Home
| Route | File | Purpose | Linked From | Status |
|-------|------|---------|-------------|--------|
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Dashboard home with stats | Sidebar | ✅ Active |
| `/dashboard/analytics` | `app/(dashboard)/dashboard/analytics/page.tsx` | Global analytics overview | Sidebar | ✅ Active |
| `/dashboard/qr-codes` | `app/(dashboard)/dashboard/qr-codes/page.tsx` | All QR codes list | Sidebar | ✅ Active |
| `/dashboard/settings` | `app/(dashboard)/dashboard/settings/page.tsx` | User profile settings | Sidebar | ✅ Active |
| `/dashboard/billing` | `app/(dashboard)/dashboard/billing/page.tsx` | Subscription management | Sidebar | ✅ Active |

### Business Management
| Route | File | Purpose | Linked From | Status |
|-------|------|---------|-------------|--------|
| `/dashboard/business` | `app/(dashboard)/dashboard/business/page.tsx` | Business list | Dashboard cards | ✅ Active |
| `/dashboard/business/new` | `app/(dashboard)/dashboard/business/new/page.tsx` | Create new business | Business list CTA | ✅ Active |
| `/dashboard/business/[id]` | `app/(dashboard)/dashboard/business/[id]/page.tsx` | Business detail/home | Business list cards | ✅ Active |
| `/dashboard/business/[id]/analytics` | `app/(dashboard)/dashboard/business/[id]/analytics/page.tsx` | Business-level analytics | Business detail nav | ✅ Active |
| `/dashboard/business/[id]/members` | `app/(dashboard)/dashboard/business/[id]/members/page.tsx` | Team management | Business detail nav | ✅ Active |
| `/dashboard/business/[id]/orders` | `app/(dashboard)/dashboard/business/[id]/orders/page.tsx` | Customer orders | Business detail nav | ✅ Active |
| `/dashboard/business/[id]/leads` | `app/(dashboard)/dashboard/business/[id]/leads/page.tsx` | Customer leads | Business detail nav | ✅ Active |
| `/dashboard/business/[id]/quote-requests` | `app/(dashboard)/dashboard/business/[id]/quote-requests/page.tsx` | Quote requests | Business detail nav | ✅ Active |
| `/dashboard/business/[id]/setup` | `app/(dashboard)/dashboard/business/[id]/setup/page.tsx` | Template selection wizard | Business creation redirect | ✅ Active |

### Page Builder
| Route | File | Purpose | Linked From | Status |
|-------|------|---------|-------------|--------|
| `/dashboard/business/[id]/pages/[pageId]` | `app/(dashboard)/dashboard/business/[id]/pages/[pageId]/page.tsx` | Page editor (sections & items) | Business detail | ✅ Active |
| `/dashboard/business/[id]/pages/[pageId]/settings` | `app/(dashboard)/dashboard/business/[id]/pages/[pageId]/settings/page.tsx` | Page SEO & meta settings | Page editor | ✅ Active |

### QR Management
| Route | File | Purpose | Linked From | Status |
|-------|------|---------|-------------|--------|
| `/dashboard/business/[id]/qr` | `app/(dashboard)/dashboard/business/[id]/qr/page.tsx` | QR code generation & list | Business detail nav | ✅ Active |
| `/dashboard/business/[id]/qr/[qrId]` | `app/(dashboard)/dashboard/business/[id]/qr/[qrId]/page.tsx` | QR detail & styling | QR list | ✅ Active |

## API Routes

| Route | File | Purpose | Status |
|-------|------|---------|--------|
| `/api/track/scan` | `api/track/scan/route.ts` | Track QR scan events | ✅ Active |
| `/api/track/click` | `api/track/click/route.ts` | Track QR click events | ✅ Active |
| `/api/public-page` | `api/public-page/route.ts` | Serve public page data | ✅ Active |

## Summary

- **Total routes found:** 26
- **Active:** 26
- **Broken:** 0
- **Placeholder/Empty:** 0
- **Missing:** 0
