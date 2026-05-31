"use client";
import { useState } from "react";

const sections = [
  { id: "executive", label: "A. Executive Summary" },
  { id: "score", label: "B. Project Score" },
  { id: "good", label: "C. What Works Well" },
  { id: "problems", label: "D. Major Problems" },
  { id: "bugs", label: "E. Bugs & Risks" },
  { id: "missing", label: "F. Missing Features" },
  { id: "ux", label: "G. UI/UX Improvements" },
  { id: "database", label: "H. Database Improvements" },
  { id: "templates", label: "I. Template System" },
  { id: "business", label: "J. Business Model" },
  { id: "roadmap", label: "K. Priority Roadmap" },
];

const BUG_DATA = [
  {
    priority: "CRITICAL",
    color: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
    file: "apps/web/src/app/(dashboard)/dashboard/billing/page.tsx:50",
    problem: "Free subscription upgrade — no payment required",
    detail: "handleUpgrade() calls supabase.from('businesses').update({ subscription_tier: planKey }) directly from the client. Any logged-in user can upgrade to 'pro' or 'business' for free by calling this function. The /api/checkout Stripe route exists but is never called from this page.",
    fix: "Remove the direct DB update. Call POST /api/checkout instead and redirect the user to the Stripe checkout session URL. Also add an RLS policy that prevents clients from directly writing subscription_tier.",
  },
  {
    priority: "CRITICAL",
    color: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
    file: "apps/web/src/app/(dashboard)/layout.tsx (sidebar)",
    problem: "9 dead sidebar links — guaranteed 404s for clinic, dentist, food, and construction categories",
    detail: "The dynamic sidebar generates these links that have no corresponding page.tsx:\n• /dashboard/business/[id]/tables\n• /dashboard/business/[id]/delivery\n• /dashboard/business/[id]/quotes (should be quote-requests)\n• /dashboard/business/[id]/pricing\n• /dashboard/business/[id]/doctors\n• /dashboard/business/[id]/patients\n• /dashboard/business/[id]/treatment-plans\n• /dashboard/business/[id]/follow-ups\n• /dashboard/business/[id]/professionals\nAny clinic, dentist, food truck, or construction business owner will immediately hit broken navigation.",
    fix: "Either create the missing pages or remove the links from the sidebar until the pages are built. At minimum, fix /quotes → /quote-requests immediately as that route exists.",
  },
  {
    priority: "HIGH",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
    file: "packages/supabase/src/types.ts",
    problem: "Supabase types are 6 migrations out of date",
    detail: "The types file only reflects migration 00001. Tables added in migrations 00004–00010 are missing: clients, notifications, device_push_tokens, appointment_services, staff_members, business_availability, appointment_blackouts, appointments, loyalty_programs, loyalty_cards, loyalty_transactions, admin_settings, admin_audit_logs. The businesses table also lacks notification_settings JSONB column. Code uses 'any' workarounds throughout to hide TypeScript errors.",
    fix: "Run: supabase gen types typescript --project-id <your-id> > packages/supabase/src/types.ts. Commit and regenerate whenever you add a migration.",
  },
  {
    priority: "HIGH",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
    file: "packages/shared/src/templates/business-templates.ts:2531 & 2561",
    problem: "Duplicate template ID: tmpl-052",
    detail: "Two templates share the id prefix 'tmpl-052': tmpl-052-product-shelf (line 2531) and tmpl-052-clinica-medica (line 2561). Any lookup by ID will return the first one and silently ignore the second. getTemplatesByBusinessType() for 'clinic' may return the wrong template.",
    fix: "Rename tmpl-052-clinica-medica to tmpl-055-clinica-medica (or the next available number). Audit all template IDs for uniqueness.",
  },
  {
    priority: "HIGH",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
    file: "apps/web/src/app/onboarding/page.tsx:81",
    problem: "Default business category is 'restaurante' — an invalid value",
    detail: "const [bizCategory, setBizCategory] = useState('restaurante') — but BUSINESS_CATEGORIES uses English values like 'restaurant'. If the user skips past the category step, the business is created with category='restaurante' which matches no valid BusinessCategory type. Supabase will accept it (no CHECK constraint on the column), but template lookups, sidebar routing, and dashboard cards will all fail silently.",
    fix: "Change default to: useState('restaurant'). Add a database CHECK constraint on businesses.category using the valid enum values.",
  },
  {
    priority: "HIGH",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
    file: "apps/web/src/app/(dashboard)/dashboard/business/[id]/page.tsx:170",
    problem: "Query against non-existent 'clients' table crashes dashboard for all businesses",
    detail: "supabase.from('clients').select('*', { count: 'exact', head: true }).eq('business_id', businessId) — The 'clients' table exists in migration 00004 but the Supabase RLS policies for it are missing from that migration. Without RLS SELECT policies, the query returns a permission error for authenticated users, causing the entire loadBusiness() function to silently fail and show an empty dashboard.",
    fix: "Add RLS policies for the clients table. Also add clients to the Supabase types file. Check migration 00004 for missing SELECT policies on clients.",
  },
  {
    priority: "MEDIUM",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
    file: "apps/web/check-db.ts and apps/web/check-items.ts",
    problem: "Debug scripts with SUPABASE_SERVICE_ROLE_KEY committed to source",
    detail: "Two debug scripts sit at apps/web/ root (not in a scripts/ folder, not gitignored). check-db.ts queries businesses.form_schema which doesn't exist in any migration. Both scripts import createClient with SUPABASE_SERVICE_ROLE_KEY. These are not route files but could confuse developers and Next.js might try to process them.",
    fix: "Delete both files. If you need to inspect the DB, use the Supabase Studio UI or the supabase CLI.",
  },
  {
    priority: "MEDIUM",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
    file: "apps/web/src/app/api/webhooks/stripe/route.ts",
    problem: "Stripe webhook handles only checkout.session.completed — subscriptions will go stale",
    detail: "The webhook switch only handles 'checkout.session.completed'. Critical subscription lifecycle events are missing: customer.subscription.deleted (cancellations), invoice.payment_failed (payment failures), customer.subscription.updated (plan changes). When a subscription expires or is cancelled in Stripe, the business remains on 'pro' or 'business' tier forever.",
    fix: "Add handlers for: customer.subscription.deleted → set tier to 'free', invoice.payment_failed → set status to 'past_due', customer.subscription.updated → sync tier and period dates.",
  },
  {
    priority: "MEDIUM",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
    file: "apps/web/src/app/[businessSlug]/client.tsx",
    problem: "1,961-line God component with all public page logic in one file",
    detail: "PublicBusinessPageClient handles: order drawer, quote drawer, lead form, booking form, donation modal, modifier modal, WhatsApp formatting, PIX display, section rendering, item cards, nearby businesses. It has 60+ useState hooks. This makes it impossible to test, slow to compile, and risky to edit.",
    fix: "Split into: OrderDrawer, QuoteDrawer, LeadForm, BookingDrawer, ItemCard, SectionView components. Keep the parent as a thin coordinator. Each sub-component gets its own file.",
  },
  {
    priority: "MEDIUM",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
    file: "apps/web/src/app/(dashboard)/dashboard/business/[id]/page.tsx:200",
    problem: "notification_settings read from businesses table but column not in businesses schema types",
    detail: "The code reads biz?.notification_settings but the TypeScript type for businesses doesn't include this column. This only works because the code casts to 'any'. If the column rename or removal, the code silently returns undefined and the notification settings UI shows defaults forever.",
    fix: "Regenerate Supabase types. Add explicit TypeScript interface for notification_settings shape.",
  },
  {
    priority: "LOW",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-400",
    file: "apps/mobile/assets/",
    problem: "All mobile app icons are 70-byte placeholder files",
    detail: "adaptive-icon.png, favicon.png, icon.png, splash-icon.png are all 70 bytes — clearly placeholders. The mobile app cannot be submitted to App Store or Google Play with these. EAS build will fail store validation.",
    fix: "Design proper 1024×1024 app icon, 1284×2778 splash screen, and 108×108 adaptive icon. Use Expo's asset guide.",
  },
  {
    priority: "LOW",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-400",
    file: "get-columns.ts (project root)",
    problem: "Stray dev script at monorepo root",
    detail: "get-columns.ts at the project root is not referenced by any package.json script and serves no build purpose. It reads DB columns via service role key.",
    fix: "Delete this file.",
  },
];

const FEATURE_DATA = [
  { name: "QR Code generation", status: "full", note: "Custom styles, dot/corner shapes, colors, logo. Well implemented." },
  { name: "Business pages", status: "partial", note: "Page CRUD exists. Editor redirects to business overview instead of a real editor. No drag-and-drop." },
  { name: "Templates (55+)", status: "partial", note: "55 templates in code but no category filtering UI. Duplicate tmpl-052 ID. Templates not synced to DB templates table." },
  { name: "Products / Items", status: "full", note: "Items table with price, image_url, metadata JSONB. Works well." },
  { name: "Menu (food businesses)", status: "full", note: "Order flow, WhatsApp integration, cart drawer — complete." },
  { name: "Orders", status: "full", note: "Order management page, status updates, WhatsApp notifications." },
  { name: "Appointments", status: "partial", note: "DB schema is solid. Dashboard page exists but no service management UI, no staff assignment in booking form." },
  { name: "Analytics", status: "partial", note: "Counts work. No charts, no time series, no geographic data display." },
  { name: "Subscriptions / Billing", status: "broken", note: "CRITICAL: Billing page upgrades tier for free without payment. Stripe checkout API exists but is never called." },
  { name: "Staff / Members", status: "partial", note: "Members page exists. staff_members table exists for appointments but no UI to manage them." },
  { name: "Notifications (in-app)", status: "partial", note: "Bell component, notifications table, read/archive API routes. Push notifications (Expo) configured but untested." },
  { name: "Leads CRM", status: "partial", note: "Leads page and table exist. No lead status tracking, no follow-up reminders, no pipeline view." },
  { name: "Quote requests", status: "full", note: "Public quote form, quote-requests page, WhatsApp notification on submit." },
  { name: "Loyalty program", status: "partial", note: "Tables and page exist. No public-facing loyalty card UI on the QR page." },
  { name: "Clients / CRM", status: "partial", note: "clients table and page exist. No client detail page. No RLS SELECT policy confirmed." },
  { name: "MercadoPago payments", status: "missing", note: "Listed in env.example and DB schema but zero implementation in code." },
  { name: "Product image upload", status: "partial", note: "upload API route exists. items.image_url exists. No image picker UI in item editing flow." },
  { name: "Mobile app", status: "partial", note: "Screens exist but placeholder icons. Some mobile routes not fully functional." },
  { name: "WhatsApp contextual actions", status: "partial", note: "Order and quote WhatsApp messages work. No appointment reminders, no lead follow-ups." },
  { name: "Admin panel", status: "full", note: "Admin pages for users, templates, settings, audit logs — well structured." },
];

const ROADMAP = [
  {
    phase: "Phase 1",
    title: "Fix Critical Bugs",
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    border: "border-red-200",
    weeks: "Week 1–2",
    tasks: [
      { text: "Fix billing page — remove direct DB upgrade, call /api/checkout properly", file: "billing/page.tsx" },
      { text: "Fix 9 dead sidebar links — either create pages or remove links", file: "layout.tsx sidebar" },
      { text: "Fix default onboarding category: 'restaurante' → 'restaurant'", file: "onboarding/page.tsx" },
      { text: "Fix duplicate template ID tmpl-052 → tmpl-055", file: "business-templates.ts" },
      { text: "Regenerate Supabase TypeScript types from current schema", file: "packages/supabase/src/types.ts" },
      { text: "Add missing RLS SELECT policies for clients table", file: "migration 00004" },
      { text: "Delete check-db.ts, check-items.ts, get-columns.ts", file: "project root" },
      { text: "Add Stripe webhook handlers for subscription.deleted and payment_failed", file: "webhooks/stripe/route.ts" },
    ],
  },
  {
    phase: "Phase 2",
    title: "Onboarding & Template System",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    weeks: "Week 3–5",
    tasks: [
      { text: "Add category groups to template selection with icons and filter bar", file: "business/new/page.tsx" },
      { text: "Add preview card for each template (description, sections count, form type)", file: "new component: TemplateCard" },
      { text: "Add business_categories table and seed with industry groups", file: "new migration 00011" },
      { text: "Improve onboarding: add template selection as Step 4 after address", file: "onboarding/page.tsx" },
      { text: "Add 'Recomendado para você' section based on business category", file: "template selection" },
      { text: "Sync code templates to DB templates table on first boot", file: "seed.sql or admin panel" },
    ],
  },
  {
    phase: "Phase 3",
    title: "Product Images & Media",
    color: "from-emerald-500 to-green-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    weeks: "Week 6–7",
    tasks: [
      { text: "Add image picker to item editor (uses existing /api/upload endpoint)", file: "pages/[pageId]/page.tsx" },
      { text: "Add item image display to public QR page item cards", file: "[businessSlug]/client.tsx" },
      { text: "Add cover image upload to business setup flow", file: "business/[id]/setup/page.tsx" },
      { text: "Add logo crop/resize UI using existing ImageUpload component", file: "packages/ui/image-upload.tsx" },
      { text: "Add Supabase Storage bucket policy to limit upload size and types", file: "migration 00012" },
    ],
  },
  {
    phase: "Phase 4",
    title: "Appointments System",
    color: "from-indigo-500 to-violet-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    weeks: "Week 8–11",
    tasks: [
      { text: "Build service management UI (create/edit appointment_services)", file: "appointments/page.tsx" },
      { text: "Build staff management UI (create/edit staff_members)", file: "new: appointments/staff/page.tsx" },
      { text: "Build availability setup (day_of_week, start/end time per staff)", file: "new: appointments/availability/page.tsx" },
      { text: "Add date/time slot picker to public booking form", file: "[businessSlug]/client.tsx BookingDrawer" },
      { text: "Add appointment calendar view (week/month) to dashboard", file: "appointments/page.tsx" },
      { text: "Create /patients and /doctors pages for clinic category", file: "new pages" },
      { text: "Add WhatsApp reminder message template for confirmed appointments", file: "lib/notifications.ts" },
    ],
  },
  {
    phase: "Phase 5",
    title: "WhatsApp & Leads CRM",
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    weeks: "Week 12–15",
    tasks: [
      { text: "Add MercadoPago checkout integration (Brazil's #1 payment provider)", file: "new: api/checkout/mercadopago/route.ts" },
      { text: "Add MercadoPago webhook handler", file: "new: api/webhooks/mercadopago/route.ts" },
      { text: "Build leads pipeline view (kanban: novo → contato → proposta → fechado)", file: "leads/page.tsx" },
      { text: "Add lead status, value, and next-action fields to leads table", file: "new migration 00013" },
      { text: "Add WhatsApp quick-reply templates per business category", file: "new: lib/whatsapp-templates.ts" },
      { text: "Add WhatsApp appointment reminder (configurable hours before)", file: "notifications.ts" },
      { text: "Add quote → WhatsApp → order conversion tracking", file: "analytics + clicks table" },
      { text: "Build client detail page /clients/[clientId] with order history", file: "new page" },
    ],
  },
  {
    phase: "Phase 6",
    title: "Polish & SaaS Launch",
    color: "from-purple-500 to-fuchsia-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    weeks: "Week 16–20",
    tasks: [
      { text: "Split client.tsx (1961 lines) into OrderDrawer, QuoteDrawer, LeadForm, BookingDrawer components", file: "[businessSlug]/ folder" },
      { text: "Add analytics charts (scans per day, top items, conversion funnel)", file: "analytics/page.tsx" },
      { text: "Add real mobile app icons and splash screen (design required)", file: "apps/mobile/assets/" },
      { text: "Add public QR page layout variants per industry (clinic, food, construction)", file: "[businessSlug]/client.tsx" },
      { text: "Add loyalty card display on public QR page for food/beauty businesses", file: "[businessSlug]/client.tsx" },
      { text: "Launch /pricing page with Stripe + MercadoPago checkout options", file: "pricing/page.tsx" },
      { text: "Add business category CHECK constraint to DB for data integrity", file: "new migration" },
      { text: "Set up Sentry alerts for webhook failures and DB errors", file: "sentry configs" },
    ],
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  full: { label: "Exists Fully", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  partial: { label: "Exists Partially", color: "bg-amber-100 text-amber-700 border-amber-200" },
  missing: { label: "Missing", color: "bg-red-100 text-red-700 border-red-200" },
  broken: { label: "Broken", color: "bg-red-200 text-red-900 border-red-300" },
};

const SCORE_AREAS = [
  { label: "Architecture & Structure", score: 8, note: "Clean monorepo, good separation of concerns" },
  { label: "Tech Stack Quality", score: 8, note: "Next.js 16, React 19, Supabase, pnpm — all excellent choices" },
  { label: "Feature Completeness", score: 5, note: "Many features started but few are fully production-ready" },
  { label: "Database Design", score: 7, note: "Good schema but types file is 6 migrations out of date" },
  { label: "Security", score: 3, note: "Critical: billing bypass, stale types, missing RLS policies" },
  { label: "UI/UX Quality", score: 6, note: "Good design system but dead links and broken flows hurt UX" },
  { label: "Template System", score: 6, note: "55+ templates is impressive, but duplicate ID and no filtering UI" },
  { label: "Business Model Readiness", score: 4, note: "Subscription system non-functional, no MercadoPago" },
  { label: "Mobile App", score: 4, note: "Screens exist but placeholder icons, not App Store ready" },
  { label: "Code Quality", score: 6, note: "1961-line God component, 60+ any types, stray debug files" },
];

const overallScore = (SCORE_AREAS.reduce((a, b) => a + b.score, 0) / SCORE_AREAS.length).toFixed(1);

export default function MeuQRAuditReport() {
  const [activeSection, setActiveSection] = useState("executive");
  const [expandedBug, setExpandedBug] = useState<number | null>(null);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-mono">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-slate-800 bg-slate-900 p-4">
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Audit Report</div>
          <div className="text-lg font-bold text-white">MeuQR</div>
          <div className="text-xs text-emerald-400 mt-1">Full-Stack Code Audit</div>
        </div>
        <nav className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                activeSection === s.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 p-3 rounded-lg bg-slate-800 border border-slate-700">
          <div className="text-xs text-slate-500 mb-1">Overall Score</div>
          <div className="text-3xl font-bold text-white">{overallScore}<span className="text-slate-500 text-base">/10</span></div>
          <div className="text-xs text-amber-400 mt-1">Significant work needed</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 space-y-16 max-w-4xl">

        {/* A. Executive Summary */}
        <section id="executive">
          <SectionHeader letter="A" title="Executive Summary" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-slate-300">
            <p>
              MeuQR is a well-structured monorepo with genuine product ambition. The tech stack (Next.js 16, React 19, Supabase, pnpm workspaces, Expo) is excellent and appropriate for a Brazil-first SaaS targeting small businesses. The project has made substantial progress: 55+ industry templates, a working QR generation system, order management, appointments schema, notifications, and a loyalty program.
            </p>
            <p className="text-red-400 font-semibold border-l-4 border-red-500 pl-4">
              However, there is one critical security bug that would bankrupt the product on day one: the billing page upgrades any user to Pro or Business tier for free without any payment processing. This must be fixed before any public launch.
            </p>
            <p>
              Beyond the billing bug, the project suffers from a pattern of "ambitious but unfinished": features are scaffolded but not wired end-to-end. The sidebar shows 9 links that lead to 404 pages. The Supabase types file is 6 migrations out of date, causing TypeScript errors masked by widespread <code className="text-amber-300">any</code> typing. MercadoPago — the dominant payment provider in Brazil — is mentioned in env.example and the DB schema but has zero code implementation.
            </p>
            <p>
              The core product vision of a "Business OS for small businesses" is the right idea for Brazil's market. The QR-first, WhatsApp-native approach is well-suited to how Brazilian small businesses already operate. With 6–8 weeks of focused work on the roadmap below, this project can become a genuinely strong SaaS product.
            </p>
          </div>
        </section>

        {/* B. Score */}
        <section id="score">
          <SectionHeader letter="B" title="Project Score" />
          <div className="grid grid-cols-1 gap-3">
            {SCORE_AREAS.map((area) => (
              <div key={area.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                <div className="w-32 flex-shrink-0">
                  <div className="text-xs text-slate-400 mb-1">{area.label}</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        area.score >= 7 ? "bg-emerald-500" : area.score >= 5 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${area.score * 10}%` }}
                    />
                  </div>
                </div>
                <div className={`text-2xl font-bold w-8 flex-shrink-0 ${
                  area.score >= 7 ? "text-emerald-400" : area.score >= 5 ? "text-amber-400" : "text-red-400"
                }`}>{area.score}</div>
                <div className="text-xs text-slate-400">{area.note}</div>
              </div>
            ))}
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 flex items-center gap-4">
              <div className="text-xs text-slate-300 w-32 flex-shrink-0 font-bold">Overall</div>
              <div className="text-3xl font-bold text-white w-8">{overallScore}</div>
              <div className="text-xs text-slate-300">Good bones, critical bugs to fix, strong product direction</div>
            </div>
          </div>
        </section>

        {/* C. What Works Well */}
        <section id="good">
          <SectionHeader letter="C" title="What Already Works Well" />
          <div className="grid grid-cols-1 gap-3">
            {[
              { title: "Monorepo architecture", body: "pnpm workspaces with apps/web, apps/mobile, packages/shared, packages/supabase, packages/ui is clean and scalable. Shared types flow correctly between web and mobile." },
              { title: "55+ Industry templates", body: "The business-templates.ts file covers a remarkable breadth of Brazilian business types with realistic Portuguese-language pricing. This is a genuine differentiator." },
              { title: "QR code generation", body: "Custom dot styles, corner styles, colors, gradients, and logo embedding using qr-code-styling. The QR style editor is complete and production-ready." },
              { title: "Database schema", body: "The SQL migrations are well-structured with proper foreign keys, indexes, RLS enablement, and update triggers. The appointments schema (migration 5) is particularly thorough." },
              { title: "i18n with pt-BR, en, es", body: "Full translation system with locale files for all three languages. The audit script (scripts/i18n-audit.sh) is a thoughtful addition. Language selector in the sidebar." },
              { title: "WhatsApp-first order flow", body: "The public page → order drawer → WhatsApp deep link flow is complete and works well for food businesses. Quote-to-WhatsApp also works." },
              { title: "Security headers middleware", body: "proxy.ts applies X-Frame-Options, CSP, HSTS, and other headers correctly to all routes. Good auth-gating for /dashboard routes." },
              { title: "Industry-aware dashboard", body: "getManagementLinks() and the sidebar both dynamically change based on business category. The right idea — just needs the broken routes fixed." },
              { title: "Admin panel", body: "Admin pages for user management, template management, audit logs, and settings are fully implemented and gated correctly." },
              { title: "Sentry integration", body: "client, server, and edge Sentry configs are all set up correctly. Good for production error tracking." },
            ].map((item) => (
              <div key={item.title} className="bg-slate-900 border border-emerald-900/50 rounded-xl p-4">
                <div className="text-emerald-400 font-bold text-sm mb-1">✓ {item.title}</div>
                <div className="text-slate-400 text-xs leading-relaxed">{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* D. Major Problems */}
        <section id="problems">
          <SectionHeader letter="D" title="Major Problems" />
          <div className="space-y-3">
            {[
              { title: "1. Billing is non-functional (free upgrades)", severity: "CRITICAL", body: "The billing page calls Supabase directly to upgrade subscription_tier without any payment. The Stripe checkout API exists and is correctly implemented but is never called. This is the most dangerous bug in the project." },
              { title: "2. 9 dead sidebar navigation links", severity: "CRITICAL", body: "Clinic, dentist, food, and construction business owners will immediately hit 404 pages from the sidebar. This destroys onboarding trust and is trivially reproducible." },
              { title: "3. No MercadoPago implementation", severity: "HIGH", body: "For a Brazil-first product, Mercado Pago is essential — it has 60%+ market share for digital payments vs Stripe's ~5% in Brazil. The schema anticipates it, the env.example documents it, but no code exists. Brazilian small businesses don't have international credit cards for Stripe." },
              { title: "4. Supabase types are 6 migrations stale", severity: "HIGH", body: "types.ts reflects only migration 00001. All tables added in migrations 4–10 are missing. The codebase uses 'any' in dozens of places to paper over the TypeScript errors this causes." },
              { title: "5. Public page is a 1,961-line God component", severity: "MEDIUM", body: "client.tsx handles all public page logic in one file: order cart, quote cart, lead form, booking form, donation modal, modifier modal, WhatsApp integration, PIX display, section rendering. It has 60+ useState hooks. This is unmaintainable and will cause bugs as features are added." },
              { title: "6. Supabase types don't match the businesses table", severity: "MEDIUM", body: "The businesses table has notification_settings JSONB (added in migration 4) but the TypeScript type doesn't include it. The column is used in 8 different files, all relying on type casting to any." },
            ].map((p) => (
              <div key={p.title} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold flex-shrink-0 mt-0.5 ${
                    p.severity === "CRITICAL" ? "bg-red-900 text-red-300" : "bg-orange-900 text-orange-300"
                  }`}>{p.severity}</span>
                  <div>
                    <div className="text-sm font-bold text-white mb-1">{p.title}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{p.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* E. Bugs */}
        <section id="bugs">
          <SectionHeader letter="E" title="Bugs & Risks" />
          <div className="space-y-3">
            {BUG_DATA.map((bug, i) => (
              <div key={i} className={`border rounded-xl overflow-hidden ${bug.color.includes("red") ? "border-red-800" : bug.color.includes("orange") ? "border-orange-800" : bug.color.includes("yellow") ? "border-yellow-800" : "border-blue-800"}`}>
                <button
                  onClick={() => setExpandedBug(expandedBug === i ? null : i)}
                  className="w-full bg-slate-900 p-4 flex items-start gap-3 text-left hover:bg-slate-800 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${bug.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${bug.color}`}>{bug.priority}</span>
                      <code className="text-xs text-slate-400 truncate">{bug.file}</code>
                    </div>
                    <div className="text-sm text-white mt-1">{bug.problem}</div>
                  </div>
                  <span className="text-slate-500 text-xs flex-shrink-0">{expandedBug === i ? "▲" : "▼"}</span>
                </button>
                {expandedBug === i && (
                  <div className="bg-slate-950 p-4 border-t border-slate-800 space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Problem</div>
                      <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{bug.detail}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Fix</div>
                      <div className="text-xs text-emerald-400 leading-relaxed">{bug.fix}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* F. Missing Features */}
        <section id="missing">
          <SectionHeader letter="F" title="Feature Status" />
          <div className="space-y-2">
            {FEATURE_DATA.map((f) => {
              const cfg = STATUS_CONFIG[f.status] || { label: "Unknown", color: "bg-gray-100 text-gray-700 border-gray-200" };
              return (
                <div key={f.name} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${cfg.color}`}>{cfg.label}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{f.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{f.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* G. UX */}
        <section id="ux">
          <SectionHeader letter="G" title="UI/UX Improvements" />
          <div className="space-y-3">
            {[
              { area: "Template selection", issue: "55+ templates shown at once with no filtering. Overwhelming for new users.", fix: "Add category tabs (Alimentação, Saúde, Construção, Beleza, etc.) above the grid. Default to the category matching what the user selected on the previous step. Limit visible templates to 6 and add 'Ver mais' expand." },
              { area: "Pages redirect", issue: "/dashboard/business/[id]/pages/page.tsx redirects to the business overview instead of showing a pages list. Users expect to see their pages.", fix: "Either build a proper pages list page or document why this redirect exists. The comment says 'pages management is handled on Business Overview' but the overview doesn't show a full list." },
              { area: "Empty states", issue: "When a business has no orders, leads, or appointments, the pages show nothing — no illustration, no call to action.", fix: "Add empty state illustrations with clear next-step CTAs: 'Nenhum pedido ainda → Compartilhe seu QR Code' with a share button." },
              { area: "Analytics — no charts", issue: "The analytics page shows only number counters. No time series, no device breakdown visualization, no geographic map.", fix: "Add a simple bar chart for scans-per-day using Recharts (already available in the React ecosystem). Add a mobile vs desktop pie chart." },
              { area: "Onboarding — no template preview", issue: "During business creation, there's no preview of what the QR page will look like. Users create a business without seeing the end result.", fix: "Add a live preview panel on the right side of the new business form showing what the selected template will look like on mobile." },
              { area: "Mobile — no back navigation on deep screens", issue: "The mobile app's business detail screens (/business/[id]/orders etc.) have inconsistent back navigation.", fix: "Standardize header with ArrowLeft → router.back() across all detail screens." },
              { area: "Billing page trust signals", issue: "The billing page has no pricing comparisons, no testimonials, no FAQ, just plan cards.", fix: "Add a comparison table with feature rows. Add a FAQ section about cancellation. This is standard SaaS practice." },
              { area: "Public QR page — no 'Powered by MeuQR' branding on free tier", issue: "Free tier users' public pages show no MeuQR branding. This is a missed growth channel.", fix: "Add a subtle 'Criado com MeuQR' footer badge on free/pro pages. Remove it on Business tier. Classic freemium growth tactic." },
            ].map((item) => (
              <div key={item.area} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm font-bold text-amber-300 mb-1">{item.area}</div>
                <div className="text-xs text-red-400 mb-2">Problem: {item.issue}</div>
                <div className="text-xs text-emerald-400">Fix: {item.fix}</div>
              </div>
            ))}
          </div>
        </section>

        {/* H. Database */}
        <section id="database">
          <SectionHeader letter="H" title="Database Improvements" />
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-sm font-bold text-white mb-3">Tables that exist (confirmed in migrations)</div>
              <div className="flex flex-wrap gap-2">
                {["profiles", "businesses", "business_members", "templates", "template_sections", "template_items", "pages", "sections", "items", "qr_codes", "qr_styles", "scans", "clicks", "leads", "quote_requests", "orders", "payments", "subscriptions", "storage_files", "clients", "notifications", "device_push_tokens", "appointment_services", "staff_members", "business_availability", "appointment_blackouts", "appointments", "loyalty_programs", "loyalty_cards", "loyalty_transactions", "admin_settings", "admin_audit_logs"].map(t => (
                  <span key={t} className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-sm font-bold text-white mb-3">Missing tables — needed for the Business OS vision</div>
              <div className="space-y-2">
                {[
                  { table: "business_categories", why: "Currently category is a free-text string in businesses. No validation, no metadata, no icons stored server-side. Needed for category-based feature flags." },
                  { table: "business_modules", why: "Needed for modular feature system: each business type enables/disables modules (appointments, orders, loyalty, quotes). Currently hardcoded in JS arrays." },
                  { table: "business_enabled_modules", why: "Junction table to track which modules each business has enabled. Enables feature toggling per business without code changes." },
                  { table: "professionals", why: "Distinct from staff_members — a professional (doctor, dentist, physiotherapist) has a specialty, CRM number, bio, avatar. Used in appointment booking forms." },
                  { table: "lead_activities", why: "For a real CRM: track each interaction with a lead (call, WhatsApp, meeting). Currently leads table has no status or activity log." },
                  { table: "product_categories", why: "Items are currently ungrouped except by section. For construction materials and retail, category trees (Cimento > Portland, Pozolânico) are essential." },
                ].map(({ table, why }) => (
                  <div key={table} className="flex items-start gap-3">
                    <span className="text-xs bg-red-900/40 text-red-400 border border-red-800 px-2 py-0.5 rounded flex-shrink-0">{table}</span>
                    <span className="text-xs text-slate-400">{why}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-sm font-bold text-white mb-3">Missing or broken database constraints</div>
              <div className="space-y-2 text-xs text-slate-400">
                <p>• <span className="text-amber-400">businesses.category</span> has no CHECK constraint — any string is valid. The only validation is in frontend TypeScript. Add: <code className="text-emerald-400">CHECK (category IN ('restaurant', 'pizzeria', ...))</code></p>
                <p>• <span className="text-amber-400">leads table</span> has no status column (new/contacted/converted/lost). Needed for CRM pipeline view.</p>
                <p>• <span className="text-amber-400">clients SELECT policy</span> — migration 00004 adds the clients table and INSERT policy (public can insert) but no SELECT policy for business owners. This means owners can't query their own clients from the dashboard without service role key.</p>
                <p>• <span className="text-amber-400">appointment_services</span> needs a SELECT policy for authenticated business owners — current migration only has public SELECT for active services.</p>
              </div>
            </div>
          </div>
        </section>

        {/* I. Templates */}
        <section id="templates">
          <SectionHeader letter="I" title="Template System Improvements" />
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-sm font-bold text-white mb-2">Current State</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                55 templates exist in <code className="text-amber-300">packages/shared/src/templates/business-templates.ts</code> (2,745 lines). They cover food (8), construction (5+), healthcare (3), beauty (4), and many others. Templates are code-only — they're not stored in the database <code>templates</code> table, which appears to be a separate concept used for admin-created templates.
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { title: "Add category filtering to template selection", detail: "Group the 55 templates into 8 visible industry tabs. When the user picks 'Alimentação', show only restaurant/pizza/burger/etc. templates. Currently all 55 are shown in a flat list — deeply overwhelming.", code: "const TEMPLATE_GROUPS = [\n  { key: 'food', label: '🍽️ Alimentação', types: ['restaurant', 'pizzeria', 'burger_shop', ...] },\n  { key: 'health', label: '🏥 Saúde', types: ['medical_clinic', 'dental_clinic', 'physiotherapy', ...] },\n  { key: 'construction', label: '🏗️ Construção', types: ['construction_materials', 'hardware_store', ...] },\n  ...]" },
                { title: "Fix duplicate template ID tmpl-052", detail: "Two templates share the same ID: tmpl-052-product-shelf and tmpl-052-clinica-medica. Rename clinica-medica to tmpl-055-clinica-medica.", code: "// Change line 2561:\nid: \"tmpl-052-clinica-medica\"\n// To:\nid: \"tmpl-055-clinica-medica\"" },
                { title: "Add template preview metadata", detail: "Each template should have: previewImageUrl (screenshot), sectionCount, itemCount, formType badge. Show these on the template card before selection.", code: "// Add to BusinessTemplate interface:\npreviewImageUrl?: string;\ntags?: string[]; // ['cardápio', 'delivery', 'whatsapp']" },
                { title: "Specific healthcare templates needed", detail: "The medical_clinic template (tmpl-026) only has a services list. For clinics, you need: professional profiles section, appointment booking CTA, insurance accepted, medical record disclaimer, WhatsApp scheduling CTA.", code: "// tmpl-026-medica sections should include:\n// 1. Profissionais (doctors with specialties)\n// 2. Serviços/Especialidades\n// 3. Convênios Aceitos\n// 4. Agendar Consulta (booking form)" },
                { title: "Construction material template needs quote flow", detail: "tmpl-009-construcao has products but no 'Solicitar Orçamento' section by default. Construction businesses' primary CTA is a quote request, not an order.", code: "// Add to construction template:\nformType: 'quote', // not 'order'\nsections: [\n  { title: 'Produtos em Destaque', ... },\n  { title: 'Solicitar Orçamento', sectionType: 'quote', ... },\n  { title: 'Formas de Pagamento', ... },\n  { title: 'Entrega e Frete', ... },\n]" },
              ].map((item) => (
                <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-sm font-bold text-indigo-300 mb-2">{item.title}</div>
                  <div className="text-xs text-slate-400 mb-3">{item.detail}</div>
                  <pre className="text-xs text-emerald-400 bg-slate-950 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{item.code}</pre>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* J. Business Model */}
        <section id="business">
          <SectionHeader letter="J" title="Business Model Recommendations" />
          <div className="space-y-3">
            {[
              { title: "Fix payment before launch — no exceptions", body: "The current billing system gives free tier upgrades. This must be fixed first. Implement MercadoPago before Stripe for Brazil. Brazilian small businesses use Pix, boleto bancário, and Mercado Pago — not international credit cards. Stripe is a secondary option for larger businesses." },
              { title: "Target: food & beauty first, then health & construction", body: "Food businesses (restaurants, pizzerias, bakeries) have the clearest ROI: QR on table → order on WhatsApp → repeat customers. Beauty (salons, barbers) need appointments. Both are high-frequency, high-intent categories. Medical and construction are more complex to onboard but have higher ARPU." },
              { title: "Pricing looks right for Brazil but add a trial", body: "R$0 / R$97 / R$247 per month is well-positioned. Add a 14-day free trial on Pro that auto-converts. Brazilian SMBs need to see value before paying. Consider an annual plan at 2 months free (R$970/year vs R$1,164)." },
              { title: "Freemium growth lever: 'Criado com MeuQR'", body: "Every public QR page on the free tier should show a small 'Powered by MeuQR — crie o seu grátis' badge. This is word-of-mouth marketing baked into the product. Estimate: if 10,000 scans/day happen across free customers, and 0.5% click the badge, that's 50 signups/day for free." },
              { title: "WhatsApp Business API is the moat", body: "In Brazil, WhatsApp is used by 98%+ of the population. The existing WhatsApp-first order flow is the right differentiator. Next: add appointment reminders via WhatsApp API, automated follow-up messages, and broadcast lists to loyal customers. This creates switching costs competitors can't easily copy." },
              { title: "Upsell through usage limits not features", body: "The current plan limits (max_businesses: 1/3/∞, max_qrs: 1/10/∞) are good. Add a usage bar on the dashboard: 'Você usou 18/20 itens — Faça upgrade para Pro'. Friction at the limit is the most effective upsell trigger." },
            ].map((item) => (
              <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm font-bold text-purple-300 mb-1">{item.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* K. Roadmap */}
        <section id="roadmap">
          <SectionHeader letter="K" title="Priority Roadmap" />
          <div className="space-y-6">
            {ROADMAP.map((phase) => (
              <div key={phase.phase} className={`border rounded-2xl overflow-hidden ${phase.border}`}>
                <div className={`bg-gradient-to-r ${phase.color} p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/70 font-bold uppercase tracking-widest">{phase.phase}</div>
                      <div className="text-lg font-bold text-white">{phase.title}</div>
                    </div>
                    <div className="text-xs text-white/70 bg-white/20 px-3 py-1 rounded-full">{phase.weeks}</div>
                  </div>
                </div>
                <div className={`${phase.bg} p-4 space-y-2`}>
                  {phase.tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/80 border border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] text-slate-500 font-bold">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-800">{task.text}</div>
                        <code className="text-[10px] text-slate-500">{task.file}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-16" />
      </main>
    </div>
  );
}

function SectionHeader({ letter, title }: { letter: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-emerald-400">{letter}</span>
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}
