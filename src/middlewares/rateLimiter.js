import rateLimit from 'express-rate-limit';

// Rate limiter general
export const generalLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // máximo 100 requests por ventana de tiempo
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter más estricto para rutas de autenticación
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 intentos de login por IP cada 15 minutos
    message: {
        success: false,
        message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar requests exitosos
});

// Rate limiter para registro de usuarios (más restrictivo)
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // máximo 5 registros por IP por hora
    message: {
        success: false,
        message: 'Demasiados registros desde esta IP. Intenta de nuevo en 1 hora.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter para cambio de contraseñas
export const passwordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 cambios de contraseña por IP por hora
    message: {
        success: false,
        message: 'Demasiados cambios de contraseña. Intenta de nuevo en 1 hora.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default {
    generalLimiter,
    authLimiter,
    registerLimiter,
    passwordLimiter
};