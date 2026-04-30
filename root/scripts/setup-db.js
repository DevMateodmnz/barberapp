const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:PITOpito123@db.atihuxzpzoknwvejwumr.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- ============================================
-- BARBERAPP DATABASE SETUP
-- ============================================

-- ==========================================
-- 1. CREATE TABLES
-- ============================================

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
    REFERENCES clients(id, barbershop_id) ON UPDATE CASCADE ON DELETE RESTRICT
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
`;

async function runSetup() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected!');

    console.log('Creating tables...');
    await client.query(sql);
    console.log('Tables created successfully!');

    console.log('\nVerifying tables...');
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('Tables in database:');
    result.rows.forEach(row => console.log('  - ' + row.table_name));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
    console.log('\nDisconnected from database.');
  }
}

runSetup();