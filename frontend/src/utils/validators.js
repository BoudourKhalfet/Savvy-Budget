// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (at least 8 characters)
export const isValidPassword = (password) => {
  return password.length >= 8;
};

// Number validation
export const isValidNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Positive number validation
export const isPositiveNumber = (value) => {
  return isValidNumber(value) && parseFloat(value) > 0;
};

// Required field validation
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Date validation
export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};