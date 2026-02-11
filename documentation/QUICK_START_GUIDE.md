# 🚀 BarberApp - Step-by-Step Implementation Guide

## START HERE - Your First 3 Hours

This guide will get you from "messy code" to "working authentication" in one focused session.

---

## ⏰ HOUR 1: Database Setup (No Code Yet!)

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com
2. Open your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Copy-Paste This ENTIRE SQL Script

```sql
-- ============================================
-- COMPLETE DATABASE SETUP FOR BARBERAPP
-- Copy this entire block and run it in Supabase
-- ============================================

-- 1. Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'barber', 'client')),
  display_name TEXT,
  phone TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create barbershops table
CREATE TABLE barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  description TEXT,
  avatar_url TEXT,
  opening_hours_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barbershop_id, user_id)
);

-- 4. Create services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create appointments table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes
CREATE INDEX idx_barbershops_owner ON barbershops(owner_id);
CREATE INDEX idx_employees_barbershop ON employees(barbershop_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_services_barbershop ON services(barbershop_id);
CREATE INDEX idx_clients_barbershop ON clients(barbershop_id);
CREATE INDEX idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX idx_appointments_employee ON appointments(employee_id);
CREATE INDEX idx_appointments_starts_at ON appointments(starts_at);

-- 8. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 9. Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert on signup" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 10. Barbershops policies
CREATE POLICY "Everyone can view barbershops" ON barbershops
  FOR SELECT USING (true);

CREATE POLICY "Owners can insert their barbershops" ON barbershops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their barbershops" ON barbershops
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their barbershops" ON barbershops
  FOR DELETE USING (owner_id = auth.uid());

-- 11. Employees policies
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

-- 12. Services policies
CREATE POLICY "Everyone can read active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage services" ON services
  FOR ALL USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- 13. Clients policies
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

-- 14. Appointments policies
CREATE POLICY "Owners see all appointments" ON appointments
  FOR SELECT USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Employees see their appointments" ON appointments
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners manage appointments" ON appointments
  FOR ALL USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- ============================================
-- DONE! Click "Run" button in Supabase
-- ============================================
```

### Step 3: Verify It Worked

After running the SQL:
1. Click "Table Editor" in left sidebar
2. You should see: users, barbershops, employees, services, clients, appointments
3. If you see all 6 tables ✅ Success!

---

## ⏰ HOUR 2: Project Setup

### Step 1: Get Your Supabase Keys

1. In Supabase Dashboard, click "Settings" → "API"
2. Copy these two values:
   - Project URL
   - anon public key

### Step 2: Create `.env` File

In your project root (same level as package.json), create `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ Replace with YOUR actual values!

### Step 3: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js @react-native-async-storage/async-storage

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# State management
npm install zustand

# Forms & validation
npm install react-hook-form zod

# Utilities
npm install date-fns
npm install react-native-url-polyfill
```

### Step 4: Create Folder Structure

```bash
mkdir -p src/components/ui
mkdir -p src/components/common
mkdir -p src/screens/auth
mkdir -p src/screens/owner
mkdir -p src/screens/barber
mkdir -p src/screens/client
mkdir -p src/navigation
mkdir -p src/services/supabase
mkdir -p src/store
mkdir -p src/types
mkdir -p src/utils
```

---

## ⏰ HOUR 3: Authentication Code

### File 1: `src/types/database.types.ts`

```typescript
export type UserRole = 'owner' | 'barber' | 'client';

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

export interface Appointment {
  id: string;
  barbershop_id: string;
  service_id: string;
  employee_id: string;
  client_id: string;
  starts_at: string;
  ends_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'no_show' | 'canceled_by_owner' | 'canceled_by_client';
  notes: string | null;
  created_at: string;
}
```

### File 2: `src/services/supabase/client.ts`

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### File 3: `src/services/supabase/auth.service.ts`

```typescript
import { supabase } from './client';
import { UserRole, User } from '../../types/database.types';

export const authService = {
  async signUp(email: string, password: string, role: UserRole, displayName: string) {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup');

    // 2. Create user profile
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

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUserProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
```

### File 4: `src/store/authStore.ts`

```typescript
import { create } from 'zustand';
import { User, UserRole } from '../types/database.types';
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
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
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

  signIn: async (email: string, password: string) => {
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

  signUp: async (email: string, password: string, role: UserRole, displayName: string) => {
    try {
      set({ loading: true });
      await authService.signUp(email, password, role, displayName);
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
      
      const session = await authService.getSession();
      
      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        set({ user: profile, session });
      }

      authService.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
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
      set({ initialized: true });
    } finally {
      set({ loading: false });
    }
  },
}));
```

### File 5: `src/components/ui/Button.tsx`

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
  variant?: 'primary' | 'secondary' | 'outline';
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
        <ActivityIndicator color={variant === 'outline' ? '#2563eb' : '#fff'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#64748b',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2563eb',
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
});
```

### File 6: `src/components/ui/Input.tsx`

```typescript
import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 52,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },
});
```

### File 7: `src/screens/auth/LoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim().toLowerCase(), password);
      // Navigation will happen automatically via AuthStore
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
            />

            <Button
              title="Create Account"
              variant="outline"
              onPress={() => navigation.navigate('Register')}
              fullWidth
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
});
```

### File 8: `src/screens/auth/RegisterScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/database.types';

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await signUp(email.trim().toLowerCase(), password, role, displayName);
      // Navigation will happen automatically
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join BarberApp today</Text>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I am a:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
                  onPress={() => setRole('client')}
                >
                  <Text style={[styles.roleButtonText, role === 'client' && styles.roleButtonTextActive]}>
                    Client
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, role === 'barber' && styles.roleButtonActive]}
                  onPress={() => setRole('barber')}
                >
                  <Text style={[styles.roleButtonText, role === 'barber' && styles.roleButtonTextActive]}>
                    Barber
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, role === 'owner' && styles.roleButtonActive]}
                  onPress={() => setRole('owner')}
                >
                  <Text style={[styles.roleButtonText, role === 'owner' && styles.roleButtonTextActive]}>
                    Owner
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              fullWidth
            />

            <Button
              title="Already have an account?"
              variant="outline"
              onPress={() => navigation.goBack()}
              fullWidth
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
});
```

---

## 🎯 TEST YOUR WORK

### File 9: `App.tsx` (Replace your existing file)

```typescript
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from './src/store/authStore';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, loading, initialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Home">
            {() => (
              <View style={styles.homeContainer}>
                <Text style={styles.homeText}>
                  Welcome {user.display_name}!{'\n'}
                  Role: {user.role}
                </Text>
              </View>
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  homeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
  },
});
```

---

## ✅ RUN IT!

```bash
# Start your app
npx expo start

# Scan QR code with Expo Go on your phone
```

### Expected Result:
1. App opens to Login screen
2. Click "Create Account"
3. Fill in: Name, Email, Password, select role
4. Submit → Should show "Welcome [Your Name]!"

---

## 🐛 If Something Breaks

### Error: "Missing Supabase environment variables"
→ Check your `.env` file exists and has correct values

### Error: "Could not connect to Supabase"
→ Verify your Supabase URL and anon key are correct

### Error: "Policy violation" or "Permission denied"
→ Re-run the SQL script in Supabase (Step in Hour 1)

### App crashes on startup
→ Run `npx expo start -c` (clears cache)

---

## 🎉 CONGRATULATIONS!

If you got this far, you now have:
✅ Complete database with security
✅ Authentication working
✅ Clean code structure
✅ Basic UI components

**Next Step:** Tell me what you want to build next:
- Owner: Create barbershop feature?
- Barber: View agenda feature?
- Client: Search barbershops feature?

I'll give you the exact code for whichever you choose!
