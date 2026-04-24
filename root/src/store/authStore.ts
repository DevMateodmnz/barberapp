import { create } from 'zustand';
import { User, UserRole } from '../types/database.types';
import { authService } from '../services/supabase/auth.service';

interface AuthState {
  // State
  user: User | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  loading: true,
  initialized: false,
  error: null,

  // Setters
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Sign in
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { session, user: authUser } = await authService.signIn(email, password);
      
      if (authUser) {
        const profile = await authService.getUserProfile(authUser.id);
        set({ user: profile, session, error: null });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  // Sign up
  signUp: async (email: string, password: string, role: UserRole, displayName: string) => {
    try {
      set({ loading: true, error: null });
      
      await authService.signUp(email, password, role, displayName);
      
      // After signup, automatically sign in
      await get().signIn(email, password);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign up';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await authService.signOut();
      set({ user: null, session: null });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign out';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  // Update profile
  updateProfile: async (updates: Partial<User>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      set({ loading: true, error: null });
      
      const updatedUser = await authService.updateProfile(user.id, updates);
      set({ user: updatedUser });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  // Initialize auth state
  initialize: async () => {
    try {
      set({ loading: true });
      
      // Get current session
      const session = await authService.getSession();
      
      if (session?.user) {
        try {
          const profile = await authService.getUserProfile(session.user.id);
          set({ user: profile, session });
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Session exists but profile doesn't - clear session
          await authService.signOut();
          set({ user: null, session: null });
        }
      }

      // Listen to auth state changes
      authService.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_OUT') {
          set({ user: null, session: null });
        } else if (session?.user) {
          try {
            const profile = await authService.getUserProfile(session.user.id);
            set({ user: profile, session });
          } catch (error) {
            console.error('Failed to load user profile on auth change:', error);
          }
        } else {
          set({ user: null, session: null });
        }
      });

      set({ initialized: true });
    } catch (error: any) {
      console.error('Initialize error:', error);
      set({ initialized: true, error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
