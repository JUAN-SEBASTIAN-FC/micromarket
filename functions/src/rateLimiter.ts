/**
 * Módulo de Rate Limiting para Cloud Functions
 * Previene DoS, fuerza bruta y abuso de API
 */

import { Request } from 'firebase-functions/v2/https';

interface RateLimitConfig {
  points: number; // Puntos disponibles
  duration: number; // Duración en segundos
}

interface RateLimiterStats {
  points: number;
  resetTime: number;
}

/**
 * Implementación simple de rate limiter en memoria
 * Para producción, usar Redis o Firebase Realtime Database
 */
class RateLimiter {
  private store: Map<string, RateLimiterStats> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Consume un punto del rate limiter
   * Retorna true si hay puntos disponibles, false si se excedió el límite
   */
  async consume(key: string): Promise<boolean> {
    const now = Date.now() / 1000;
    const record = this.store.get(key);

    if (!record || now >= record.resetTime) {
      // Resetear contador
      this.store.set(key, {
        points: this.config.points - 1,
        resetTime: now + this.config.duration
      });
      return true;
    }

    if (record.points > 0) {
      record.points--;
      return true;
    }

    return false;
  }

  /**
   * Obtiene información de rate limit para un cliente
   */
  getStatus(key: string): { remaining: number; resetIn: number } {
    const now = Date.now() / 1000;
    const record = this.store.get(key);

    if (!record || now >= record.resetTime) {
      return { remaining: this.config.points, resetIn: this.config.duration };
    }

    return {
      remaining: record.points,
      resetIn: Math.ceil(record.resetTime - now)
    };
  }
}

// ✅ Instancias de rate limiters para diferentes endpoints
export const rateLimiters = {
  // Webhook de Stripe: 100 requests por minuto
  stripe: new RateLimiter({ points: 100, duration: 60 }),

  // Generación de contenido con IA: 10 requests por hora
  aiGeneration: new RateLimiter({ points: 10, duration: 3600 }),

  // API genérica: 1000 requests por hora
  api: new RateLimiter({ points: 1000, duration: 3600 }),

  // Login: 5 intentos por 15 minutos
  login: new RateLimiter({ points: 5, duration: 900 }),

  // Registro: 3 registros por hora por IP
  register: new RateLimiter({ points: 3, duration: 3600 })
};

/**
 * Extrae IP del cliente (considerando proxies)
 */
export const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
};

/**
 * Middleware para validar rate limit
 * Retorna true si la solicitud puede proceder
 */
export const checkRateLimit = async (
  req: Request,
  limiterName: keyof typeof rateLimiters
): Promise<{ allowed: boolean; resetIn?: number }> => {
  const clientIP = getClientIP(req);
  const limiter = rateLimiters[limiterName];

  const allowed = await limiter.consume(clientIP);

  if (!allowed) {
    const { resetIn } = limiter.getStatus(clientIP);
    return { allowed: false, resetIn };
  }

  return { allowed: true };
};

/**
 * Devuelve headers de rate limit para incluir en respuestas
 */
export const getRateLimitHeaders = (
  limiterName: keyof typeof rateLimiters,
  clientIP: string
): Record<string, string> => {
  const limiter = rateLimiters[limiterName];
  const { remaining, resetIn } = limiter.getStatus(clientIP);

  return {
    'X-RateLimit-Limit': limiter['config'].points.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': (Date.now() + resetIn * 1000).toString(),
    'Retry-After': resetIn.toString()
  };
};
