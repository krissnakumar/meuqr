# Dynamic Form Builder Implementation Plan

To support true dynamic CRM data capture (Phase 2), we need to update the Supabase database schema to support custom JSONB properties and form schemas.

## 1. Database Migration (SQL)
Please run the following SQL script in your **Supabase SQL Editor** to add the necessary columns. We are adding `form_schema` to the `businesses` table, and `custom_fields` to the operational CRM tables so that variable responses can be stored.

```sql
-- Add a form schema configuration to the businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '{
  "appointments": [],
  "leads": [],
  "quotes": []
}'::jsonb;

-- Add custom data storage to the CRM tables
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
```

## 2. Platform Architecture Updates (What I will code next)

Once the database supports these JSONB columns, I will build the following:

### A. Dashboard Settings UI (Form Builder)
I will create a new settings tab at `/dashboard/business/[id]/forms` with a drag-and-drop or simple builder interface. 
* Businesses can add fields like: `Date of Birth` (Date), `Health Insurance Provider` (Text), `Upload Blueprint` (File).
* These fields will be saved directly into `businesses.form_schema`.

### B. Public Public Page Form Renderer
In `apps/web/src/app/[businessSlug]/client.tsx`, I will update the Leads, Quotes, and Appointment booking drawers. 
* Before rendering the hardcoded inputs (Name, Phone, Email), the UI will fetch the business's `form_schema`.
* It will dynamically map over the schema to render the custom fields exactly as the business defined them.

### C. API Route Handlers
I will update `apps/web/src/app/api/appointments/route.ts` and others to accept the `customFields` object payload and safely insert it into the newly created JSONB database column.

---
**Ready to proceed?** 
1. Run the SQL script above in your Supabase dashboard.
2. Let me know when it's done, and I will begin writing the React components and API updates!
