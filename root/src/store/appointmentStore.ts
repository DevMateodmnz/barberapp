import { create } from 'zustand';
import {
  Appointment,
  AppointmentWithDetails,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  TimeSlot,
} from '../types/database.types';
import { appointmentService } from '../services/supabase/appointment.service';

interface AppointmentState {
  // State
  appointments: AppointmentWithDetails[];
  currentAppointment: AppointmentWithDetails | null;
  availableSlots: TimeSlot[];
  loading: boolean;
  error: string | null;

  // Actions
  setAppointments: (appointments: AppointmentWithDetails[]) => void;
  setCurrentAppointment: (appointment: AppointmentWithDetails | null) => void;
  setAvailableSlots: (slots: TimeSlot[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchAppointmentsByBarbershop: (barbershopId: string, startDate?: Date, endDate?: Date) => Promise<void>;
  fetchAppointmentsByEmployee: (employeeId: string, startDate?: Date, endDate?: Date) => Promise<void>;
  fetchAppointmentById: (id: string) => Promise<void>;
  fetchClientAppointments: (clientPhone: string) => Promise<void>;
  fetchAvailableSlots: (employeeId: string, serviceId: string, date: Date) => Promise<void>;
  
  createAppointment: (input: CreateAppointmentInput) => Promise<Appointment>;
  updateAppointment: (id: string, updates: UpdateAppointmentInput) => Promise<void>;
  confirmAppointment: (id: string) => Promise<void>;
  cancelAppointment: (id: string, canceledBy: 'owner' | 'client') => Promise<void>;
  completeAppointment: (id: string) => Promise<void>;
  markNoShow: (id: string) => Promise<void>;
  
  clearError: () => void;
  clearAppointments: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  // Initial state
  appointments: [],
  currentAppointment: null,
  availableSlots: [],
  loading: false,
  error: null,

  // Setters
  setAppointments: (appointments) => set({ appointments }),
  setCurrentAppointment: (appointment) => set({ currentAppointment: appointment }),
  setAvailableSlots: (slots) => set({ availableSlots: slots }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearAppointments: () => set({ appointments: [], currentAppointment: null }),

  // Fetch appointments by barbershop
  fetchAppointmentsByBarbershop: async (barbershopId: string, startDate?: Date, endDate?: Date) => {
    try {
      set({ loading: true, error: null });
      const appointments = await appointmentService.getAppointmentsByBarbershop(
        barbershopId,
        startDate,
        endDate
      );
      set({ appointments });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch appointments by employee
  fetchAppointmentsByEmployee: async (employeeId: string, startDate?: Date, endDate?: Date) => {
    try {
      set({ loading: true, error: null });
      const appointments = await appointmentService.getAppointmentsByEmployee(
        employeeId,
        startDate,
        endDate
      );
      set({ appointments });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch appointment by ID
  fetchAppointmentById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const appointment = await appointmentService.getAppointmentById(id);
      set({ currentAppointment: appointment });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch client appointments
  fetchClientAppointments: async (clientPhone: string) => {
    try {
      set({ loading: true, error: null });
      const appointments = await appointmentService.getClientAppointments(clientPhone);
      set({ appointments });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch available slots
  fetchAvailableSlots: async (employeeId: string, serviceId: string, date: Date) => {
    try {
      set({ loading: true, error: null });
      const slots = await appointmentService.getAvailableSlots(employeeId, serviceId, date);
      set({ availableSlots: slots });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Create appointment
  createAppointment: async (input: CreateAppointmentInput) => {
    try {
      set({ loading: true, error: null });
      const appointment = await appointmentService.createAppointment(input);
      
      // Refresh appointments list
      const { fetchAppointmentById } = get();
      await fetchAppointmentById(appointment.id);
      
      return appointment;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update appointment
  updateAppointment: async (id: string, updates: UpdateAppointmentInput) => {
    try {
      set({ loading: true, error: null });
      const updated = await appointmentService.updateAppointment(id, updates);
      
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? { ...a, ...updated } : a
        ),
        currentAppointment:
          state.currentAppointment?.id === id
            ? { ...state.currentAppointment, ...updated }
            : state.currentAppointment,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Confirm appointment
  confirmAppointment: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await appointmentService.confirmAppointment(id);
      
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? { ...a, status: 'confirmed' as const } : a
        ),
        currentAppointment:
          state.currentAppointment?.id === id
            ? { ...state.currentAppointment, status: 'confirmed' as const }
            : state.currentAppointment,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Cancel appointment
  cancelAppointment: async (id: string, canceledBy: 'owner' | 'client') => {
    try {
      set({ loading: true, error: null });
      await appointmentService.cancelAppointment(id, canceledBy);
      
      const status = canceledBy === 'owner' ? 'canceled_by_owner' : 'canceled_by_client';
      
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? { ...a, status } : a
        ),
        currentAppointment:
          state.currentAppointment?.id === id
            ? { ...state.currentAppointment, status }
            : state.currentAppointment,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Complete appointment
  completeAppointment: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await appointmentService.completeAppointment(id);
      
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? { ...a, status: 'completed' as const } : a
        ),
        currentAppointment:
          state.currentAppointment?.id === id
            ? { ...state.currentAppointment, status: 'completed' as const }
            : state.currentAppointment,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Mark as no-show
  markNoShow: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await appointmentService.markNoShow(id);
      
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? { ...a, status: 'no_show' as const } : a
        ),
        currentAppointment:
          state.currentAppointment?.id === id
            ? { ...state.currentAppointment, status: 'no_show' as const }
            : state.currentAppointment,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
