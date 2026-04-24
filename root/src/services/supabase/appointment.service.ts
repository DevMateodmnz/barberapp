import { supabase } from './client';
import {
  Appointment,
  AppointmentWithDetails,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  TimeSlot,
} from '../../types/database.types';
import { format, addMinutes, startOfDay, endOfDay, isAfter } from 'date-fns';

export const appointmentService = {
  /**
   * Get appointments by barbershop
   */
  async getAppointmentsByBarbershop(
    barbershopId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AppointmentWithDetails[]> {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          service:services(*),
          employee:employees(*),
          client:clients(*)
        `)
        .eq('barbershop_id', barbershopId)
        .order('starts_at', { ascending: true });

      if (startDate) {
        query = query.gte('starts_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('starts_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get appointments error:', error);
      throw new Error(error.message || 'Failed to fetch appointments');
    }
  },

  /**
   * Get appointments by employee
   */
  async getAppointmentsByEmployee(
    employeeId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AppointmentWithDetails[]> {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          service:services(*),
          employee:employees(*),
          client:clients(*)
        `)
        .eq('employee_id', employeeId)
        .order('starts_at', { ascending: true });

      if (startDate) {
        query = query.gte('starts_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('starts_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get employee appointments error:', error);
      throw new Error(error.message || 'Failed to fetch appointments');
    }
  },

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id: string): Promise<AppointmentWithDetails> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(*),
          employee:employees(*),
          client:clients(*),
          barbershop:barbershops(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Appointment not found');
      return data;
    } catch (error: any) {
      console.error('Get appointment error:', error);
      throw new Error(error.message || 'Failed to fetch appointment');
    }
  },

  /**
   * Create new appointment
   */
  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    try {
      // Get service to calculate end time
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', input.service_id)
        .single();

      if (serviceError) throw serviceError;
      if (!service) throw new Error('Service not found');

      // Calculate end time
      const startsAt = new Date(input.starts_at);
      const endsAt = addMinutes(startsAt, service.duration_minutes);

      // Check availability
      const isAvailable = await this.checkAvailability(
        input.employee_id,
        startsAt,
        endsAt
      );

      if (!isAvailable) {
        throw new Error('This time slot is not available');
      }

      // Create appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...input,
          ends_at: endsAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create appointment');
      return data;
    } catch (error: any) {
      console.error('Create appointment error:', error);
      throw error;
    }
  },

  /**
   * Update appointment
   */
  async updateAppointment(id: string, updates: UpdateAppointmentInput): Promise<Appointment> {
    try {
      // If updating time, recalculate end time
      if (updates.starts_at) {
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .select('service_id, employee_id')
          .eq('id', id)
          .single();

        if (appointmentError) throw appointmentError;
        if (!appointment) throw new Error('Appointment not found');

        const { data: service, error: serviceError } = await supabase
          .from('services')
          .select('duration_minutes')
          .eq('id', appointment.service_id)
          .single();

        if (serviceError) throw serviceError;
        if (!service) throw new Error('Service not found');

        const startsAt = new Date(updates.starts_at);
        const endsAt = addMinutes(startsAt, service.duration_minutes);

        // Check availability (exclude current appointment)
        const isAvailable = await this.checkAvailability(
          appointment.employee_id,
          startsAt,
          endsAt,
          id
        );

        if (!isAvailable) {
          throw new Error('This time slot is not available');
        }

        updates = {
          ...updates,
          ends_at: endsAt.toISOString(),
        } as any;
      }

      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update appointment');
      return data;
    } catch (error: any) {
      console.error('Update appointment error:', error);
      throw error;
    }
  },

  /**
   * Update appointment status
   */
  async updateStatus(id: string, status: string): Promise<Appointment> {
    return this.updateAppointment(id, { status } as any);
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: string, canceledBy: 'owner' | 'client'): Promise<Appointment> {
    const status = canceledBy === 'owner' ? 'canceled_by_owner' : 'canceled_by_client';
    return this.updateStatus(id, status);
  },

  /**
   * Confirm appointment
   */
  async confirmAppointment(id: string): Promise<Appointment> {
    return this.updateStatus(id, 'confirmed');
  },

  /**
   * Mark as completed
   */
  async completeAppointment(id: string): Promise<Appointment> {
    return this.updateStatus(id, 'completed');
  },

  /**
   * Mark as no-show
   */
  async markNoShow(id: string): Promise<Appointment> {
    return this.updateStatus(id, 'no_show');
  },

  /**
   * Check if time slot is available
   */
  async checkAvailability(
    employeeId: string,
    startsAt: Date,
    endsAt: Date,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('appointments')
        .select('id')
        .eq('employee_id', employeeId)
        .in('status', ['pending', 'confirmed'])
        .or(`and(starts_at.lte.${startsAt.toISOString()},ends_at.gt.${startsAt.toISOString()}),and(starts_at.lt.${endsAt.toISOString()},ends_at.gte.${endsAt.toISOString()}),and(starts_at.gte.${startsAt.toISOString()},ends_at.lte.${endsAt.toISOString()})`);

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return !data || data.length === 0;
    } catch (error: any) {
      console.error('Check availability error:', error);
      return false;
    }
  },

  /**
   * Get available time slots for a day
   */
  async getAvailableSlots(
    employeeId: string,
    serviceId: string,
    date: Date
  ): Promise<TimeSlot[]> {
    try {
      // Get service duration
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;
      if (!service) throw new Error('Service not found');

      // Get all appointments for this employee on this day
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('starts_at, ends_at')
        .eq('employee_id', employeeId)
        .in('status', ['pending', 'confirmed'])
        .gte('starts_at', dayStart.toISOString())
        .lte('starts_at', dayEnd.toISOString());

      if (appointmentsError) throw appointmentsError;

      // Generate time slots (e.g., from 9 AM to 6 PM, every 30 minutes)
      const slots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 18;
      const slotInterval = 30; // minutes

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, minute, 0, 0);

          const slotEnd = addMinutes(slotTime, service.duration_minutes);

          // Check if this slot conflicts with any existing appointment
          const hasConflict = appointments?.some(apt => {
            const aptStart = new Date(apt.starts_at);
            const aptEnd = new Date(apt.ends_at);
            
            return (
              (slotTime >= aptStart && slotTime < aptEnd) ||
              (slotEnd > aptStart && slotEnd <= aptEnd) ||
              (slotTime <= aptStart && slotEnd >= aptEnd)
            );
          });

          // Only add slots in the future
          const now = new Date();
          const isFutureSlot = isAfter(slotTime, now);

          slots.push({
            time: format(slotTime, 'HH:mm'),
            available: !hasConflict && isFutureSlot,
          });
        }
      }

      return slots;
    } catch (error: any) {
      console.error('Get available slots error:', error);
      throw new Error(error.message || 'Failed to fetch available slots');
    }
  },

  /**
   * Get upcoming appointments for a client
   */
  async getClientAppointments(clientUserId: string): Promise<AppointmentWithDetails[]> {
    try {
      // Find client records linked to this authenticated user
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', clientUserId);

      if (clientError) throw clientError;
      if (!clients || clients.length === 0) return [];

      const clientIds = clients.map(c => c.id);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(*),
          employee:employees(*),
          client:clients(*),
          barbershop:barbershops(*)
        `)
        .in('client_id', clientIds)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get client appointments error:', error);
      throw new Error(error.message || 'Failed to fetch client appointments');
    }
  },

  /**
   * Delete appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete appointment error:', error);
      throw new Error(error.message || 'Failed to delete appointment');
    }
  },
};
