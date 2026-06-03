# MeuQR

**Páginas inteligentes com QR Code para seu negócio.**

MeuQR é uma plataforma SaaS que permite que qualquer negócio crie páginas inteligentes com QR Code personalizado. Restaurantes, lojas de material de construção, salões, clínicas, hotéis, imobiliárias, eventos e muito mais.

## 🚀 Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (Web)** | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| **Mobile** | Expo SDK 54, React Native 0.81 |
| **Backend** | Supabase (Postgres, Auth, Storage, Edge Functions) |
| **QR Code** | qr-code-styling v1.9.2 |
| **Forms** | React Hook Form + Zod |
| **Payments** | Mercado Pago (Stripe planned) |
| **Hosting** | Vercel (Web), Supabase (Backend), Expo EAS (Mobile) |

## 📁 Monorepo Structure

```
meuqr/
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # Expo React Native app
├── packages/
│   ├── ui/           # Shared UI components (shadcn/ui)
│   ├── shared/       # Shared types, schemas, templates, constants
│   └── supabase/     # Supabase client configuration
├── supabase/
│   ├── migrations/   # Database migrations
│   └── functions/    # Edge Functions (process-payment)
├── pnpm-workspace.yaml
└── package.json
```

## 🛠️ Setup

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 11.0.0
- Supabase account (free tier works)
- Vercel account (for web deployment)
- Expo account (for mobile builds)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/meuqr.git
cd meuqr
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example apps/web/.env.local
```

Required variables:
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |

### 3. Database Setup

Option A - Using Supabase Dashboard:
1. Create a new Supabase project
2. Go to SQL Editor
3. Run `supabase/migrations/00001_schema.sql`
4. (Optional) Run `supabase/migrations/00002_seed_data.sql` for demo data

Option B - Using Supabase CLI:
```bash
supabase start
supabase migration up
```

### 4. Run the Web App

```bash
pnpm dev
```

Opens at [http://localhost:3000](http://localhost:3000)

### 5. Run the Mobile App

```bash
cd apps/mobile
npx expo start
```

Scan the QR code with Expo Go app on your phone.

## 📱 Features

### Web App
- Landing page with category showcase
- Login/Register with Supabase Auth
- Dashboard with stats overview
- Business management (CRUD)
- 9+ predefined industry templates
- Template-based page cloning
- QR code generator with styling options
- Public business pages (mobile-first)
- Analytics dashboard
- Subscription management

### Mobile App (Expo)
- Login/Register
- Dashboard
- Business management
- Template selection
- QR code generation & styling
- Analytics overview
- Share QR code as image

### Database
- 15+ tables with full RLS policies
- Automatic profile creation on signup
- Free subscription auto-creation
- Updated_at triggers
- Comprehensive indexes
- View for template summaries

### Security
- Row Level Security on all tables
- Input validation with Zod schemas
- Rate limiting on public endpoints
- No service role key in frontend
- Anonymous analytics writes
- Owner/staff role-based access

## 💳 Subscription Plans

| Feature | Free | Pro (R$29,90/mo) | Business (R$79,90/mo) |
|---------|------|-------------------|----------------------|
| Businesses | 1 | 3 | Unlimited |
| QR Codes | 1 | Unlimited | Unlimited |
| Items | 20 | 500 | Unlimited |
| Custom QR | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ | Advanced |
| Staff | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |

## 🌐 Deployment

### Web (Vercel)

```bash
pnpm build
vercel --prod
```

Set all environment variables in Vercel dashboard.

### Backend (Supabase)

Already hosted - just run migrations.

### Mobile (Expo EAS)

```bash
cd apps/mobile
eas build --platform all
eas submit --platform all
```

## 🧪 Testing

```bash
pnpm -r typecheck    # TypeScript type checking
pnpm lint            # Lint all packages
```

## 📄 License

MIT
