/**
 * Pruebas unitarias (internas) — Frontend / Validaciones de formularios.
 *
 * Cada prueba verifica UNA función pura de validation.js de forma AISLADA: se le
 * pasa una entrada concreta y se comprueba el objeto de salida exacto. No hay
 * red, ni estado, ni interfaz de usuario.
 *
 * Software: Jest
 * Ejecutar:  npm test
 */
import {
  validateEmail,
  validatePassword,
  validateName,
  validateBusinessName,
  validatePhone,
  getPasswordStrength,
} from './validation';

// ── PU-01: Validación de correo electrónico (validateEmail) ──
describe('PU-01 · validateEmail', () => {
  it('PU-01-01 correo válido → { valid: true }', () => {
    expect(validateEmail('usuario@ejemplo.com')).toEqual({ valid: true });
  });

  it('PU-01-02 correo vacío → obligatorio', () => {
    expect(validateEmail('')).toEqual({ valid: false, error: 'El correo es obligatorio' });
  });

  it('PU-01-03 solo espacios → obligatorio', () => {
    expect(validateEmail('   ')).toEqual({ valid: false, error: 'El correo es obligatorio' });
  });

  it('PU-01-04 muy corto ("a@") → mínimo 3 caracteres', () => {
    expect(validateEmail('a@')).toEqual({
      valid: false,
      error: 'El correo debe tener al menos 3 caracteres',
    });
  });

  it('PU-01-05 sin "@" → formato inválido', () => {
    expect(validateEmail('correosinarroba.com')).toEqual({
      valid: false,
      error: 'Ingresa un correo válido (ej: usuario@ejemplo.com)',
    });
  });
});

// ── PU-02: Validación de contraseña (validatePassword) ──
describe('PU-02 · validatePassword', () => {
  it('PU-02-01 contraseña válida → { valid: true }', () => {
    expect(validatePassword('1234567Ab*')).toEqual({ valid: true });
  });

  it('PU-02-02 vacía → obligatoria', () => {
    expect(validatePassword('')).toEqual({ valid: false, error: 'La contraseña es obligatoria' });
  });

  it('PU-02-03 corta ("Ab1*") → mínimo 8 caracteres', () => {
    expect(validatePassword('Ab1*')).toEqual({
      valid: false,
      error: 'La contraseña debe tener al menos 8 caracteres',
    });
  });

  it('PU-02-04 sin mayúscula → requiere mayúscula', () => {
    expect(validatePassword('password1*')).toEqual({
      valid: false,
      error: 'La contraseña debe contener al menos una mayúscula (A-Z)',
    });
  });

  it('PU-02-05 sin minúscula → requiere minúscula', () => {
    expect(validatePassword('PASSWORD1*')).toEqual({
      valid: false,
      error: 'La contraseña debe contener al menos una minúscula (a-z)',
    });
  });

  it('PU-02-06 sin número → requiere número', () => {
    expect(validatePassword('Password*')).toEqual({
      valid: false,
      error: 'La contraseña debe contener al menos un número (0-9)',
    });
  });

  it('PU-02-07 sin carácter especial → requiere especial', () => {
    expect(validatePassword('Password1')).toEqual({
      valid: false,
      error: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...)',
    });
  });
});

// ── PU-03: Validación de nombre de persona (validateName) ──
describe('PU-03 · validateName', () => {
  it('PU-03-01 nombre válido → { valid: true }', () => {
    expect(validateName('Juan Pérez')).toEqual({ valid: true });
  });

  it('PU-03-02 vacío → obligatorio', () => {
    expect(validateName('')).toEqual({ valid: false, error: 'El nombre es obligatorio' });
  });

  it('PU-03-03 corto ("J") → mínimo 2 caracteres', () => {
    expect(validateName('J')).toEqual({
      valid: false,
      error: 'El nombre debe tener al menos 2 caracteres',
    });
  });

  it('PU-03-04 con números ("Juan123") → solo letras', () => {
    expect(validateName('Juan123')).toEqual({
      valid: false,
      error: 'Solo se permiten letras y espacios',
    });
  });
});

// ── PU-04: Validación de nombre de negocio (validateBusinessName) ──
describe('PU-04 · validateBusinessName', () => {
  it('PU-04-01 con números ("Tienda 24") → válido (a diferencia del nombre de persona)', () => {
    expect(validateBusinessName('Tienda 24')).toEqual({ valid: true });
  });

  it('PU-04-02 vacío → obligatorio', () => {
    expect(validateBusinessName('')).toEqual({
      valid: false,
      error: 'El nombre del negocio es obligatorio',
    });
  });

  it('PU-04-03 corto ("A") → mínimo 2 caracteres', () => {
    expect(validateBusinessName('A')).toEqual({
      valid: false,
      error: 'El nombre del negocio debe tener al menos 2 caracteres',
    });
  });
});

// ── PU-05: Validación de teléfono (validatePhone) ──
describe('PU-05 · validatePhone', () => {
  it('PU-05-01 vacío → válido (el teléfono es opcional)', () => {
    expect(validatePhone('')).toEqual({ valid: true });
  });

  it('PU-05-02 número válido ("+507 6123-4567") → válido', () => {
    expect(validatePhone('+507 6123-4567')).toEqual({ valid: true });
  });

  it('PU-05-03 con letras ("abc") → formato inválido', () => {
    expect(validatePhone('abc')).toEqual({
      valid: false,
      error: 'Ingresa un número telefónico válido',
    });
  });
});

// ── PU-06: Medidor de fortaleza de contraseña (getPasswordStrength) ──
describe('PU-06 · getPasswordStrength', () => {
  it('PU-06-01 vacía → débil / 0%', () => {
    expect(getPasswordStrength('')).toEqual({ level: 'débil', percentage: 0 });
  });

  it('PU-06-02 completa ("1234567Ab*") → fuerte / 85%', () => {
    expect(getPasswordStrength('1234567Ab*')).toEqual({ level: 'fuerte', percentage: 85 });
  });

  it('PU-06-03 sin especial ("Abcdefg1") → medio / 65%', () => {
    expect(getPasswordStrength('Abcdefg1')).toEqual({ level: 'medio', percentage: 65 });
  });

  it('PU-06-04 solo minúsculas cortas ("abc") → débil / 15%', () => {
    expect(getPasswordStrength('abc')).toEqual({ level: 'débil', percentage: 15 });
  });
});
