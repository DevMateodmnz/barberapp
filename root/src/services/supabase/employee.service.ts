import { supabase } from './client';
import { Employee, CreateEmployeeInput, Barbershop } from '../../types/database.types';

export const employeeService = {
  /**
   * Get all employees for a barbershop
   */
  async getEmployeesByBarbershop(barbershopId: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .eq('is_active', true)
        .order('display_name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get employees error:', error);
      throw new Error(error.message || 'Failed to fetch employees');
    }
  },

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Employee not found');
      return data;
    } catch (error: any) {
      console.error('Get employee error:', error);
      throw new Error(error.message || 'Failed to fetch employee');
    }
  },

  /**
   * Get employee for current user in a barbershop
   */
  async getMyEmployeeRecord(userId: string, barbershopId: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .eq('barbershop_id', barbershopId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Get my employee record error:', error);
      return null;
    }
  },

  /**
   * Get active barbershops where the user works as barber
   */
  async getBarbershopsByUser(userId: string): Promise<Barbershop[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('barbershop:barbershops(*)')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      if (!data) return [];

      return data
        .map((row: any) => {
          const relation = Array.isArray(row.barbershop) ? row.barbershop[0] : row.barbershop;
          return (relation ?? null) as Barbershop | null;
        })
        .filter((barbershop): barbershop is Barbershop => Boolean(barbershop));
    } catch (error: any) {
      console.error('Get barbershops by user error:', error);
      throw new Error(error.message || 'Failed to fetch barber barbershops');
    }
  },

  /**
   * Create new employee (link user to barbershop)
   */
  async createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create employee');
      return data;
    } catch (error: any) {
      console.error('Create employee error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        throw new Error('This user is already an employee at this barbershop');
      }
      
      throw new Error(error.message || 'Failed to create employee');
    }
  },

  /**
   * Create employee by email (invite barber)
   */
  async inviteBarberByEmail(barbershopId: string, email: string, displayName: string): Promise<Employee> {
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError || !userData) {
        throw new Error('User not found. They need to create an account first.');
      }

      if (userData.role !== 'barber') {
        throw new Error('This user is not registered as a barber');
      }

      // Create employee record
      return await this.createEmployee({
        barbershop_id: barbershopId,
        user_id: userData.id,
        display_name: displayName || email,
      });
    } catch (error: any) {
      console.error('Invite barber error:', error);
      throw error;
    }
  },

  /**
   * Update employee
   */
  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update employee');
      return data;
    } catch (error: any) {
      console.error('Update employee error:', error);
      throw new Error(error.message || 'Failed to update employee');
    }
  },

  /**
   * Remove employee (soft delete)
   */
  async removeEmployee(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Remove employee error:', error);
      throw new Error(error.message || 'Failed to remove employee');
    }
  },

  /**
   * Hard delete employee
   */
  async deleteEmployee(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete employee error:', error);
      throw new Error(error.message || 'Failed to delete employee');
    }
  },
};
