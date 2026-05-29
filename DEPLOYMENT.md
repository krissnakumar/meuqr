# MeuQR - Deployment Guide

## Overview

This guide covers deploying all components of MeuQR:
1. Web application (Next.js) → Vercel
2. Backend (Supabase) → Supabase Cloud
3. Mobile app (Expo) → Expo EAS

---

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to Brazil (e.g., São Paulo - sa-east-1)
3. Note your project URL and anon key

### Run Migrations
1. Go to **SQL Editor** in Supabase dashboard
2. Copy the contents of `supabase/migrations/00001_schema.sql`
3. Paste and run in SQL Editor
4. (Optional) Run `supabase/migrations/00002_seed_data.sql` for template data

### Configure Authentication
1. Go to **Authentication → Settings**
2. Under **Email Auth**, enable email/password sign-ups
3. (Optional) Configure SMTP for production emails (e.g., SendGrid, Resend)

### Configure Storage
1. Go to **Storage**
2. Create buckets:
   - `business-logos` (public)
   - `product-images` (public)
   - `qr-logos` (public)
3. Set bucket policies to allow authenticated uploads:

```sql
-- Example storage policy (run in SQL Editor)
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('business-logos', 'product-images', 'qr-logos')
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
USING (bucket_id IN ('business-logos', 'product-images', 'qr-logos'));
```

### Deploy Edge Function (Mercado Pago)
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy process-payment

# Set environment variables
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=your_token
supabase secrets set MERCADO_PAGO_PUBLIC_KEY=your_public_key
```

Configure the Mercado Pago webhook in your Mercado Pago account:
- URL: `https://your-project-ref.supabase.co/functions/v1/process-payment`
- Events: Payment, Subscription

---

## 2. Web App (Vercel)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Steps
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import repository
3. Set **Root Directory** to `apps/web`
4. Configure build settings (usually auto-detected):
   - Framework: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

5. Add environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `MeuQR` |

6. Deploy!

### Custom Domain
1. Go to Vercel project → Domains
2. Add your custom domain (e.g., `meuqr.com.br`)
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars

---

## 3. Mobile App (Expo EAS)

### Prerequisites
- Expo account
- EAS CLI installed (`npm install -g eas-cli`)
- Apple Developer account (iOS)
- Google Play Console account (Android)

### Build for Production

```bash
cd apps/mobile

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for both platforms
eas build --platform all --profile production
```

### Submit to Stores

```bash
# Submit to App Store Connect
eas submit --platform ios

# Submit to Google Play Console
eas submit --platform android
```

### Environment Variables for Mobile
Create `apps/mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 4. Production Checklist

### Security
- [ ] RLS enabled on all tables (verified)
- [ ] Rate limiting configured on public endpoints
- [ ] CORS configured for Edge Functions
- [ ] No API keys exposed in client-side code
- [ ] HTTPS enforced (automatic on Vercel)

### Performance
- [ ] Next.js ISR/SSR for public pages
- [ ] Image optimization enabled
- [ ] Bundle analysis performed
- [ ] Database indexes created (all present in migration)

### Monitoring
- [ ] Supabase Logs enabled (built-in)
- [ ] Vercel Analytics enabled
- [ ] Error tracking (e.g., Sentry) configured
- [ ] Uptime monitoring configured

### SEO
- [ ] Meta tags present on all pages
- [ ] Open Graph tags configured
- [ ] Sitemap generated
- [ ] robots.txt configured

---

## 5. Ongoing Maintenance

### Database Backups
Supabase automatically handles backups (Point-in-Time Recovery on Pro plan).

### Dependency Updates
```bash
# Check for outdated packages
pnpm outdated

# Update all packages
pnpm update --latest

# Run typechecks after updates
pnpm -r typecheck
```

### Monitoring
- Check Supabase Logs for database queries and auth events
- Enable Vercel Analytics for web traffic
- Monitor Edge Function invocations in Supabase dashboard

### Scaling
- Supabase: Upgrade plan as needed (Pro at $25/mo for production)
- Vercel: Pro plan includes faster builds and Edge Functions
- EAS: Monthly credits included with Expo account
