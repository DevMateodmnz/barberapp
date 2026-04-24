import { supabase } from './client';
import { Service, CreateServiceInput, UpdateServiceInput } from '../../types/database.types';

export const serviceService = {
  /**
   * Get all services for a barbershop
   */
  async getServicesByBarbershop(barbershopId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get services error:', error);
      throw new Error(error.message || 'Failed to fetch services');
    }
  },

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Service not found');
      return data;
    } catch (error: any) {
      console.error('Get service error:', error);
      throw new Error(error.message || 'Failed to fetch service');
    }
  },

  /**
   * Create new service
   */
  async createService(input: CreateServiceInput): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create service');
      return data;
    } catch (error: any) {
      console.error('Create service error:', error);
      throw new Error(error.message || 'Failed to create service');
    }
  },

  /**
   * Update service
   */
  async updateService(id: string, updates: UpdateServiceInput): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update service');
      return data;
    } catch (error: any) {
      console.error('Update service error:', error);
      throw new Error(error.message || 'Failed to update service');
    }
  },

  /**
   * Delete service (soft delete)
   */
  async deleteService(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete service error:', error);
      throw new Error(error.message || 'Failed to delete service');
    }
  },

  /**
   * Toggle service active status
   */
  async toggleServiceStatus(id: string, isActive: boolean): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to toggle service status');
      return data;
    } catch (error: any) {
      console.error('Toggle service status error:', error);
      throw new Error(error.message || 'Failed to toggle service status');
    }
  },
};
