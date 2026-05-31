-- 5. Appointments System

CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  price DECIMAL(10,2) CHECK (price IS NULL OR price >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE business_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  UNIQUE(business_id, day_of_week, start_time, staff_id)
);

CREATE TABLE appointment_blackouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_datetime > start_datetime)
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES appointment_services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE INDEX appointments_business_id_appointment_date_idx
  ON appointments (business_id, appointment_date, start_time);

CREATE INDEX appointment_services_business_id_is_active_idx
  ON appointment_services (business_id, is_active);

CREATE INDEX staff_members_business_id_is_active_idx
  ON staff_members (business_id, is_active);

-- RLS
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_blackouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Triggers
CREATE TRIGGER update_appointment_services_updated_at
  BEFORE UPDATE ON appointment_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_business_availability_updated_at
  BEFORE UPDATE ON business_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointment_blackouts_updated_at
  BEFORE UPDATE ON appointment_blackouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Policies for public creation
CREATE POLICY "Public can view active services"
  ON appointment_services FOR SELECT
  USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = appointment_services.business_id
      AND businesses.is_active = true
    )
  );

CREATE POLICY "Public can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = appointments.business_id
      AND businesses.is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM appointment_services
      WHERE appointment_services.id = appointments.service_id
      AND appointment_services.business_id = appointments.business_id
      AND appointment_services.is_active = true
    )
  );

-- Policies for business owners (using existing logic)
CREATE POLICY "Owners manage services"
  ON appointment_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = appointment_services.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage services"
  ON appointment_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = appointment_services.business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Owners manage staff"
  ON staff_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = staff_members.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage staff"
  ON staff_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = staff_members.business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Owners manage availability"
  ON business_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_availability.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage availability"
  ON business_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = business_availability.business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Owners manage blackouts"
  ON appointment_blackouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = appointment_blackouts.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage blackouts"
  ON appointment_blackouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = appointment_blackouts.business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Owners manage appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = appointments.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = appointments.business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );
