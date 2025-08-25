/**
 * Middleware de manejo de errores centralizado
 * Debe ser el último middleware en la aplicación
 */
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log del error para debugging
    console.error('Error Stack:', err.stack);
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(error => error.message).join(', ');
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: message
        });
    }

    // Error de duplicado de Mongoose (código 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} ya existe`;
        return res.status(409).json({
            success: false,
            message: 'Recurso duplicado',
            errors: message
        });
    }

    // Error de CastError de Mongoose (ID inválido)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'ID de recurso inválido'
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token JWT inválido'
        });
    }

    // Token expirado
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token JWT expirado'
        });
    }

    // Error de sintaxis JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'JSON inválido en el cuerpo de la petición'
        });
    }

    // Error por defecto
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Maneja errores de rutas no encontradas
 */
export const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

/**
 * Maneja errores asíncronos
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
    errorHandler,
    notFound,
    asyncHandler
};