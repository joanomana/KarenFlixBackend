import { body, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next();
};

// Validaciones para registro de usuario
export const validateUserRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    
    body('roles')
        .optional()
        .isArray()
        .withMessage('Los roles deben ser un array')
        .custom((roles) => {
            const validRoles = ['user', 'admin'];
            const invalid = roles.some(role => !validRoles.includes(role));
            if (invalid) {
                throw new Error('Roles inválidos');
            }
            return true;
        }),
    
    handleValidationErrors
];

// Validaciones para login
export const validateUserLogin = [
    body('identifier')
        .trim()
        .notEmpty()
        .withMessage('Email o nombre de usuario requerido'),
    
    body('password')
        .notEmpty()
        .withMessage('Contraseña requerida'),
    
    handleValidationErrors
];

// Validaciones para actualización de usuario
export const validateUserUpdate = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    
    body('roles')
        .optional()
        .isArray()
        .withMessage('Los roles deben ser un array')
        .custom((roles) => {
            const validRoles = ['user', 'admin'];
            const invalid = roles.some(role => !validRoles.includes(role));
            if (invalid) {
                throw new Error('Roles inválidos');
            }
            return true;
        }),
    
    handleValidationErrors
];

// Validaciones para cambio de contraseña
export const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Contraseña actual requerida'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    
    handleValidationErrors
];

// Validaciones para parámetros de ID
export const validateIdParam = [
    body('id')
        .optional()
        .isMongoId()
        .withMessage('ID inválido'),
    
    handleValidationErrors
];

export default {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate,
    validatePasswordChange,
    validateIdParam
};
