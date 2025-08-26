import express from 'express';
import {
    getAllUsers,
    getUserById,
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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints para la gestión de usuarios
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios (solo admin)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *       403:
 *         description: Acceso denegado
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario (solo admin)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Acceso denegado
 */

/**
 * @swagger
 * /users/{id}/update-profile:
 *   patch:
 *     summary: Actualizar el perfil del usuario autenticado
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Acceso denegado
 */

/**
 * @swagger
 * /users/{id}/change-password:
 *   patch:
 *     summary: Cambiar la contraseña del usuario autenticado
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Acceso denegado
 */

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas CRUD para usuarios (solo admin puede ver todos y crear usuarios)
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', requireOwnershipOrAdmin, getUserById);

// Actualización completa (solo admin)
router.put('/:id', requireAdmin, validateUserUpdate, updateUser);

// Actualización limitada para usuarios normales (solo username)
router.patch('/:id/update-profile', authenticateToken, validateUserSelfUpdate, updateUserSelf);

router.delete('/:id', requireAdmin, deleteUser);

// Ruta específica para cambiar contraseña (solo el propio usuario o admin)
router.patch('/:id/change-password', requireOwnershipOrAdmin, validatePasswordChange, changePassword);

export default router;