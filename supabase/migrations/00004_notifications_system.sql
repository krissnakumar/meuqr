-- ============================================
-- MeuQR - Phase 15 Notifications System Migration
-- ============================================

-- 1. Create Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL CHECK (source IN ('menu', 'qr', 'whatsapp', 'manual')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_interaction_type TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_quote_requests INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone)
);

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'push', 'email', 'whatsapp', 'system')),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Device Push Tokens Table
CREATE TABLE IF NOT EXISTS device_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  expo_push_token TEXT NOT NULL,
  device_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, expo_push_token)
);

-- 4. Alter existing tables to connect to clients
ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- 5. Add notification settings to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notification_settings JSONB NOT NULL DEFAULT '{
  "notify_qr_scan": true,
  "notify_whatsapp_click": true,
  "notify_new_order": true,
  "notify_quote_request": true,
  "notify_lead": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "quiet_hours_enabled": false,
  "notification_language": "pt-BR",
  "push_enabled": true,
  "email_enabled": false,
  "whatsapp_enabled": false
}'::jsonb;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_push_tokens ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- 7.1 Clients Policies
CREATE POLICY "Business members and owners can view their clients" ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = clients.business_id
      AND business_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = clients.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business members and owners can manage their clients" ON clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = clients.business_id
      AND business_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = clients.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- 7.2 Notifications Policies
CREATE POLICY "Business members and owners can view notifications for their business" ON notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = notifications.business_id
      AND business_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = notifications.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business members and owners can update notifications for their business" ON notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = notifications.business_id
      AND business_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = notifications.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- 7.3 Device Push Tokens Policies
CREATE POLICY "Users can manage their own device push tokens" ON device_push_tokens
  FOR ALL
  USING (user_id = auth.uid());

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_clients_business_id ON clients(business_id);
CREATE INDEX IF NOT EXISTS idx_device_push_tokens_user_id ON device_push_tokens(user_id);
