// ============================================
// DATABASE TYPES
// ============================================

export type UserRole = 'owner' | 'barber' | 'client';

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'completed' 
  | 'no_show' 
  | 'canceled_by_owner' 
  | 'canceled_by_client';

// ============================================
// BASE TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  display_name: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Barbershop {
  id: string;
  owner_id: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  description: string | null;
  avatar_url: string | null;
  opening_hours_json: OpeningHours;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface Employee {
  id: string;
  barbershop_id: string;
  user_id: string;
  display_name: string;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  barbershop_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  barbershop_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  barbershop_id: string;
  service_id: string;
  employee_id: string;
  client_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// EXTENDED TYPES (with relations)
// ============================================

export interface BarbershopWithOwner extends Barbershop {
  owner: User;
}

export interface EmployeeWithUser extends Employee {
  user: User;
}

export interface AppointmentWithDetails extends Appointment {
  service: Service;
  employee: Employee;
  client: Client;
  barbershop: Barbershop;
}

export interface AppointmentWithRelations extends Appointment {
  service?: Service;
  employee?: Employee;
  client?: Client;
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateBarbershopInput {
  name: string;
  city: string;
  address?: string;
  phone?: string;
  description?: string;
  opening_hours_json?: OpeningHours;
}

export interface UpdateBarbershopInput extends Partial<CreateBarbershopInput> {
  avatar_url?: string;
  is_active?: boolean;
}

export interface CreateServiceInput {
  barbershop_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_cents: number;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  is_active?: boolean;
}

export interface CreateEmployeeInput {
  barbershop_id: string;
  user_id: string;
  display_name: string;
}

export interface CreateClientInput {
  barbershop_id: string;
  user_id?: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {}

export interface CreateAppointmentInput {
  barbershop_id: string;
  service_id: string;
  employee_id: string;
  client_id: string;
  starts_at: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  status?: AppointmentStatus;
  starts_at?: string;
  notes?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

// ============================================
// NAVIGATION TYPES
// ============================================

export type RootStackParamList = {
  Auth: undefined;
  Owner: undefined;
  Barber: undefined;
  Client: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type OwnerStackParamList = {
  OwnerHome: undefined;
  CreateBarbershop: undefined;
  EditBarbershop: { barbershopId: string };
  BarbershopDetails: { barbershopId: string };
  Services: { barbershopId: string };
  CreateService: { barbershopId: string };
  EditService: { serviceId: string; barbershopId: string };
  Employees: { barbershopId: string };
  AddEmployee: { barbershopId: string };
  Clients: { barbershopId: string };
  CreateClient: { barbershopId: string };
  EditClient: { clientId: string; barbershopId: string };
  Agenda: { barbershopId: string };
  CreateAppointment: { barbershopId: string };
  AppointmentDetails: { appointmentId: string };
};

export type BarberStackParamList = {
  BarberHome: undefined;
  MyAgenda: undefined;
  AppointmentDetails: { appointmentId: string };
};

export type ClientStackParamList = {
  ClientHome: undefined;
  SearchBarbershops: undefined;
  BarbershopDetails: { barbershopId: string };
  BookAppointment: { barbershopId: string };
  MyAppointments: undefined;
  AppointmentDetails: { appointmentId: string };
};

// ============================================
// UTILITY TYPES
// ============================================

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

export interface AvailabilityCheck {
  isAvailable: boolean;
  conflictingAppointment?: Appointment;
}
