import { create } from 'zustand';
import { Service, CreateServiceInput, UpdateServiceInput } from '../types/database.types';
import { serviceService } from '../services/supabase/service.service';

interface ServiceState {
  // State
  services: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;

  // Actions
  setServices: (services: Service[]) => void;
  setCurrentService: (service: Service | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchServicesByBarbershop: (barbershopId: string) => Promise<void>;
  fetchServiceById: (id: string) => Promise<void>;
  createService: (input: CreateServiceInput) => Promise<Service>;
  updateService: (id: string, updates: UpdateServiceInput) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  toggleServiceStatus: (id: string, isActive: boolean) => Promise<void>;
  clearError: () => void;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  // Initial state
  services: [],
  currentService: null,
  loading: false,
  error: null,

  // Setters
  setServices: (services) => set({ services }),
  setCurrentService: (service) => set({ currentService: service }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch services by barbershop
  fetchServicesByBarbershop: async (barbershopId: string) => {
    try {
      set({ loading: true, error: null });
      const services = await serviceService.getServicesByBarbershop(barbershopId);
      set({ services });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch service by ID
  fetchServiceById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const service = await serviceService.getServiceById(id);
      set({ currentService: service });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Create service
  createService: async (input: CreateServiceInput) => {
    try {
      set({ loading: true, error: null });
      const service = await serviceService.createService(input);
      set((state) => ({
        services: [...state.services, service],
        currentService: service,
      }));
      return service;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update service
  updateService: async (id: string, updates: UpdateServiceInput) => {
    try {
      set({ loading: true, error: null });
      const updated = await serviceService.updateService(id, updates);
      
      set((state) => ({
        services: state.services.map((s) => (s.id === id ? updated : s)),
        currentService: state.currentService?.id === id ? updated : state.currentService,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete service
  deleteService: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await serviceService.deleteService(id);
      
      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
        currentService: state.currentService?.id === id ? null : state.currentService,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Toggle service status
  toggleServiceStatus: async (id: string, isActive: boolean) => {
    try {
      set({ loading: true, error: null });
      const updated = await serviceService.toggleServiceStatus(id, isActive);
      
      set((state) => ({
        services: state.services.map((s) => (s.id === id ? updated : s)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
