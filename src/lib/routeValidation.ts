/**
 * Módulo de validación de rutas internas
 * Previene Open Redirect y CSRF attacks
 * Utiliza whitelist de rutas permitidas
 */

// ✅ WHITELIST de rutas internas permitidas
const ALLOWED_ROUTES = [
  // Rutas públicas
  '/login',
  '/register',
  '/admin-login',
  
  // Rutas autenticadas
  '/explore',
  '/home',
  '/profile',
  '/wallet',
  '/messages',
  '/complete-profile',
  '/upgrade',
  
  // Rutas de tareas
  '/tasks',
  '/post-task',
  '/my-tasks',
  '/active-task',
  
  // Rutas administrativas
  '/admin/metrics',
  '/admin/approvals',
  '/admin/categories',
  '/admin/users'
];

/**
 * Valida que una ruta sea interna y segura
 * Rechaza:
 * - Rutas externas (http://, https://, //)
 * - Rutas con caracteres maliciosos
 * - Rutas no en whitelist
 */
export const isValidInternalRoute = (route: string): boolean => {
  if (!route || typeof route !== 'string') return false;
  
  const routeTrimmed = route.trim();
  
  // Rechazar rutas externas (open redirect)
  if (routeTrimmed.includes('://')) return false;
  if (routeTrimmed.startsWith('//')) return false;
  if (routeTrimmed.toLowerCase().startsWith('javascript:')) return false;
  if (routeTrimmed.toLowerCase().startsWith('data:')) return false;
  
  // Rechazar rutas con caracteres maliciosos
  if (/[<>"'{}\\]/.test(routeTrimmed)) return false;
  
  // Validar que sea una ruta conocida (whitelist)
  // Permitir rutas exactas o rutas con parámetros dinámicos
  const isAllowed = ALLOWED_ROUTES.some(allowed => {
    if (routeTrimmed === allowed) return true;
    // Permitir rutas con parámetros: /tasks/123, /profile/user-id, etc.
    if (routeTrimmed.startsWith(allowed + '/')) return true;
    return false;
  });
  
  return isAllowed;
};

/**
 * Navega de forma segura usando react-router
 * Fallback a /explore si la ruta es inválida
 */
export const safeNavigate = (navigate: any, route: string, fallback: string = '/explore') => {
  try {
    if (isValidInternalRoute(route)) {
      navigate(route);
    } else {
      console.warn(`[Security] Intento de redirección bloqueado: ${route}`);
      navigate(fallback);
    }
  } catch (error) {
    console.error('[Security] Error en navegación segura:', error);
    navigate(fallback);
  }
};

/**
 * Obtiene parámetro de query de forma segura
 * Evita inyecciones en URL
 */
export const getQueryParam = (param: string): string | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(param);
    
    if (!value) return null;
    
    // Sanitizar: rechazar valores sospechosos
    if (value.includes('javascript:') || value.includes('data:')) return null;
    if (/[<>"'{}\\]/.test(value)) return null;
    
    return decodeURIComponent(value);
  } catch (error) {
    return null;
  }
};

/**
 * Valida referrer para proteger contra CSRF
 */
export const isValidReferrer = (): boolean => {
  const referrer = document.referrer;
  if (!referrer) return true; // Si no hay referrer, permitir (navegación directa)
  
  try {
    const referrerUrl = new URL(referrer);
    const currentUrl = new URL(window.location.href);
    
    // Permitir solo si viene del mismo dominio
    return referrerUrl.hostname === currentUrl.hostname;
  } catch (error) {
    return false;
  }
};

/**
 * Construye redirect seguro después de login
 * Usado para redirigir a página anterior o a default
 */
export const buildSafeRedirect = (
  redirectPath?: string,
  defaultPath: string = '/explore'
): string => {
  if (!redirectPath) return defaultPath;
  
  if (isValidInternalRoute(redirectPath)) {
    return redirectPath;
  }
  
  return defaultPath;
};
