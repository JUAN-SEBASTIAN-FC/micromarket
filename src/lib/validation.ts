/**
 * Módulo de validación centralizado
 * Sanitización y validación de inputs contra:
 * - XSS (inyección de scripts)
 * - NoSQL Injection (inyección de objetos)
 * - Malformed inputs
 */

/**
 * Sanitiza texto removiendo caracteres peligrosos y limitando longitud
 * Previene XSS y NoSQL injection
 */
export const sanitizeText = (text: string, maxLength: number = 500): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .slice(0, maxLength)
    // Remover caracteres HTML/XML peligrosos
    .replace(/[<>]/g, '')
    // Remover operadores NoSQL: $, {, }
    .replace(/[\$\{\}]/g, '')
    // Normalizar espacios múltiples
    .replace(/\s+/g, ' ');
};

/**
 * Valida formato de email (RFC 5322 simplificado)
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const email_normalized = email.trim().toLowerCase();
  
  // Regex RFC 5322 simplificado
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email_normalized)) return false;
  
  // Rechazar patrones claramente inválidos
  if (email_normalized.includes('..')) return false;
  if (email_normalized.startsWith('.') || email_normalized.endsWith('.')) return false;
  if (email_normalized.startsWith('@') || email_normalized.endsWith('@')) return false;
  
  // RFC 5321: máximo 254 caracteres
  if (email_normalized.length > 254) return false;
  
  // Validar longitud de dominio (máximo 255 caracteres)
  const domain = email_normalized.split('@')[1];
  if (domain && domain.length > 255) return false;
  
  return true;
};

/**
 * Valida fecha de deadline
 * - Debe ser en el futuro
 * - No más de 2 años adelante
 */
export const isValidDeadline = (deadline: string | Date): boolean => {
  try {
    const date = deadline instanceof Date ? deadline : new Date(deadline);
    const now = new Date();
    
    // Validar que sea fecha válida
    if (isNaN(date.getTime())) return false;
    
    // Debe ser en el futuro (al menos 1 hora)
    const minTime = new Date(now.getTime() + 60 * 60 * 1000);
    if (date <= minTime) return false;
    
    // Máximo 2 años en el futuro
    const maxTime = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
    if (date > maxTime) return false;
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Valida presupuesto de tarea
 * - Mínimo: $1
 * - Máximo: $100,000
 */
export const isValidBudget = (budget: any): boolean => {
  try {
    const amount = typeof budget === 'string' ? parseFloat(budget) : budget;
    
    if (isNaN(amount)) return false;
    if (!Number.isFinite(amount)) return false;
    if (amount <= 0) return false;
    if (amount > 100000) return false;
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Valida DNI/Cédula
 * Acepta 6-12 dígitos (flexible para diferentes países)
 * - Ecuador: 10 dígitos
 * - Colombia: 8-12 dígitos
 * - Perú: 8 dígitos
 */
export const isValidDNI = (dni: string): boolean => {
  if (!dni || typeof dni !== 'string') return false;
  
  // Extraer solo dígitos
  const clean = dni.trim().replace(/\D/g, '');
  
  // Aceptar 6-12 dígitos
  if (clean.length < 6 || clean.length > 12) return false;
  
  // Validar que sea solo números
  if (!/^\d{6,12}$/.test(clean)) return false;
  
  // Rechazar secuencias obvias (ej: 111111)
  if (/^(\d)\1{5,}$/.test(clean)) return false;
  
  return true;
};

/**
 * Valida número de teléfono
 * Aceptar 7-15 dígitos (formato internacional)
 * - Incluye códigos de país, área y número
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Extraer solo dígitos
  const clean = phone.trim().replace(/\D/g, '');
  
  // Teléfono: 7-15 dígitos (internacional)
  if (clean.length < 7 || clean.length > 15) return false;
  
  // Validar que sea solo números
  if (!/^\d{7,15}$/.test(clean)) return false;
  
  // Rechazar secuencias obvias
  if (/^(\d)\1{6,}$/.test(clean)) return false;
  
  return true;
};

/**
 * Valida fortaleza de contraseña
 * Requerimientos:
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 número
 * - Al menos 1 carácter especial (opcional pero recomendado)
 */
export const isStrongPassword = (password: string): { valid: boolean; message: string } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Contraseña requerida' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Mínimo 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Debe incluir al menos una mayúscula' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Debe incluir al menos un número' };
  }
  
  // Opcional: validar caracteres especiales
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
  //   return { valid: false, message: 'Debe incluir caracteres especiales' };
  // }
  
  return { valid: true, message: 'Contraseña válida' };
};

/**
 * Valida categoría (lista blanca)
 */
export const isValidCategory = (category: string, allowedCategories: string[]): boolean => {
  if (!category || typeof category !== 'string') return false;
  return allowedCategories.some(cat => cat.toLowerCase() === category.toLowerCase());
};

/**
 * Valida urgencia de tarea
 */
export const isValidUrgency = (urgency: string): boolean => {
  const validUrgencies = ['Bajo', 'Estándar', 'Alto', 'Crítico'];
  return validUrgencies.includes(urgency);
};

/**
 * Valida estado de tarea
 */
export const isValidTaskStatus = (status: string): boolean => {
  const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
  return validStatuses.includes(status);
};

/**
 * Valida rol de usuario
 */
export const isValidRole = (role: string): boolean => {
  return role === 'user' || role === 'admin';
};

/**
 * Valida estado de usuario
 */
export const isValidUserStatus = (status: string): boolean => {
  return ['incomplete', 'pending', 'approved'].includes(status);
};

/**
 * Valida archivo - tipo y tamaño
 */
export const isValidFile = (
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSizeKB: number = 300
): { valid: boolean; message: string } => {
  if (!file) {
    return { valid: false, message: 'Archivo requerido' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: `Tipo no permitido. Acepta: ${allowedTypes.join(', ')}` };
  }
  
  const fileSizeKB = file.size / 1024;
  if (fileSizeKB > maxSizeKB) {
    return { valid: false, message: `Archivo muy grande (máx ${maxSizeKB}KB)` };
  }
  
  return { valid: true, message: 'Archivo válido' };
};
