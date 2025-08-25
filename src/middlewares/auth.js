import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware para verificar JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el usuario aún existe
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no válido'
            });
        }

        req.user = {
            userId: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Middleware para verificar roles específicos
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        const hasRole = roles.some(role => req.user.roles.includes(role));
        
        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos suficientes'
            });
        }

        next();
    };
};

// Middleware específico para administradores
export const requireAdmin = requireRole('admin');

// Middleware para verificar que el usuario puede acceder a sus propios datos
export const requireOwnershipOrAdmin = (req, res, next) => {
    const requestedUserId = req.params.id;
    const currentUserId = req.user.userId.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (currentUserId === requestedUserId || isAdmin) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Solo puedes acceder a tus propios datos'
        });
    }
};

export default {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireOwnershipOrAdmin
};
