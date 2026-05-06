/**
 * Validaciones para formularios de autenticación
 * Espejo de las reglas del backend para consistencia
 */

const VALIDATION_RULES = {
  email: {
    pattern: /^\S+@\S+\.\S+$/,
    minLength: 3,
    maxLength: 254,
    message: 'Ingresa un correo válido (ej: usuario@ejemplo.com)',
  },
  password: {
    minLength: 8,
    maxLength: 128,
    requiresUppercase: true,
    requiresLowercase: true,
    requiresNumber: true,
    requiresSpecial: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  },
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    message: 'Solo se permiten letras y espacios',
  },
  businessName: {
    minLength: 2,
    maxLength: 100,
    message: 'El nombre debe tener entre 2 y 100 caracteres',
  },
  phone: {
    pattern: /^\+?[0-9\s\-\(\)]{7,20}$/,
    message: 'Ingresa un número telefónico válido',
  },
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, error: 'El correo es obligatorio' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length < VALIDATION_RULES.email.minLength) {
    return {
      valid: false,
      error: `El correo debe tener al menos ${VALIDATION_RULES.email.minLength} caracteres`,
    };
  }

  if (trimmed.length > VALIDATION_RULES.email.maxLength) {
    return {
      valid: false,
      error: `El correo no puede exceder ${VALIDATION_RULES.email.maxLength} caracteres`,
    };
  }

  if (!VALIDATION_RULES.email.pattern.test(trimmed)) {
    return { valid: false, error: VALIDATION_RULES.email.message };
  }

  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'La contraseña es obligatoria' };
  }

  if (password.length < VALIDATION_RULES.password.minLength) {
    return {
      valid: false,
      error: `La contraseña debe tener al menos ${VALIDATION_RULES.password.minLength} caracteres`,
    };
  }

  if (password.length > VALIDATION_RULES.password.maxLength) {
    return {
      valid: false,
      error: `La contraseña no puede exceder ${VALIDATION_RULES.password.maxLength} caracteres`,
    };
  }

  if (VALIDATION_RULES.password.requiresUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: 'La contraseña debe contener al menos una mayúscula (A-Z)',
    };
  }

  if (VALIDATION_RULES.password.requiresLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      error: 'La contraseña debe contener al menos una minúscula (a-z)',
    };
  }

  if (VALIDATION_RULES.password.requiresNumber && !/[0-9]/.test(password)) {
    return {
      valid: false,
      error: 'La contraseña debe contener al menos un número (0-9)',
    };
  }

  if (VALIDATION_RULES.password.requiresSpecial) {
    const specialPattern = new RegExp(`[${VALIDATION_RULES.password.specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
    if (!specialPattern.test(password)) {
      return {
        valid: false,
        error: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...)',
      };
    }
  }

  return { valid: true };
};

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, error: 'El nombre es obligatorio' };
  }

  const trimmed = name.trim();

  if (trimmed.length < VALIDATION_RULES.name.minLength) {
    return {
      valid: false,
      error: `El nombre debe tener al menos ${VALIDATION_RULES.name.minLength} caracteres`,
    };
  }

  if (trimmed.length > VALIDATION_RULES.name.maxLength) {
    return {
      valid: false,
      error: `El nombre no puede exceder ${VALIDATION_RULES.name.maxLength} caracteres`,
    };
  }

  if (!VALIDATION_RULES.name.pattern.test(trimmed)) {
    return { valid: false, error: VALIDATION_RULES.name.message };
  }

  return { valid: true };
};

export const validateBusinessName = (businessName) => {
  if (!businessName || !businessName.trim()) {
    return { valid: false, error: 'El nombre del negocio es obligatorio' };
  }

  const trimmed = businessName.trim();

  if (trimmed.length < VALIDATION_RULES.businessName.minLength) {
    return {
      valid: false,
      error: `El nombre del negocio debe tener al menos ${VALIDATION_RULES.businessName.minLength} caracteres`,
    };
  }

  if (trimmed.length > VALIDATION_RULES.businessName.maxLength) {
    return {
      valid: false,
      error: `El nombre del negocio no puede exceder ${VALIDATION_RULES.businessName.maxLength} caracteres`,
    };
  }

  return { valid: true };
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { valid: true }; // Teléfono es opcional
  }

  const trimmed = phone.trim();

  if (!VALIDATION_RULES.phone.pattern.test(trimmed)) {
    return { valid: false, error: VALIDATION_RULES.phone.message };
  }

  return { valid: true };
};

export const getPasswordStrength = (password) => {
  if (!password) return { level: 'débil', percentage: 0 };

  let strength = 0;

  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) strength += 20;

  let level = 'débil';
  if (strength >= 70) level = 'fuerte';
  else if (strength >= 50) level = 'medio';

  return { level, percentage: Math.min(strength, 100) };
};
