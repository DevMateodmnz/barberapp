import { supabase } from './client';
import {
  Barbershop,
  CreateBarbershopInput,
  UpdateBarbershopInput,
  BarbershopWithOwner,
} from '../../types/database.types';

export const barbershopService = {
  /**
   * Get all active barbershops
   */
  async getAllBarbershops(): Promise<Barbershop[]> {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get all barbershops error:', error);
      throw new Error(error.message || 'Failed to fetch barbershops');
    }
  },

  /**
   * Search barbershops by city
   */
  async searchByCity(city: string): Promise<Barbershop[]> {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('is_active', true)
        .ilike('city', `%${city}%`)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Search barbershops error:', error);
      throw new Error(error.message || 'Failed to search barbershops');
    }
  },

  /**
   * Get barbershop by ID
   */
  async getBarbershopById(id: string): Promise<Barbershop> {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Barbershop not found');
      return data;
    } catch (error: any) {
      console.error('Get barbershop error:', error);
      throw new Error(error.message || 'Failed to fetch barbershop');
    }
  },

  /**
   * Get barbershops owned by user
   */
  async getMyBarbershops(ownerId: string): Promise<Barbershop[]> {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get my barbershops error:', error);
      throw new Error(error.message || 'Failed to fetch your barbershops');
    }
  },

  /**
   * Create new barbershop
   */
  async createBarbershop(ownerId: string, input: CreateBarbershopInput): Promise<Barbershop> {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .insert({
          owner_id: ownerId,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create barbershop');
      return data;
    } catch (error: any) {
      console.error('Create barbershop error:', error);
      throw new Error(error.message || 'Failed to create barbershop');
    }
  },

  /**
   * Update barbershop
   */
  async updateBarbershop(id: string, updates: UpdateBarbershopInput): Promise<Barbershop> {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update barbershop');
      return data;
    } catch (error: any) {
      console.error('Update barbershop error:', error);
      throw new Error(error.message || 'Failed to update barbershop');
    }
  },

  /**
   * Delete barbershop (soft delete by setting is_active = false)
   */
  async deleteBarbershop(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('barbershops')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete barbershop error:', error);
      throw new Error(error.message || 'Failed to delete barbershop');
    }
  },

  /**
   * Upload barbershop avatar
   */
  async uploadAvatar(barbershopId: string, file: { uri: string; type: string; name: string }): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${barbershopId}/${Date.now()}.${fileExt}`;

      // Read file as blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      throw new Error(error.message || 'Failed to upload avatar');
    }
  },
};
