# MeuQR — Mobile Navigation Audit

> Screens in `apps/mobile/app/`

---

## Tab Navigation

| Screen | File | Purpose | Status | Issues |
|--------|------|---------|--------|--------|
| Tab Layout | `(tabs)/_layout.tsx` | Tab navigator (Dashboard, Analytics, QR, Scanner, Settings, Businesses) | ✅ Active | Many tabs may be overwhelming |
| Dashboard | `(tabs)/dashboard.tsx` | Dashboard overview with stats | ✅ Active | — |
| Analytics | `(tabs)/analytics.tsx` | Global analytics | ⚠️ Basic | Limited data visualization |
| QR Codes | `(tabs)/qr-codes.tsx` | All QR codes list | ✅ Active | — |
| Scanner Tab | `(tabs)/scanner-tab.tsx` | Inline QR scanner | ✅ Active | — |
| Settings | `(tabs)/settings.tsx` | User settings | ⚠️ Basic | Profile editing limited |
| Businesses | `(tabs)/businesses.tsx` | Business list | ✅ Active | — |

## Auth

| Screen | File | Purpose | Status |
|--------|------|---------|--------|
| Auth | `auth.tsx` | Login/Register screen | ✅ Active |

## Business Flow

| Screen | File | Purpose | Status |
|--------|------|---------|--------|
| Create Business | `business/new.tsx` | Create new business | ✅ Active |
| Business Detail | `business/[id]/page.tsx` | Business home with nav | ✅ Active |
| Analytics | `business/[id]/analytics.tsx` | Business analytics | ⚠️ Basic |
| Members | `business/[id]/members.tsx` | Team management | ✅ Active |
| Orders | `business/[id]/orders.tsx` | Customer orders | ✅ Active |
| Leads | `business/[id]/leads.tsx` | Customer leads | ✅ Active |
| Quote Requests | `business/[id]/quote-requests.tsx` | Quote requests | ✅ Active |
| Page View | `business/[id]/pages/[pageId].tsx` | Page details/edit | ⚠️ Basic |
| Page Settings | `business/[id]/pages/[pageId]/settings.tsx` | Page settings | ✅ Active |
| QR List | `business/[id]/qr/page.tsx` | QR codes | ✅ Active |
| QR Detail | `business/[id]/qr/[qrId].tsx` | Individual QR | ✅ Active |
| Scanner | `scanner.tsx` | Full-screen scanner | ✅ Active |

## Summary

- **Total screens:** 19
- **Active:** 19
- **Missing screens:** 0
- **Broken imports:** None found
- **Navigation flow:** Complete end-to-end
