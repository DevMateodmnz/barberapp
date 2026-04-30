export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
  CANCELED_BY_OWNER: 'canceled_by_owner',
  CANCELED_BY_CLIENT: 'canceled_by_client',
} as const;

export const USER_ROLES = {
  OWNER: 'owner',
  BARBER: 'barber',
  CLIENT: 'client',
} as const;

export const SERVICE_ICONS = {
  haircut: '💇',
  shave: '🪒',
  styling: '✨',
  coloring: '🎨',
  treatment: '🧴',
  trim: '✂️',
} as const;

export const TIME_SLOTS = {
  START_HOUR: 9,
  END_HOUR: 18,
  INTERVAL_MINUTES: 30,
} as const;

export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#6366f1',
  light: '#f1f5f9',
  dark: '#0f172a',
  muted: '#94a3b8',
  border: '#e2e8f0',
  card: '#ffffff',
  text: '#334155',
  textLight: '#64748b',
} as const;

export const STORAGE_KEYS = {
  AUTH_SESSION: 'auth_session',
  USER_PREFERENCES: 'user_preferences',
  LAST_BARBERSHOP: 'last_barbershop_id',
} as const;

export const API_TIMEOUT_MS = 30000;

export const DEBOUNCE_DELAY_MS = 500;

export const REFRESH_INTERVAL_MS = 60000;