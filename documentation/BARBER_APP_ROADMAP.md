# BarberApp - Complete Development Roadmap

## 🎯 Project Overview
A barbershop appointment booking system with 3 user roles: Owner, Barber, and Client.

**Tech Stack:**
- React Native + Expo (iOS, Android, Web)
- TypeScript
- Supabase (Auth, Database, Storage, RLS)
- React Navigation
- Zustand (State Management)
- Expo Push Notifications

---

## 📋 PHASE 1: Foundation & Database (Days 1-3)

### Day 1: Supabase Database Setup

**Goal:** Get your database structure solid before writing any UI code.

#### Step 1.1: Database Tables Creation

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'barber', 'client')),
  display_name TEXT,
  phone TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barbershops table
CREATE TABLE barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  description TEXT,
  avatar_url TEXT,
  opening_hours_json JSONB, -- Simple JSON for now: {"monday": "9:00-18:00", ...}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table (barbers working at a barbershop)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barbershop_id, user_id)
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table (customers of a specific barbershop)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  employee_id UUID REFERENCES employees(id),
  client_id UUID REFERENCES clients(id),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'completed', 'no_show', 'canceled_by_owner', 'canceled_by_client')
  ),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent overlapping appointments for same employee
  CONSTRAINT no_overlap EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (status NOT IN ('canceled_by_owner', 'canceled_by_client'))
);

-- Indexes for performance
CREATE INDEX idx_barbershops_owner ON barbershops(owner_id);
CREATE INDEX idx_employees_barbershop ON employees(barbershop_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_services_barbershop ON services(barbershop_id);
CREATE INDEX idx_clients_barbershop ON clients(barbershop_id);
CREATE INDEX idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX idx_appointments_employee ON appointments(employee_id);
CREATE INDEX idx_appointments_starts_at ON appointments(starts_at);
```

#### Step 1.2: Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can read their own user
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Barbershops: Owners can manage their barbershops
CREATE POLICY "Owners can manage their barbershops" ON barbershops
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Everyone can view barbershops" ON barbershops
  FOR SELECT USING (true);

-- Employees: Owners can manage employees of their barbershops
CREATE POLICY "Owners manage employees" ON employees
  FOR ALL USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Employees can read themselves" ON employees
  FOR SELECT USING (user_id = auth.uid());

-- Services: Owners manage services
CREATE POLICY "Owners manage services" ON services
  FOR ALL USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can read active services" ON services
  FOR SELECT USING (is_active = true);

-- Clients: Owners and employees can see clients
CREATE POLICY "Barbershop staff read clients" ON clients
  FOR SELECT USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
      UNION
      SELECT barbershop_id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage clients" ON clients
  FOR ALL USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
    )
  );

-- Appointments: Complex access rules
CREATE POLICY "Owners see all appointments" ON appointments
  FOR SELECT USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Employees see their appointments" ON appointments
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage appointments" ON appointments
  FOR ALL USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
    )
  );
```

#### Step 1.3: Edge Functions for Appointments

Create a Supabase Edge Function to handle appointment creation with validation:

```sql
-- Function to calculate appointment end time
CREATE OR REPLACE FUNCTION calculate_appointment_end_time(
  p_barbershop_id UUID,
  p_service_id UUID,
  p_employee_id UUID,
  p_client_id UUID,
  p_starts_at TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  ends_at TIMESTAMP WITH TIME ZONE,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_duration INTEGER;
  v_ends_at TIMESTAMP WITH TIME ZONE;
  v_overlaps INTEGER;
BEGIN
  -- Get service duration
  SELECT duration_minutes INTO v_duration
  FROM services
  WHERE id = p_service_id AND barbershop_id = p_barbershop_id;

  IF v_duration IS NULL THEN
    RETURN QUERY SELECT NULL::TIMESTAMP WITH TIME ZONE, false, 'Service not found';
    RETURN;
  END IF;

  -- Calculate end time
  v_ends_at := p_starts_at + (v_duration || ' minutes')::INTERVAL;

  -- Check for overlaps
  SELECT COUNT(*) INTO v_overlaps
  FROM appointments
  WHERE employee_id = p_employee_id
    AND status NOT IN ('canceled_by_owner', 'canceled_by_client')
    AND tstzrange(starts_at, ends_at) && tstzrange(p_starts_at, v_ends_at);

  IF v_overlaps > 0 THEN
    RETURN QUERY SELECT v_ends_at, false, 'Time slot not available';
    RETURN;
  END IF;

  RETURN QUERY SELECT v_ends_at, true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Day 2: Project Structure Setup

**Goal:** Clean, organized codebase with proper TypeScript types.

#### Step 2.1: Install Core Dependencies

```bash
# Navigate to your project
cd barberApp

# Install dependencies
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install zustand
npx expo install react-hook-form zod
npx expo install expo-image-picker expo-notifications
npx expo install date-fns
```

#### Step 2.2: Create Folder Structure

```
barberApp/
├── app/                          # Expo Router (if using) or entry point
├── src/
│   ├── components/              # Reusable components
│   │   ├── ui/                  # Base UI components (Button, Input, Card, etc.)
│   │   ├── barbershop/          # Barbershop-specific components
│   │   ├── appointment/         # Appointment components
│   │   └── common/              # Common components (Loading, Error, etc.)
│   ├── screens/                 # Screen components
│   │   ├── auth/
│   │   ├── owner/
│   │   ├── barber/
│   │   └── client/
│   ├── navigation/              # Navigation configuration
│   ├── services/                # API and business logic
│   │   ├── supabase/
│   │   └── api/
│   ├── store/                   # Zustand stores
│   ├── hooks/                   # Custom hooks
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Helper functions
│   └── constants/               # Constants and config
├── assets/
└── package.json
```

#### Step 2.3: Create Base TypeScript Types

Create `src/types/database.types.ts`:

```typescript
export type UserRole = 'owner' | 'barber' | 'client';

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'completed' 
  | 'no_show' 
  | 'canceled_by_owner' 
  | 'canceled_by_client';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  display_name: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Barbershop {
  id: string;
  owner_id: string;
  name: string;
  city: string;
  phone: string | null;
  description: string | null;
  avatar_url: string | null;
  opening_hours_json: OpeningHours | null;
  created_at: string;
}

export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface Employee {
  id: string;
  barbershop_id: string;
  user_id: string;
  display_name: string;
  created_at: string;
}

export interface Service {
  id: string;
  barbershop_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  barbershop_id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  barbershop_id: string;
  service_id: string;
  employee_id: string;
  client_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
}

// Extended types with relations
export interface AppointmentWithDetails extends Appointment {
  service: Service;
  employee: Employee;
  client: Client;
}
```

---

### Day 3: Supabase Client & Auth Setup

**Goal:** Connect your app to Supabase and implement authentication.

#### Step 3.1: Configure Supabase Client

Create `src/services/supabase/client.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Create `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### Step 3.2: Auth Service

Create `src/services/supabase/auth.service.ts`:

```typescript
import { supabase } from './client';
import { UserRole } from '../../types/database.types';

export const authService = {
  // Sign up
  async signUp(email: string, password: string, role: UserRole, displayName: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned');

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        role,
        display_name: displayName,
      });

    if (profileError) throw profileError;

    return authData;
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
```

#### Step 3.3: Auth Store (Zustand)

Create `src/store/authStore.ts`:

```typescript
import { create } from 'zustand';
import { User } from '../types/database.types';
import { authService } from '../services/supabase/auth.service';

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: any, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email, password) => {
    try {
      set({ loading: true });
      const { session, user: authUser } = await authService.signIn(email, password);
      
      if (authUser) {
        const profile = await authService.getUserProfile(authUser.id);
        set({ user: profile, session });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, role, displayName) => {
    try {
      set({ loading: true });
      await authService.signUp(email, password, role, displayName);
      // After signup, sign in automatically
      await get().signIn(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await authService.signOut();
      set({ user: null, session: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  initialize: async () => {
    try {
      set({ loading: true });
      
      // Get current session
      const session = await authService.getSession();
      
      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        set({ user: profile, session });
      }

      // Listen to auth changes
      authService.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await authService.getUserProfile(session.user.id);
          set({ user: profile, session });
        } else {
          set({ user: null, session: null });
        }
      });

      set({ initialized: true });
    } catch (error) {
      console.error('Initialize error:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
```

---

## 📋 PHASE 2: Core UI & Navigation (Days 4-6)

### Day 4: Base UI Components

**Goal:** Create reusable UI components that you'll use everywhere.

#### Components to create:

1. **Button Component** (`src/components/ui/Button.tsx`)
2. **Input Component** (`src/components/ui/Input.tsx`)
3. **Card Component** (`src/components/ui/Card.tsx`)
4. **Loading Component** (`src/components/common/Loading.tsx`)
5. **Error Component** (`src/components/common/Error.tsx`)

I'll provide one example - Button:

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#64748b',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#2563eb',
  },
  dangerText: {
    color: '#fff',
  },
});
```

---

### Day 5: Navigation Structure

**Goal:** Set up navigation for all three user roles.

Create `src/navigation/RootNavigator.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { OwnerNavigator } from './OwnerNavigator';
import { BarberNavigator } from './BarberNavigator';
import { ClientNavigator } from './ClientNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return null; // Or loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.role === 'owner' ? (
          <Stack.Screen name="Owner" component={OwnerNavigator} />
        ) : user.role === 'barber' ? (
          <Stack.Screen name="Barber" component={BarberNavigator} />
        ) : (
          <Stack.Screen name="Client" component={ClientNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

---

### Day 6: Auth Screens

**Goal:** Create login and registration screens.

Create these screens:
1. `src/screens/auth/LoginScreen.tsx`
2. `src/screens/auth/RegisterScreen.tsx`

---

## 📋 PHASE 3: Owner Features (Days 7-10)

### Owner Dashboard & Barbershop Management

**Day 7:** Create/Edit Barbershop
**Day 8:** Services CRUD
**Day 9:** Employee Management
**Day 10:** Owner's Agenda View

---

## 📋 PHASE 4: Barber Features (Days 11-12)

### Barber Agenda & Appointment Management

---

## 📋 PHASE 5: Client Features (Days 13-15)

### Client Booking Flow

**Day 13:** Search Barbershops
**Day 14:** Book Appointment
**Day 15:** My Appointments

---

## 📋 PHASE 6: Advanced Features (Days 16-20)

**Day 16:** Push Notifications
**Day 17:** Image Upload (Supabase Storage)
**Day 18:** Appointment Rescheduling
**Day 19:** Business Rules & Validations
**Day 20:** Testing & Bug Fixes

---

## ✅ Development Checklist

### Immediate Next Steps (Today)
- [ ] Run database SQL commands in Supabase
- [ ] Create `.env` file with Supabase credentials
- [ ] Install all dependencies
- [ ] Create folder structure
- [ ] Copy type definitions

### Week 1 Goals
- [ ] Complete auth flow (login/register)
- [ ] Test authentication works
- [ ] Create base UI components
- [ ] Set up navigation

### Week 2 Goals
- [ ] Owner can create barbershop
- [ ] Owner can add services
- [ ] Owner can add employees

### Week 3 Goals
- [ ] Barber can see their agenda
- [ ] Client can search barbershops
- [ ] Client can book appointments

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on your phone (scan QR code with Expo Go app)
npx expo start
```

---

## 📝 Notes

**About Android Studio:**
- You DON'T need Android Studio if you're only using Expo Go on your phone
- You ONLY need it if you want to test on an Android emulator on your PC
- For now, stick with Expo Go on your phone - it's simpler

**Development Tips:**
- Start with the database - get it right first
- Build one feature at a time
- Test on your phone frequently with Expo Go
- Don't worry about perfection - MVP first, polish later

**When You Get Stuck:**
- Check Supabase logs for database errors
- Use `console.log` liberally
- Test each feature before moving to the next
- Ask for help when needed!
