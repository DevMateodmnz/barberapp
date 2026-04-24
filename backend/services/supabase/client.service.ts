import { supabase } from './client';
import { Client, CreateClientInput, UpdateClientInput } from '../../types/database.types';
import { buildClientSearchPattern, mergeUniqueById } from './service.helpers';

export const clientService = {
  /**
   * Get all clients for a barbershop
   */
  async getClientsByBarbershop(barbershopId: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get clients error:', error);
      throw new Error(error.message || 'Failed to fetch clients');
    }
  },

  /**
   * Search clients by name or phone
   */
  async searchClients(barbershopId: string, query: string): Promise<Client[]> {
    try {
      const pattern = buildClientSearchPattern(query);
      if (!pattern) return [];

      const [byNameResult, byPhoneResult] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .eq('barbershop_id', barbershopId)
          .ilike('name', pattern)
          .order('name')
          .limit(20),
        supabase
          .from('clients')
          .select('*')
          .eq('barbershop_id', barbershopId)
          .ilike('phone', pattern)
          .order('name')
          .limit(20),
      ]);

      if (byNameResult.error) throw byNameResult.error;
      if (byPhoneResult.error) throw byPhoneResult.error;

      const merged = [...(byNameResult.data || []), ...(byPhoneResult.data || [])];
      return mergeUniqueById(merged).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error: any) {
      console.error('Search clients error:', error);
      throw new Error(error.message || 'Failed to search clients');
    }
  },

  /**
   * Get client by ID
   */
  async getClientById(id: string): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Client not found');
      return data;
    } catch (error: any) {
      console.error('Get client error:', error);
      throw new Error(error.message || 'Failed to fetch client');
    }
  },

  /**
   * Find client by phone in barbershop
   */
  async findByPhone(barbershopId: string, phone: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .eq('phone', phone)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Find client by phone error:', error);
      return null;
    }
  },

  /**
   * Create new client
   */
  async createClient(input: CreateClientInput): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create client');
      return data;
    } catch (error: any) {
      console.error('Create client error:', error);
      throw new Error(error.message || 'Failed to create client');
    }
  },

  /**
   * Find or create client
   */
  async findOrCreateClient(barbershopId: string, input: CreateClientInput): Promise<Client> {
    try {
      // Try to find existing client by phone
      if (input.phone) {
        const existing = await this.findByPhone(barbershopId, input.phone);
        if (existing) return existing;
      }

      // Create new client
      return await this.createClient(input);
    } catch (error: any) {
      console.error('Find or create client error:', error);
      throw error;
    }
  },

  /**
   * Update client
   */
  async updateClient(id: string, updates: UpdateClientInput): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update client');
      return data;
    } catch (error: any) {
      console.error('Update client error:', error);
      throw new Error(error.message || 'Failed to update client');
    }
  },

  /**
   * Delete client
   */
  async deleteClient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete client error:', error);
      throw new Error(error.message || 'Failed to delete client');
    }
  },

  /**
   * Get client statistics
   */
  async getClientStats(clientId: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    canceledAppointments: number;
    noShowAppointments: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('status')
        .eq('client_id', clientId);

      if (error) throw error;

      const stats = {
        totalAppointments: data.length,
        completedAppointments: data.filter(a => a.status === 'completed').length,
        canceledAppointments: data.filter(a => 
          a.status === 'canceled_by_owner' || a.status === 'canceled_by_client'
        ).length,
        noShowAppointments: data.filter(a => a.status === 'no_show').length,
      };

      return stats;
    } catch (error: any) {
      console.error('Get client stats error:', error);
      throw new Error(error.message || 'Failed to fetch client statistics');
    }
  },
};
