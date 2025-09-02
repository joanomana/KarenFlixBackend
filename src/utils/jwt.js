import jwt from 'jsonwebtoken';

/**
 * Genera un token JWT
 * @param {string} userId - ID del usuario
 * @param {string} type - Tipo de token ('access' o 'refresh')
 * @returns {string} Token JWT
 */
export const generateToken = (userId, type = 'access') => {
    const secret = type === 'refresh' 
        ? process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        : process.env.JWT_SECRET;
    
    const expiresIn = type === 'refresh'
        ? process.env.JWT_REFRESH_EXPIRES_IN || '30d'
        : process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(
        { userId, type },
        secret,
        { 
            expiresIn,
            issuer: 'KarenFlix-API',
            audience: 'KarenFlix-Users'
        }
    );
};

/**
 * Verifica un token JWT
 * @param {string} token - Token a verificar
 * @param {string} type - Tipo de token esperado
 * @returns {object} Payload del token decodificado
 */
export const verifyToken = (token, type = 'access') => {
    const secret = type === 'refresh'
        ? process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        : process.env.JWT_SECRET;

    return jwt.verify(token, secret);
};

/**
 * Extrae el token del header Authorization
 * @param {object} req - Request object
 * @returns {string|null} Token extraído o null
 */
export const extractToken = (req) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};

export default {
    generateToken,
    verifyToken,
    extractToken
};
