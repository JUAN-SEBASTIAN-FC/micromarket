/**
 * CONFIGURACIÓN DE SEGURIDAD - MICROMARKET
 * 
 * Este archivo documenta todas las medidas de seguridad implementadas
 * y proporciona referencias para auditorías futuras.
 * 
 * Última actualización: 2 de mayo de 2026
 */

// ============================================================================
// 1. VALIDACIÓN Y SANITIZACIÓN
// ============================================================================

✅ INPUT VALIDATION
   - Email: RFC 5322 simplificado + validación adicional
   - Contraseña: Mínimo 8 caracteres, mayúscula, número
   - DNI: 6-12 dígitos, rechaza secuencias obvias
   - Teléfono: 7-15 dígitos internacionales
   - Texto: Sanitización contra XSS y NoSQL injection
   - Presupuesto: $1 - $100,000
   - Deadline: Futuro, máximo 2 años
   - Archivos: Tipo y tamaño validados

Archivo: src/lib/validation.ts

// ============================================================================
// 2. PROTECCIÓN CONTRA ATAQUES COMUNES
// ============================================================================

✅ XSS (Cross-Site Scripting)
   - CSP (Content-Security-Policy) header habilitado
   - Sanitización de inputs en formularios
   - Validación de URLs internas (whitelist)
   - Encriptación de datos sensibles

✅ CSRF (Cross-Site Request Forgery)
   - CORS restringido a dominios conocidos
   - Validación de referrer en operaciones sensibles
   - Tokens CSRF en formularios (Firebase Auth maneja esto)

✅ Open Redirect
   - Whitelist de rutas internas permitidas
   - Rechazo de URLs externas en redirects
   - Validación de parámetros de query

✅ SQL/NoSQL Injection
   - Firestore usa queries parametrizadas (no concatenación)
   - Sanitización de inputs (remueve $, {, })
   - Validación estricta de tipos

✅ Rate Limiting
   - Stripe webhook: 100 req/min
   - IA Generation: 10 req/hora
   - API genérica: 1000 req/hora
   - Login: 5 intentos/15 min

Archivo: functions/src/rateLimiter.ts

// ============================================================================
// 3. AUTENTICACIÓN Y AUTORIZACIÓN
// ============================================================================

✅ AUTENTICACIÓN
   - Firebase Auth con email/contraseña
   - Google OAuth 2.0
   - Verificación de email
   - Recuperación de contraseña segura
   - Mensajes de error genéricos (no revelan usuarios)

✅ AUTORIZACIÓN
   - Control basado en roles (user, admin)
   - Estados de usuario (incomplete, pending, approved)
   - Firestore Security Rules validan cada lectura/escritura
   - Admin panel protegido con clave maestra en backend

✅ TOKENS Y SESIONES
   - Firebase ID Token (JWT) para autenticación
   - Tokens de actualización seguros
   - Sesiones sin estado (stateless)

Archivo: src/contexts/AuthContext.tsx

// ============================================================================
// 4. GESTIÓN DE SECRETOS
// ============================================================================

✅ SECRETOS BACKEND (PROTEGIDO)
   - STRIPE_SECRET_KEY: Cloud Function
   - STRIPE_WEBHOOK_SECRET: Cloud Function
   - GEMINI_API_KEY: Cloud Function
   - ADMIN_MASTER_KEY: Cloud Function (NO en cliente)
   - DATABASE_ENCRYPTION_KEY: Cloud Function

❌ SECRETOS EN CLIENTE (REMOVIDOS)
   - NO más VITE_GEMINI_API_KEY en bundle
   - NO más VITE_ADMIN_MASTER_KEY en bundle
   - Todas las claves críticas se invocan via API segura

Archivo: functions/.env.local (nunca comitear)

// ============================================================================
// 5. FIRESTORE SECURITY RULES
// ============================================================================

✅ REGLAS IMPLEMENTADAS
   - /users: Solo lectura propia o admin
   - /tasks: Solo lectura para usuarios aprobados
   - /chats: Solo para participantes o admin
   - /notifications: Solo para el usuario
   - Prevención de cambios en authorId
   - Validación de reward > 0
   - Validación de deadline != null

Archivo: firestore.rules

// ============================================================================
// 6. HEADERS DE SEGURIDAD
// ============================================================================

✅ HEADERS HTTP IMPLEMENTADOS
   - X-Content-Type-Options: nosniff (previene MIME sniffing)
   - X-Frame-Options: DENY (previene clickjacking)
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: geolocation=(), microphone=(), camera=()
   - Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   - Content-Security-Policy: configurado con whitelist de recursos

Archivo: firebase.json

// ============================================================================
// 7. CONFIGURACIÓN CORS
// ============================================================================

✅ CORS RESTRINGIDO A
   - https://tudominio.com
   - https://www.tudominio.com
   - http://localhost:3000 (desarrollo)

❌ REMOVIDO
   - Origin: ["*"] (wildcard abierto)
   - PATCH, TRACE methods

Archivo: cors.json

// ============================================================================
// 8. VALIDACIÓN DE RUTAS
// ============================================================================

✅ WHITELIST DE RUTAS PERMITIDAS
   - /login, /register, /admin-login
   - /explore, /home, /profile, /wallet, /messages
   - /complete-profile, /upgrade
   - /tasks, /post-task, /my-tasks, /active-task
   - /admin/* (solo para admins)

❌ RECHAZADAS
   - Rutas con http://, https://
   - Rutas con javascript:, data:
   - Rutas con caracteres maliciosos (<, >, ", ', {, }, \)

Archivo: src/lib/routeValidation.ts

// ============================================================================
// 9. VALIDACIÓN Y SANEAMIENTO EN FORMULARIOS
// ============================================================================

✅ LOGIN
   - Email válido
   - Contraseña no vacía
   - Mensajes genéricos de error

✅ REGISTRO
   - Email RFC 5322
   - Contraseña: 8+ caracteres, mayúscula, número
   - Nombre: 3-100 caracteres
   - Rechaza espacios múltiples

✅ PERFIL COMPLETO
   - DNI: 6-12 dígitos
   - Teléfono: 7-15 dígitos
   - Bio: máximo 500 caracteres
   - Archivos: validación tipo y tamaño

✅ CREACIÓN DE TAREAS
   - Título: 5-200 caracteres
   - Descripción: 20-5000 caracteres
   - Presupuesto: $1-$100,000
   - Deadline: futuro, máximo 2 años
   - Categoría: whitelist validada

Archivos:
   - src/pages/Login.tsx
   - src/pages/Register.tsx
   - src/pages/CompleteProfile.tsx
   - src/pages/PostTask.tsx

// ============================================================================
// 10. MANEJO SEGURO DE ARCHIVOS
// ============================================================================

✅ VALIDACIÓN DE ARCHIVOS
   - Tipos permitidos: image/jpeg, image/png, application/pdf
   - Tamaño máximo: 150KB (fotos), 300KB (documentos)
   - Compresión agresiva para reducir tamaño
   - Validación de tipo MIME

⚠️  NOTA: Usar Firebase Storage en producción (mejor que Base64)

Archivo: src/services/storage.ts

// ============================================================================
// 11. WEBHOOK DE STRIPE SEGURO
// ============================================================================

✅ VALIDACIÓN DE WEBHOOK
   - Verificación obligatoria de firma
   - Rate limiting habilitado
   - Validación de evento type
   - Sanitización de client_reference_id
   - Manejo de errores seguro

Archivo: functions/src/index.ts

// ============================================================================
// 12. LOGS Y MONITOREO
// ============================================================================

✅ LOGGING HABILITADO
   - Errores de autenticación
   - Cambios de estado de usuario
   - Operaciones administrativas
   - Intentos bloqueados por rate limit
   - Validaciones fallidas

Herramientas:
   - Firebase Firestore Audit Logs
   - Firebase Cloud Functions Logs
   - Console.log en funciones backend

// ============================================================================
// 13. DEPENDENCIAS AUDITADAS
// ============================================================================

Comandos para ejecutar auditoría:
   npm audit
   npm audit --production
   npm audit fix (solo si es seguro)
   
Para instalación de dependencias con seguridad:
   npm ci (en CI/CD en lugar de npm install)

// ============================================================================
// 14. PRÓXIMOS PASOS RECOMENDADOS
// ============================================================================

CORTO PLAZO (1-2 semanas):
   ✅ Implementar todos los cambios de este documento
   ✅ Testing manual de flujos de seguridad
   ✅ Ejecutar npm audit
   ✅ Verificar headers HTTP con curl

MEDIANO PLAZO (1 mes):
   🔄 Implementar autenticación de 2 factores (2FA)
   🔄 Cifrado end-to-end en chat
   🔄 Migrar de Base64 a Firebase Storage
   🔄 Implementar SIEM básico (logs centralizados)

LARGO PLAZO (3+ meses):
   🔄 Penetration testing profesional
   🔄 OWASP ZAP o SonarQube automated testing
   🔄 Certificado SSL/TLS (debe ser A+ en ssllabs.com)
   🔄 Bug bounty program
   🔄 Cumplimiento GDPR/CCPA

// ============================================================================
// 15. CHECKLIST DE VERIFICACIÓN PRE-PRODUCCIÓN
// ============================================================================

AUTENTICACIÓN:
   ☑️  Firebase Auth habilitado
   ☑️  Email verification obligatorio
   ☑️  Password reset funciona
   ☑️  Google OAuth funciona
   ☑️  Rate limiting en login

AUTORIZACIÓN:
   ☑️  Firestore rules en producción
   ☑️  Admin panel solo para admins
   ☑️  Users no pueden modificar otros perfiles
   ☑️  Tasks solo puede editar autor o admin

DATOS SENSIBLES:
   ☑️  DNI/documentos encriptados en tránsito
   ☑️  HTTPS habilitado en todos lados
   ☑️  Secrets NO en .env de cliente
   ☑️  API keys rotadas

HEADERS DE SEGURIDAD:
   ☑️  Content-Security-Policy activo
   ☑️  X-Frame-Options: DENY
   ☑️  HSTS header presente
   ☑️  CORS restringido

VALIDACIÓN:
   ☑️  Email validation funciona
   ☑️  Contraseña fuerte requerida
   ☑️  Mensajes de error genéricos
   ☑️  Rate limiting funciona

TESTING:
   ☑️  npm audit sin críticos
   ☑️  OWASP ZAP no reporta issues
   ☑️  Pruebas de inyección fallidas
   ☑️  Pruebas de XSS fallidas

// ============================================================================
// CONTACTO Y REPORTES DE SEGURIDAD
// ============================================================================

Si encuentras una vulnerabilidad:
   1. NO la publiques públicamente
   2. Envía a: security@tudominio.com
   3. Describe cómo reproducirla
   4. Nos comprometemos a responder en 48 horas

Programa de responsabilidad divulgada (Coordinated Disclosure):
   - Plazo para patch: 90 días
   - Crédito público para reportero
   - Posible programa de bug bounty

// ============================================================================
