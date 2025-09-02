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

    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('El rol debe ser "user" o "admin"'),

    handleValidationErrors
];

// Validaciones para login
export const validateUserLogin = [
    body('email')
        .trim()
        .notEmpty()
        .isEmail()
        .withMessage('Email válido requerido'),

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

    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),

    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('El rol debe ser "user" o "admin"'),

    handleValidationErrors
];

// Validaciones para actualización de usuario por parte del usuario normal (solo username)
export const validateUserSelfUpdate = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),

    // Middleware personalizado para validar que solo se envíe username
    (req, res, next) => {
        const allowedFields = ['username'];
        const receivedFields = Object.keys(req.body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Campos no permitidos: ${invalidFields.join(', ')}. Solo puedes actualizar: ${allowedFields.join(', ')}`
            });
        }

        next();
    },

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


// Validación para sugerir media
export const validateMediaSuggestion = [
    body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Título requerido (2-200)'),
    body('type').isIn(['movie', 'anime', 'series']).withMessage('type debe ser movie|anime|series'),
    body('description').trim().isLength({ min: 10 }).withMessage('Descripción mínima de 10 caracteres'),
    body('year').isInt({ min: 1880, max: new Date().getFullYear() }).withMessage('Año inválido'),
    body('category').custom(v => {
        if (!v) throw new Error('Categoría requerida');
        if (typeof v === 'string' && v.trim().length > 0) return true; // nombre simple
        if (typeof v === 'object' && (v.name || v._id)) return true; // objeto con name o _id
        throw new Error('Categoría inválida');
    }),
    handleValidationErrors
];

// ===================== Media (Admin) =====================
export const validateMediaCreateAdmin = [
    body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Título requerido (2-200)'),
    body('type').isIn(['movie', 'anime', 'series']).withMessage('type debe ser movie|anime|series'),
    body('description').trim().isLength({ min: 10 }).withMessage('Descripción mínima 10'),
    body('year').isInt({ min: 1880, max: new Date().getFullYear() }).withMessage('Año inválido'),
    body('category').custom((v) => {
        if (typeof v === 'string') return v.trim().length > 0;
        if (v && typeof v === 'object' && v.name) return String(v.name).trim().length > 0;
        throw new Error('category requerida');
    }),
    handleValidationErrors
];

export const validateMediaUpdateAdmin = [
    body('title').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Título (2-200)'),
    body('type').optional().isIn(['movie', 'anime', 'series']).withMessage('type debe ser movie|anime|series'),
    body('description').optional().trim().isLength({ min: 10 }).withMessage('Descripción mínima 10'),
    body('year').optional().isInt({ min: 1880, max: new Date().getFullYear() }).withMessage('Año inválido'),
    body('category').optional().custom((v) => {
        if (typeof v === 'string') return v.trim().length > 0;
        if (v && typeof v === 'object' && v.name) return String(v.name).trim().length > 0;
        throw new Error('category inválida');
    }),
    handleValidationErrors
];
