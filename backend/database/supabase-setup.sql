-- ============================================
-- BARBERAPP DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- ==========================================
-- 1. CREATE TABLES
-- ==========================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'barber', 'client')),
  display_name TEXT,
  phone TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barbershops table
CREATE TABLE IF NOT EXISTS barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  description TEXT,
  avatar_url TEXT,
  opening_hours_json JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table (barbers working at a barbershop)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT employees_barbershop_user_unique UNIQUE(barbershop_id, user_id),
  CONSTRAINT employees_id_barbershop_unique UNIQUE(id, barbershop_id)
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT services_id_barbershop_unique UNIQUE(id, barbershop_id)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT clients_barbershop_user_unique UNIQUE(barbershop_id, user_id),
  CONSTRAINT clients_id_barbershop_unique UNIQUE(id, barbershop_id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  service_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  client_id UUID NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'completed', 'no_show', 'canceled_by_owner', 'canceled_by_client')
  ),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT appointments_time_range_chk CHECK (starts_at < ends_at),
  CONSTRAINT appointments_service_barbershop_fk FOREIGN KEY (service_id, barbershop_id)
    REFERENCES services(id, barbershop_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT appointments_employee_barbershop_fk FOREIGN KEY (employee_id, barbershop_id)
    REFERENCES employees(id, barbershop_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT appointments_client_barbershop_fk FOREIGN KEY (client_id, barbershop_id)
    REFERENCES clients(id, barbershop_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  
  -- Prevent overlapping appointments for same employee
  CONSTRAINT no_overlap EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (status NOT IN ('canceled_by_owner', 'canceled_by_client'))
);

-- ==========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_barbershops_owner ON barbershops(owner_id);
CREATE INDEX IF NOT EXISTS idx_barbershops_city ON barbershops(city);
CREATE INDEX IF NOT EXISTS idx_barbershops_active ON barbershops(is_active);

CREATE INDEX IF NOT EXISTS idx_employees_barbershop ON employees(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

CREATE INDEX IF NOT EXISTS idx_services_barbershop ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

CREATE INDEX IF NOT EXISTS idx_clients_barbershop ON clients(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);

CREATE INDEX IF NOT EXISTS idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_employee ON appointments(employee_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON appointments(starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ==========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. DROP EXISTING POLICIES (for clean slate)
-- ==========================================

DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert on signup" ON users;

DROP POLICY IF EXISTS "Everyone can view active barbershops" ON barbershops;
DROP POLICY IF EXISTS "Owners can insert their barbershops" ON barbershops;
DROP POLICY IF EXISTS "Owners can update their barbershops" ON barbershops;
DROP POLICY IF EXISTS "Owners can delete their barbershops" ON barbershops;

DROP POLICY IF EXISTS "Staff can read employees" ON employees;
DROP POLICY IF EXISTS "Owners can manage employees" ON employees;

DROP POLICY IF EXISTS "Everyone can read active services" ON services;
DROP POLICY IF EXISTS "Owners can manage services" ON services;

DROP POLICY IF EXISTS "Staff can read clients" ON clients;
DROP POLICY IF EXISTS "Owners can manage clients" ON clients;
DROP POLICY IF EXISTS "Clients can read own profiles" ON clients;

DROP POLICY IF EXISTS "Owners see all appointments" ON appointments;
DROP POLICY IF EXISTS "Employees see their appointments" ON appointments;
DROP POLICY IF EXISTS "Owners manage appointments" ON appointments;
DROP POLICY IF EXISTS "Clients see their appointments" ON appointments;

-- ==========================================
-- 5. CREATE ROW LEVEL SECURITY POLICIES
-- ==========================================

-- USERS POLICIES
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- BARBERSHOPS POLICIES
CREATE POLICY "Everyone can view active barbershops" ON barbershops
  FOR SELECT USING (is_active = true OR owner_id = auth.uid());

CREATE POLICY "Owners can insert their barbershops" ON barbershops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their barbershops" ON barbershops
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their barbershops" ON barbershops
  FOR DELETE USING (owner_id = auth.uid());

-- EMPLOYEES POLICIES
CREATE POLICY "Staff can read employees" ON employees
  FOR SELECT USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
      UNION
      SELECT barbershop_id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage employees" ON employees
  FOR ALL USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- SERVICES POLICIES
CREATE POLICY "Everyone can read active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage services" ON services
  FOR ALL USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- CLIENTS POLICIES
CREATE POLICY "Staff can read clients" ON clients
  FOR SELECT USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
      UNION
      SELECT barbershop_id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage clients" ON clients
  FOR ALL USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Clients can read own profiles" ON clients
  FOR SELECT USING (user_id = auth.uid());

-- APPOINTMENTS POLICIES
CREATE POLICY "Owners see all appointments" ON appointments
  FOR SELECT USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Employees see their appointments" ON appointments
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients see their appointments" ON appointments
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage appointments" ON appointments
  FOR ALL USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- ==========================================
-- 6. CREATE HELPER FUNCTIONS
-- ==========================================

-- Create profile row automatically when a new auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
BEGIN
  requested_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'client'));

  IF requested_role NOT IN ('owner', 'barber', 'client') THEN
    requested_role := 'client';
  END IF;

  INSERT INTO users (
    id,
    email,
    role,
    display_name
  )
  VALUES (
    NEW.id,
    LOWER(COALESCE(NEW.email, '')),
    requested_role,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'display_name', '')), '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    display_name = COALESCE(EXCLUDED.display_name, users.display_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_barbershops_updated_at ON barbershops;
CREATE TRIGGER update_barbershops_updated_at
  BEFORE UPDATE ON barbershops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 7. CREATE STORAGE BUCKETS
-- ==========================================

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==========================================
-- SETUP COMPLETE!
-- ==========================================

-- Verify setup
SELECT 'Database setup completed successfully!' AS status;
SELECT 'Tables created: ' || count(*)::text FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'barbershops', 'employees', 'services', 'clients', 'appointments');
