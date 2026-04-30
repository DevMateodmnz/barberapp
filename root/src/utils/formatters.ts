import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (dateString: string, formatStr = 'MMM d, yyyy'): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, formatStr);
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, 'MMM d, yyyy h:mm a');
};

export const formatTime = (dateString: string): string => {
  return formatDate(dateString, 'h:mm a');
};

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch {
    return 'Invalid date';
  }
};

export const formatPrice = (priceInCents: number): string => {
  return `$${(priceInCents / 100).toFixed(2)}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};