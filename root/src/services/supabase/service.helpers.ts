import { UserRole } from '../../types/database.types';

export interface SignUpInput {
  email: string;
  password: string;
  options: {
    data: {
      role: UserRole;
      display_name: string;
    };
  };
}

export const INVITE_GENERIC_ERROR = 'Unable to invite barber with the provided email.';

export const normalizeEmail = (email: string): string => email.toLowerCase().trim();

export const normalizeDisplayName = (displayName: string): string => displayName.trim();

export const buildSignUpInput = (
  email: string,
  password: string,
  role: UserRole,
  displayName: string
): SignUpInput => ({
  email: normalizeEmail(email),
  password,
  options: {
    data: {
      role,
      display_name: normalizeDisplayName(displayName),
    },
  },
});

export const buildClientSearchPattern = (query: string): string | null => {
  const sanitized = query.trim().replace(/[%_]/g, '');
  if (!sanitized) return null;
  return `%${sanitized}%`;
};

export const mergeUniqueById = <T extends { id: string }>(items: T[]): T[] => {
  const uniqueById = new Map<string, T>();

  for (const item of items) {
    uniqueById.set(item.id, item);
  }

  return Array.from(uniqueById.values());
};

export const parseDateOrThrow = (value: string, errorMessage: string): Date => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(errorMessage);
  return parsed;
};

export const resolveInviteErrorMessage = (error: unknown): string => {
  if (
    error instanceof Error &&
    error.message === 'This user is already an employee at this barbershop'
  ) {
    return error.message;
  }

  return INVITE_GENERIC_ERROR;
};
