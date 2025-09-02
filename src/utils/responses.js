/**
 * Respuesta exitosa estándar
 * @param {object} res - Response object
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de respuesta
 * @param {any} data - Datos a enviar
 */
export const successResponse = (res, statusCode = 200, message = 'Éxito', data = null) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Respuesta de error estándar
 * @param {object} res - Response object
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de error
 * @param {array} errors - Array de errores detallados
 */
export const errorResponse = (res, statusCode = 500, message = 'Error interno del servidor', errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Respuesta paginada estándar
 * @param {object} res - Response object
 * @param {array} data - Datos paginados
 * @param {number} total - Total de elementos
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @param {string} message - Mensaje de respuesta
 */
export const paginatedResponse = (res, data, total, page, limit, message = 'Datos obtenidos exitosamente') => {
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
};

export default {
    successResponse,
    errorResponse,
    paginatedResponse
};
