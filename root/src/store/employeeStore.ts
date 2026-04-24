import { create } from 'zustand';
import { Employee, CreateEmployeeInput } from '../types/database.types';
import { employeeService } from '../services/supabase/employee.service';

interface EmployeeState {
  // State
  employees: Employee[];
  currentEmployee: Employee | null;
  loading: boolean;
  error: string | null;

  // Actions
  setEmployees: (employees: Employee[]) => void;
  setCurrentEmployee: (employee: Employee | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchEmployeesByBarbershop: (barbershopId: string) => Promise<void>;
  fetchEmployeeById: (id: string) => Promise<void>;
  createEmployee: (input: CreateEmployeeInput) => Promise<Employee>;
  inviteBarberByEmail: (barbershopId: string, email: string, displayName: string) => Promise<Employee>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  // Initial state
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,

  // Setters
  setEmployees: (employees) => set({ employees }),
  setCurrentEmployee: (employee) => set({ currentEmployee: employee }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch employees by barbershop
  fetchEmployeesByBarbershop: async (barbershopId: string) => {
    try {
      set({ loading: true, error: null });
      const employees = await employeeService.getEmployeesByBarbershop(barbershopId);
      set({ employees });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch employee by ID
  fetchEmployeeById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const employee = await employeeService.getEmployeeById(id);
      set({ currentEmployee: employee });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Create employee
  createEmployee: async (input: CreateEmployeeInput) => {
    try {
      set({ loading: true, error: null });
      const employee = await employeeService.createEmployee(input);
      set((state) => ({
        employees: [...state.employees, employee],
        currentEmployee: employee,
      }));
      return employee;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Invite barber by email
  inviteBarberByEmail: async (barbershopId: string, email: string, displayName: string) => {
    try {
      set({ loading: true, error: null });
      const employee = await employeeService.inviteBarberByEmail(barbershopId, email, displayName);
      set((state) => ({
        employees: [...state.employees, employee],
      }));
      return employee;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update employee
  updateEmployee: async (id: string, updates: Partial<Employee>) => {
    try {
      set({ loading: true, error: null });
      const updated = await employeeService.updateEmployee(id, updates);
      
      set((state) => ({
        employees: state.employees.map((e) => (e.id === id ? updated : e)),
        currentEmployee: state.currentEmployee?.id === id ? updated : state.currentEmployee,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Remove employee
  removeEmployee: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await employeeService.removeEmployee(id);
      
      set((state) => ({
        employees: state.employees.filter((e) => e.id !== id),
        currentEmployee: state.currentEmployee?.id === id ? null : state.currentEmployee,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
