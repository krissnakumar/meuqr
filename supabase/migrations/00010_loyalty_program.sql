-- 10. Loyalty Program

CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  points_required INTEGER NOT NULL DEFAULT 10,
  reward_description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE loyalty_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  current_points INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  rewards_redeemed INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(program_id, customer_phone)
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL, -- Positive for earn, negative for redeem
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'admin_adjustment')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Triggers
CREATE TRIGGER update_loyalty_programs_updated_at
  BEFORE UPDATE ON loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_loyalty_cards_updated_at
  BEFORE UPDATE ON loyalty_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Policies for loyalty_programs
CREATE POLICY "Public can view active loyalty programs"
  ON loyalty_programs FOR SELECT
  USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = loyalty_programs.business_id
      AND businesses.is_active = true
    )
  );

CREATE POLICY "Owners manage loyalty programs"
  ON loyalty_programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = loyalty_programs.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage loyalty programs"
  ON loyalty_programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = loyalty_programs.business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

-- Policies for loyalty_cards
CREATE POLICY "Public can view their own loyalty card by phone"
  ON loyalty_cards FOR SELECT
  USING (true); -- Usually restricted via application logic by querying with specific phone number

CREATE POLICY "Owners manage loyalty cards"
  ON loyalty_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM loyalty_programs
      JOIN businesses ON businesses.id = loyalty_programs.business_id
      WHERE loyalty_programs.id = loyalty_cards.program_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage loyalty cards"
  ON loyalty_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM loyalty_programs
      JOIN business_members ON business_members.business_id = loyalty_programs.business_id
      WHERE loyalty_programs.id = loyalty_cards.program_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

-- Policies for loyalty_transactions
CREATE POLICY "Owners manage loyalty transactions"
  ON loyalty_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM loyalty_cards
      JOIN loyalty_programs ON loyalty_programs.id = loyalty_cards.program_id
      JOIN businesses ON businesses.id = loyalty_programs.business_id
      WHERE loyalty_cards.id = loyalty_transactions.card_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage loyalty transactions"
  ON loyalty_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM loyalty_cards
      JOIN loyalty_programs ON loyalty_programs.id = loyalty_cards.program_id
      JOIN business_members ON business_members.business_id = loyalty_programs.business_id
      WHERE loyalty_cards.id = loyalty_transactions.card_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );
