import { supabase } from './client';
import { UserRole, User } from '../../types/database.types';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { buildSignUpInput, normalizeEmail } from './service.helpers';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const mapAuthError = (action: 'signup' | 'signin' | 'signout' | 'session' | 'profile'): string => {
  switch (action) {
    case 'signup':
      return 'Unable to create account. Please verify your data and try again.';
    case 'signin':
      return 'Invalid credentials. Please check email and password.';
    case 'signout':
      return 'Unable to sign out right now. Please try again.';
    case 'session':
      return 'Unable to validate current session.';
    case 'profile':
      return 'Unable to load your profile.';
    default:
      return 'Unexpected authentication error.';
  }
};

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, role: UserRole, displayName: string) {
    try {
      // Create auth user; public profile is created automatically by DB trigger.
      const { data: authData, error: authError } = await supabase.auth.signUp(
        buildSignUpInput(email, password, role, displayName)
      );

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      return authData;
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      throw new Error(getErrorMessage(error, mapAuthError('signup')));
    }
  },

  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign in');

      return data;
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      throw new Error(getErrorMessage(error, mapAuthError('signin')));
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      throw new Error(getErrorMessage(error, mapAuthError('signout')));
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error: unknown) {
      console.error('Get session error:', error);
      return null;
    }
  },

  /**
   * Get user profile from users table
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('User profile not found');

      return data;
    } catch (error: unknown) {
      console.error('Get user profile error:', error);
      throw new Error(getErrorMessage(error, mapAuthError('profile')));
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      console.error('Update profile error:', error);
      throw new Error(getErrorMessage(error, 'Unable to update profile.'));
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      throw new Error(getErrorMessage(error, 'Unable to reset password.'));
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      callback(event, session);
    });
  },
};
