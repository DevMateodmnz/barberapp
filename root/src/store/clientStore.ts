import { create } from 'zustand';
import { Client, CreateClientInput, UpdateClientInput } from '../types/database.types';
import { clientService } from '../services/supabase/client.service';

interface ClientState {
  // State
  clients: Client[];
  currentClient: Client | null;
  loading: boolean;
  error: string | null;

  // Actions
  setClients: (clients: Client[]) => void;
  setCurrentClient: (client: Client | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchClientsByBarbershop: (barbershopId: string) => Promise<void>;
  fetchClientById: (id: string) => Promise<void>;
  searchClients: (barbershopId: string, query: string) => Promise<void>;
  createClient: (input: CreateClientInput) => Promise<Client>;
  findOrCreateClient: (barbershopId: string, input: CreateClientInput) => Promise<Client>;
  updateClient: (id: string, updates: UpdateClientInput) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  // Initial state
  clients: [],
  currentClient: null,
  loading: false,
  error: null,

  // Setters
  setClients: (clients) => set({ clients }),
  setCurrentClient: (client) => set({ currentClient: client }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch clients by barbershop
  fetchClientsByBarbershop: async (barbershopId: string) => {
    try {
      set({ loading: true, error: null });
      const clients = await clientService.getClientsByBarbershop(barbershopId);
      set({ clients });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch client by ID
  fetchClientById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const client = await clientService.getClientById(id);
      set({ currentClient: client });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Search clients
  searchClients: async (barbershopId: string, query: string) => {
    try {
      set({ loading: true, error: null });
      const clients = await clientService.searchClients(barbershopId, query);
      set({ clients });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Create client
  createClient: async (input: CreateClientInput) => {
    try {
      set({ loading: true, error: null });
      const client = await clientService.createClient(input);
      set((state) => ({
        clients: [...state.clients, client],
        currentClient: client,
      }));
      return client;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Find or create client
  findOrCreateClient: async (barbershopId: string, input: CreateClientInput) => {
    try {
      set({ loading: true, error: null });
      const client = await clientService.findOrCreateClient(barbershopId, input);
      
      // Add to list if new
      set((state) => {
        const exists = state.clients.some(c => c.id === client.id);
        return {
          clients: exists ? state.clients : [...state.clients, client],
          currentClient: client,
        };
      });
      
      return client;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update client
  updateClient: async (id: string, updates: UpdateClientInput) => {
    try {
      set({ loading: true, error: null });
      const updated = await clientService.updateClient(id, updates);
      
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? updated : c)),
        currentClient: state.currentClient?.id === id ? updated : state.currentClient,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete client
  deleteClient: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await clientService.deleteClient(id);
      
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        currentClient: state.currentClient?.id === id ? null : state.currentClient,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
