# MeuQR — Launch Checklist

> Pre-launch verification steps

---

## 1. Supabase Setup

- [ ] Supabase project created
- [ ] Migration `00001_schema.sql` executed
- [ ] Migration `00002_seed_data.sql` executed (template data)
- [ ] Auth settings configured (email/password enabled)
- [ ] SMTP configured for production emails (SendGrid, Resend)
- [ ] Storage buckets created: `business-logos`, `product-images`, `qr-logos`
- [ ] Storage bucket policies set for authenticated uploads
- [ ] Edge Function `process-payment` deployed
- [ ] Mercado Pago webhook configured

## 2. Environment Variables

### Web (`apps/web/.env.local`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server-only)
- [ ] `NEXT_PUBLIC_APP_URL` set
- [ ] `NEXT_PUBLIC_SENTRY_DSN` set (optional)

### Mobile (`apps/mobile/.env`)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` set
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` set

## 3. Build Verification

- [ ] `pnpm install` passes
- [ ] `pnpm typecheck` passes (all packages)
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes (all packages)
- [ ] `pnpm test` passes

## 4. Deployment

### Web (Vercel)
- [ ] GitHub repository connected to Vercel
- [ ] Root directory set to `apps/web`
- [ ] Build command: `pnpm build`
- [ ] Install command: `pnpm install`
- [ ] Environment variables configured
- [ ] Custom domain configured (DNS records added)
- [ ] `NEXT_PUBLIC_APP_URL` updated to production domain
- [ ] Vercel Analytics enabled
- [ ] Deployed and smoke tested

### Mobile (Expo EAS)
- [ ] Expo account configured
- [ ] EAS CLI installed
- [ ] `eas build:configure` completed
- [ ] Production build triggered
- [ ] Submitted to App Store Connect (iOS)
- [ ] Submitted to Google Play Console (Android)

## 5. Manual QA Checklist

### Authentication
- [ ] User can register with email/password
- [ ] User receives confirmation email (if SMTP configured)
- [ ] User can log in
- [ ] User can log out
- [ ] Protected routes redirect to login
- [ ] Logged-in users redirected away from auth pages

### Business Onboarding
- [ ] User can create a business
- [ ] Business type selection works
- [ ] Template selection and cloning works
- [ ] Default page created with sections and items

### Page Builder
- [ ] User can view pages
- [ ] User can add/edit/delete sections
- [ ] User can add/edit/delete items
- [ ] Page settings (SEO, slug, CSS) save correctly

### QR Code
- [ ] QR code generates with correct URL
- [ ] QR code style can be customized
- [ ] QR code can be downloaded
- [ ] QR scan redirects to business page

### Public Page
- [ ] Public page loads without authentication
- [ ] Business name, description, and sections display
- [ ] WhatsApp button works
- [ ] Lead/order/quote forms submit correctly

### Analytics
- [ ] Scans are tracked
- [ ] Clicks are tracked
- [ ] Dashboard shows correct counts

### Subscription/Plans
- [ ] Free plan limits are enforced
- [ ] Billing page shows plan comparison
- [ ] Upgrade button is visible

## 6. Security Checks

- [ ] RLS enabled on all tables
- [ ] Service role key not exposed in frontend
- [ ] No secrets committed to repository
- [ ] Input validation with Zod
- [ ] File uploads validate type and size
- [ ] Rate limiting on public endpoints

## 7. SEO

- [ ] Meta tags present on all pages
- [ ] Open Graph tags configured
- [ ] Sitemap generated
- [ ] `robots.txt` configured

## 8. Post-Launch

- [ ] Monitor Supabase Logs for errors
- [ ] Monitor Vercel Analytics for traffic
- [ ] Set up Sentry error tracking
- [ ] Configure uptime monitoring
