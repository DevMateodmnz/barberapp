export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, min: number): boolean => {
  return value.trim().length >= min;
};

export const validateMaxLength = (value: string, max: number): boolean => {
  return value.trim().length <= max;
};

export const validatePositiveNumber = (value: string): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const validateNonNegativeNumber = (value: string): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const validateFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date > new Date();
};

export const validateTime = (timeString: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const createValidator = <T extends Record<string, string>>(
  data: T,
  rules: Partial<Record<keyof T, (value: string) => boolean | string>>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field as keyof T] || '';
    const result = rule!(value);

    if (result === false) {
      errors[field] = `Invalid ${field}`;
    } else if (typeof result === 'string') {
      errors[field] = result;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};