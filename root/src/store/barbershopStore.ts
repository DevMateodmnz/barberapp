import { create } from 'zustand';
import { Barbershop, CreateBarbershopInput, UpdateBarbershopInput } from '../types/database.types';
import { barbershopService } from '../services/supabase/barbershop.service';

interface BarbershopState {
  // State
  barbershops: Barbershop[];
  currentBarbershop: Barbershop | null;
  loading: boolean;
  error: string | null;

  // Actions
  setBarbershops: (barbershops: Barbershop[]) => void;
  setCurrentBarbershop: (barbershop: Barbershop | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchAllBarbershops: () => Promise<void>;
  fetchMyBarbershops: (ownerId: string) => Promise<void>;
  fetchBarbershopById: (id: string) => Promise<void>;
  searchByCity: (city: string) => Promise<void>;
  createBarbershop: (ownerId: string, input: CreateBarbershopInput) => Promise<Barbershop>;
  updateBarbershop: (id: string, updates: UpdateBarbershopInput) => Promise<void>;
  deleteBarbershop: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useBarbershopStore = create<BarbershopState>((set, get) => ({
  // Initial state
  barbershops: [],
  currentBarbershop: null,
  loading: false,
  error: null,

  // Setters
  setBarbershops: (barbershops) => set({ barbershops }),
  setCurrentBarbershop: (barbershop) => set({ currentBarbershop: barbershop }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all barbershops
  fetchAllBarbershops: async () => {
    try {
      set({ loading: true, error: null });
      const barbershops = await barbershopService.getAllBarbershops();
      set({ barbershops });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch my barbershops
  fetchMyBarbershops: async (ownerId: string) => {
    try {
      set({ loading: true, error: null });
      const barbershops = await barbershopService.getMyBarbershops(ownerId);
      set({ barbershops });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch barbershop by ID
  fetchBarbershopById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const barbershop = await barbershopService.getBarbershopById(id);
      set({ currentBarbershop: barbershop });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Search by city
  searchByCity: async (city: string) => {
    try {
      set({ loading: true, error: null });
      const barbershops = await barbershopService.searchByCity(city);
      set({ barbershops });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Create barbershop
  createBarbershop: async (ownerId: string, input: CreateBarbershopInput) => {
    try {
      set({ loading: true, error: null });
      const barbershop = await barbershopService.createBarbershop(ownerId, input);
      set((state) => ({
        barbershops: [barbershop, ...state.barbershops],
        currentBarbershop: barbershop,
      }));
      return barbershop;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update barbershop
  updateBarbershop: async (id: string, updates: UpdateBarbershopInput) => {
    try {
      set({ loading: true, error: null });
      const updated = await barbershopService.updateBarbershop(id, updates);
      
      set((state) => ({
        barbershops: state.barbershops.map((b) => (b.id === id ? updated : b)),
        currentBarbershop: state.currentBarbershop?.id === id ? updated : state.currentBarbershop,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete barbershop
  deleteBarbershop: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await barbershopService.deleteBarbershop(id);
      
      set((state) => ({
        barbershops: state.barbershops.filter((b) => b.id !== id),
        currentBarbershop: state.currentBarbershop?.id === id ? null : state.currentBarbershop,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
