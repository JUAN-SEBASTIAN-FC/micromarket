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

/**
 * ==========================================
 * ENTERPRISE ERROR HANDLING & VALIDATION ENGINE
 * ==========================================
 */

export interface EnterpriseErrorResponse {
  status: 'fail';
  source: string;
  message: string;
  actionable: boolean;
}

export class EnterpriseValidationError extends Error {
  public source: string;
  public actionable: boolean;

  constructor(source: string, message: string, actionable: boolean = true) {
    super(message);
    this.name = 'EnterpriseValidationError';
    this.source = source;
    this.actionable = actionable;
    // Restaurar prototipo para extensión correcta en ES5/ES6
    Object.setPrototypeOf(this, EnterpriseValidationError.prototype);
  }

  public toJSON(): EnterpriseErrorResponse {
    return {
      status: 'fail',
      source: this.source,
      message: this.message,
      actionable: this.actionable
    };
  }
}

/**
 * Valida los datos para la publicación de una tarea bajo el estándar enterprise (Sin Mock Data).
 */
export const validatePostTaskEnterprise = (
  formData: {
    title: string;
    description: string;
    category: string;
    budget: string;
    deadline: string;
  },
  allowedCategories: string[]
): EnterpriseErrorResponse | null => {
  const titleClean = formData.title.trim();
  const descClean = formData.description.trim();

  // 1. Validar Título
  if (!titleClean) {
    return {
      status: 'fail',
      source: 'Título de la misión',
      message: 'Falta el título de la misión. Por favor, definí un título descriptivo para la tarea.',
      actionable: true
    };
  }
  
  const titleSanitized = sanitizeText(titleClean, 200);
  if (titleSanitized.length < 5) {
    return {
      status: 'fail',
      source: 'Título de la misión',
      message: `El título ingresado ("${titleClean}") es demasiado corto. Debe tener al menos 5 caracteres para ser comprensible.`,
      actionable: true
    };
  }

  // 2. Validar Descripción
  if (!descClean) {
    return {
      status: 'fail',
      source: 'Instrucciones detalladas',
      message: 'Faltan las instrucciones de la misión. Es necesario especificar los requerimientos técnicos para los operadores.',
      actionable: true
    };
  }

  const descSanitized = sanitizeText(descClean, 5000);
  if (descSanitized.length < 20) {
    return {
      status: 'fail',
      source: 'Instrucciones detalladas',
      message: `La descripción provista es insuficiente (longitud real: ${descSanitized.length} caracteres). Escribí al menos 20 caracteres explicando el trabajo.`,
      actionable: true
    };
  }

  // 3. Validar Categoría
  if (!formData.category) {
    return {
      status: 'fail',
      source: 'Categoría',
      message: 'Falta seleccionar la categoría de la misión. Clasificá la tarea para que los operadores calificados puedan encontrarla.',
      actionable: true
    };
  }

  if (!isValidCategory(formData.category, allowedCategories)) {
    return {
      status: 'fail',
      source: 'Categoría',
      message: `La categoría seleccionada ("${formData.category}") no está dentro del catálogo verificado del sistema. Seleccioná una categoría válida.`,
      actionable: true
    };
  }

  // 4. Validar Presupuesto
  if (!formData.budget) {
    return {
      status: 'fail',
      source: 'Recompensa (USD)',
      message: 'Falta el monto de la recompensa. Debes definir un presupuesto en USD para el depósito en Escrow.',
      actionable: true
    };
  }

  if (!isValidBudget(formData.budget)) {
    const budgetNum = parseFloat(formData.budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      return {
        status: 'fail',
        source: 'Recompensa (USD)',
        message: `El presupuesto ingresado ("${formData.budget}") es inválido. Debe ser un número mayor a 0.`,
        actionable: true
      };
    }
    if (budgetNum > 100000) {
      return {
        status: 'fail',
        source: 'Recompensa (USD)',
        message: `El presupuesto de $${budgetNum.toLocaleString()} excede el límite máximo de depósito por misión ($100,000 USD).`,
        actionable: true
      };
    }
  }

  // 5. Validar Plazo Límite
  if (!formData.deadline) {
    return {
      status: 'fail',
      source: 'Plazo Límite',
      message: 'Falta definir la fecha de plazo límite. Los operadores necesitan saber el tiempo máximo de entrega.',
      actionable: true
    };
  }

  if (!isValidDeadline(formData.deadline)) {
    const dateInput = new Date(formData.deadline);
    const now = new Date();
    if (isNaN(dateInput.getTime())) {
      return {
        status: 'fail',
        source: 'Plazo Límite',
        message: `El formato de fecha provisto ("${formData.deadline}") no es válido.`,
        actionable: true
      };
    }
    if (dateInput <= now) {
      return {
        status: 'fail',
        source: 'Plazo Límite',
        message: `El plazo límite seleccionado (${formData.deadline}) ya ha expirado o es menor a una hora a partir de ahora. Elegí una fecha futura.`,
        actionable: true
      };
    }
    // Máximo 2 años en el futuro
    const maxTime = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
    if (dateInput > maxTime) {
      return {
        status: 'fail',
        source: 'Plazo Límite',
        message: `El plazo límite (${formData.deadline}) excede el horizonte máximo de planificación permitido de 2 años.`,
        actionable: true
      };
    }
  }

  return null;
};

/**
 * Valida los datos del perfil del operador bajo el estándar enterprise.
 */
export const validateProfileEnterprise = (
  formData: {
    name: string;
    dni: string;
    phone: string;
    bio: string;
    skills: string[];
    photoUrl?: string;
  }
): EnterpriseErrorResponse | null => {
  // 1. Validar Foto de Perfil
  if (!formData.photoUrl || formData.photoUrl.trim() === '' || formData.photoUrl.includes('ui-avatars.com')) {
    return {
      status: 'fail',
      source: 'Foto de Perfil',
      message: 'Falta la foto de perfil real. Subí un retrato nítido en formato JPG o PNG para completar tu proceso de verificación de identidad.',
      actionable: true
    };
  }

  // 2. Validar Nombre
  const nameClean = formData.name.trim();
  if (!nameClean) {
    return {
      status: 'fail',
      source: 'Nombre Completo',
      message: 'Falta el nombre completo en tu perfil. Introducí tu nombre oficial para la emisión de contratos técnicos.',
      actionable: true
    };
  }

  if (nameClean.length < 3) {
    return {
      status: 'fail',
      source: 'Nombre Completo',
      message: `El nombre ingresado ("${nameClean}") es demasiado corto. Debe poseer al menos 3 caracteres.`,
      actionable: true
    };
  }

  // 3. Validar DNI
  if (!formData.dni) {
    return {
      status: 'fail',
      source: 'Cédula / DNI',
      message: 'Falta la identificación oficial (Cédula / DNI). Es obligatoria para cumplir con las regulaciones Know Your Customer (KYC).',
      actionable: true
    };
  }

  if (!isValidDNI(formData.dni)) {
    return {
      status: 'fail',
      source: 'Cédula / DNI',
      message: `La identificación provista ("${formData.dni}") no cuenta con un formato válido. Debe poseer entre 6 y 12 dígitos y evitar secuencias repetitivas.`,
      actionable: true
    };
  }

  // 4. Validar Teléfono
  if (!formData.phone) {
    return {
      status: 'fail',
      source: 'Teléfono de Contacto',
      message: 'Falta el teléfono de contacto. Es necesario para la coordinación directa ante contingencias críticas.',
      actionable: true
    };
  }

  if (!isValidPhone(formData.phone)) {
    return {
      status: 'fail',
      source: 'Teléfono de Contacto',
      message: `El número de teléfono ("${formData.phone}") es inválido. Verificá que tenga un formato de 7 a 15 dígitos con su respectivo código.`,
      actionable: true
    };
  }

  // 5. Validar Bio
  const bioClean = formData.bio.trim();
  if (!bioClean) {
    return {
      status: 'fail',
      source: 'Biografía Profesional',
      message: 'Falta tu descripción profesional. Escribí una breve biografía sobre tu experiencia técnica para los contratantes.',
      actionable: true
    };
  }

  if (bioClean.length < 15) {
    return {
      status: 'fail',
      source: 'Biografía Profesional',
      message: 'La biografía ingresada es demasiado corta. Escribí al menos 15 caracteres sobre tu trayectoria.',
      actionable: true
    };
  }

  // 6. Validar Destrezas/Habilidades
  const activeSkills = formData.skills.filter(s => s && s.trim());
  if (activeSkills.length === 0) {
    return {
      status: 'fail',
      source: 'Destrezas Técnicas',
      message: 'No has especificado ninguna destreza técnica. Seleccioná o escribe al menos una habilidad para clasificar tu perfil de operador.',
      actionable: true
    };
  }

  return null;
};

/**
 * Envoltorio enterprise seguro para ejecutar operaciones asíncronas,
 * atrapando excepciones del motor y de Firebase Firestore, devolviendo un EnterpriseErrorResponse consistente.
 */
export const executeEnterpriseSafe = async <T>(
  operation: () => Promise<T>,
  contextSource: string
): Promise<{ data: T | null; error: EnterpriseErrorResponse | null }> => {
  try {
    const result = await operation();
    return { data: result, error: null };
  } catch (err: any) {
    console.error(`[Enterprise Validator] Error capturado en: ${contextSource}`, err);

    // Si ya es un error estructurado por nosotros
    if (err instanceof EnterpriseValidationError) {
      return { data: null, error: err.toJSON() };
    }

    // Mapear errores de Firebase Firestore conocidos
    let cleanMessage = err.message || 'Ocurrió un error inesperado al procesar la transacción.';
    let actionable = true;

    if (err.code) {
      switch (err.code) {
        case 'permission-denied':
          cleanMessage = 'Permisos denegados. Tu cuenta de operador no posee las credenciales requeridas para esta acción.';
          actionable = false;
          break;
        case 'unavailable':
          cleanMessage = 'El servicio de datos de red temporalmente no está disponible. Comprobá tu conexión de internet.';
          actionable = true;
          break;
        case 'not-found':
          cleanMessage = 'El recurso solicitado no existe en la base de datos real del sistema.';
          actionable = false;
          break;
        case 'already-exists':
          cleanMessage = 'Conflicto de duplicidad. El registro que intentas crear ya existe en el sistema.';
          actionable = true;
          break;
        case 'unauthenticated':
          cleanMessage = 'Tu sesión ha expirado o es inválida. Iniciá sesión nuevamente para continuar.';
          actionable = true;
          break;
      }
    }

    return {
      data: null,
      error: {
        status: 'fail',
        source: contextSource,
        message: cleanMessage,
        actionable
      }
    };
  }
};

