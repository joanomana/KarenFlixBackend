import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updateUserSelf,
    deleteUser,
    changePassword
} from '../controllers/user.controller.js';
import { 
    authenticateToken, 
    requireAdmin, 
    requireOwnershipOrAdmin 
} from '../middlewares/auth.js';
import {
    validateUserRegistration,
    validateUserUpdate,
    validateUserSelfUpdate,
    validatePasswordChange
} from '../middlewares/validation.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas CRUD para usuarios (solo admin puede ver todos y crear usuarios)
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', requireOwnershipOrAdmin, getUserById);
router.post('/', requireAdmin, validateUserRegistration, createUser);

// Actualización completa (solo admin)
router.put('/:id', requireAdmin, validateUserUpdate, updateUser);

// Actualización limitada para usuarios normales (solo username)
router.patch('/:id/update-profile', authenticateToken, validateUserSelfUpdate, updateUserSelf);

router.delete('/:id', requireAdmin, deleteUser);

// Ruta específica para cambiar contraseña (solo el propio usuario o admin)
router.patch('/:id/change-password', requireOwnershipOrAdmin, validatePasswordChange, changePassword);

export default router;