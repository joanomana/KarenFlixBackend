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
import { passwordLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaginatedUsers:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Usuarios obtenidos exitosamente"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               description: Total de registros
 *               example: 25
 *             page:
 *               type: number
 *               description: Página actual
 *               example: 1
 *             limit:
 *               type: number
 *               description: Registros por página
 *               example: 10
 *             totalPages:
 *               type: number
 *               description: Total de páginas
 *               example: 3
 *             hasNextPage:
 *               type: boolean
 *               description: Indica si hay página siguiente
 *               example: true
 *             hasPrevPage:
 *               type: boolean
 *               description: Indica si hay página anterior
 *               example: false
 *     UserUpdateRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Nuevo nombre de usuario (opcional)
 *           minLength: 3
 *           maxLength: 30
 *           example: "johndoe_updated"
 *         email:
 *           type: string
 *           format: email
 *           description: Nuevo email (opcional)
 *           example: "john.updated@example.com"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: Nuevo rol (solo admin puede cambiar esto)
 *           example: "user"
 *         password:
 *           type: string
 *           description: Nueva contraseña (solo admin puede cambiar esto)
 *           minLength: 6
 *           example: "NewPassword123"
 *     PasswordChangeRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Contraseña actual del usuario
 *           example: "OldPassword123"
 *         newPassword:
 *           type: string
 *           description: Nueva contraseña (mín 6 caracteres, debe incluir mayúscula, minúscula y número)
 *           minLength: 6
 *           pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
 *           example: "NewPassword123"
 *     UserSelfUpdateRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Nuevo nombre de usuario
 *           minLength: 3
 *           maxLength: 30
 *           example: "johndoe_new"
 */

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
 *     description: Retorna una lista paginada de todos los usuarios registrados. Solo administradores pueden acceder.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de usuarios por página
 *         example: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filtrar por rol
 *         example: "user"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por username o email
 *         example: "john"
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 *             example:
 *               success: true
 *               message: "Usuarios obtenidos exitosamente"
 *               data:
 *                 - id: "60d5ecb74b14b84f17c7b8a1"
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                   role: "user"
 *                   createdAt: "2024-08-26T10:30:00.000Z"
 *                   updatedAt: "2024-08-26T10:30:00.000Z"
 *                 - id: "60d5ecb74b14b84f17c7b8a2"
 *                   username: "janedoe"
 *                   email: "jane@example.com"
 *                   role: "admin"
 *                   createdAt: "2024-08-25T09:15:00.000Z"
 *                   updatedAt: "2024-08-25T09:15:00.000Z"
 *               pagination:
 *                 total: 25
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 3
 *                 hasNextPage: true
 *                 hasPrevPage: false
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token no válido"
 *       403:
 *         description: Acceso denegado - Solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Acceso denegado. Se requieren permisos de administrador"
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Retorna los datos de un usuario específico. Los usuarios solo pueden ver su propio perfil, los administradores pueden ver cualquier perfil.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               data:
 *                 id: "60d5ecb74b14b84f17c7b8a1"
 *                 username: "johndoe"
 *                 email: "john@example.com"
 *                 role: "user"
 *                 createdAt: "2024-08-26T10:30:00.000Z"
 *                 updatedAt: "2024-08-26T10:30:00.000Z"
 *       400:
 *         description: ID de usuario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "ID de usuario inválido"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token no válido"
 *       403:
 *         description: Acceso denegado - Solo el propietario o admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Solo puedes acceder a tu propio perfil"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Usuario no encontrado"
 *   put:
 *     summary: Actualizar un usuario (solo admin)
 *     description: Permite a un administrador actualizar cualquier campo de un usuario, incluyendo role y password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *           examples:
 *             updateBasicInfo:
 *               summary: Actualizar información básica
 *               value:
 *                 username: "johndoe_updated"
 *                 email: "john.updated@example.com"
 *             updateRole:
 *               summary: Cambiar rol del usuario
 *               value:
 *                 role: "admin"
 *             updateAll:
 *               summary: Actualización completa
 *               value:
 *                 username: "johndoe_admin"
 *                 email: "john.admin@example.com"
 *                 role: "admin"
 *                 password: "NewAdminPassword123"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Usuario actualizado exitosamente"
 *               data:
 *                 id: "60d5ecb74b14b84f17c7b8a1"
 *                 username: "johndoe_updated"
 *                 email: "john.updated@example.com"
 *                 role: "user"
 *                 createdAt: "2024-08-26T10:30:00.000Z"
 *                 updatedAt: "2024-08-26T15:45:00.000Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "El nombre de usuario debe tener entre 3 y 30 caracteres"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token no válido"
 *       403:
 *         description: Acceso denegado - Solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Acceso denegado. Se requieren permisos de administrador"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Usuario no encontrado"
 *       409:
 *         description: Conflicto - Username o email ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "El usuario o email ya existe"
 *   delete:
 *     summary: Eliminar un usuario (solo admin)
 *     description: Permite a un administrador eliminar un usuario del sistema permanentemente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario a eliminar
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *       400:
 *         description: ID de usuario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "ID de usuario inválido"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token no válido"
 *       403:
 *         description: Acceso denegado - Solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Acceso denegado. Se requieren permisos de administrador"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Usuario no encontrado"
 */

/**
 * @swagger
 * /users/{id}/update-profile:
 *   patch:
 *     summary: Actualizar el perfil del usuario autenticado
 *     description: Permite al usuario actualizar su propio perfil (solo username). Solo el propietario puede actualizar su perfil.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario (debe ser el mismo que el usuario autenticado)
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSelfUpdateRequest'
 *           example:
 *             username: "johndoe_new"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Datos actualizados exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Datos actualizados exitosamente"
 *               data:
 *                 id: "60d5ecb74b14b84f17c7b8a1"
 *                 username: "johndoe_new"
 *                 email: "john@example.com"
 *                 role: "user"
 *                 createdAt: "2024-08-26T10:30:00.000Z"
 *                 updatedAt: "2024-08-26T16:20:00.000Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 summary: ID inválido
 *                 value:
 *                   success: false
 *                   message: "ID de usuario inválido"
 *               noFields:
 *                 summary: No hay campos para actualizar
 *                 value:
 *                   success: false
 *                   message: "No hay campos válidos para actualizar"
 *               invalidUsername:
 *                 summary: Username inválido
 *                 value:
 *                   success: false
 *                   message: "El nombre de usuario debe tener entre 3 y 30 caracteres"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token no válido"
 *       403:
 *         description: Acceso denegado - Solo el propietario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Solo puedes editar tus propios datos"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Usuario no encontrado"
 *       409:
 *         description: Conflicto - Username ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "El nombre de usuario ya existe"
 */

/**
 * @swagger
 * /users/{id}/change-password:
 *   patch:
 *     summary: Cambiar la contraseña del usuario
 *     description: Permite cambiar la contraseña del usuario. El usuario solo puede cambiar su propia contraseña, los administradores pueden cambiar la contraseña de cualquier usuario.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordChangeRequest'
 *           example:
 *             currentPassword: "OldPassword123"
 *             newPassword: "NewPassword123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 summary: ID inválido
 *                 value:
 *                   success: false
 *                   message: "ID de usuario inválido"
 *               missingCurrentPassword:
 *                 summary: Contraseña actual faltante
 *                 value:
 *                   success: false
 *                   message: "La contraseña actual es requerida"
 *               wrongCurrentPassword:
 *                 summary: Contraseña actual incorrecta
 *                 value:
 *                   success: false
 *                   message: "La contraseña actual es incorrecta"
 *               invalidNewPassword:
 *                 summary: Nueva contraseña inválida
 *                 value:
 *                   success: false
 *                   message: "La contraseña debe contener al menos una minúscula, una mayúscula y un número"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token no válido"
 *       403:
 *         description: Acceso denegado - Solo el propietario o admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Solo puedes cambiar tu propia contraseña"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Usuario no encontrado"
 */

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios (solo admin)
 *     description: Retorna una lista paginada de todos los usuarios registrados. Solo administradores pueden acceder.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de usuarios por página
 *         example: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filtrar por rol
 *         example: "user"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por username o email
 *         example: "john"
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuarios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', requireAdmin, getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Retorna los datos de un usuario específico. Los usuarios solo pueden ver su propio perfil, los administradores pueden ver cualquier perfil.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', requireOwnershipOrAdmin, getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario (solo admin)
 *     description: Permite a un administrador actualizar cualquier campo de un usuario, incluyendo role y password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "nuevo_usuario"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevo@email.com"
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "NewAdminPassword123"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', requireAdmin, validateUserUpdate, updateUser);

/**
 * @swagger
 * /users/{id}/update-profile:
 *   patch:
 *     summary: Actualizar el perfil del usuario autenticado
 *     description: Permite a un usuario editar su propio username.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "nuevo_nombre_usuario"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Perfil actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/update-profile', authenticateToken, validateUserSelfUpdate, updateUserSelf);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (solo admin)
 *     description: Permite a un administrador eliminar un usuario por su ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', requireAdmin, deleteUser);

/**
 * @swagger
 * /users/{id}/change-password:
 *   patch:
 *     summary: Cambiar contraseña (usuario o admin)
 *     description: Permite a un usuario cambiar su propia contraseña, o a un admin cambiar la de cualquier usuario.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID válido de MongoDB del usuario
 *         example: "60d5ecb74b14b84f17c7b8a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "OldPassword123"
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/change-password', passwordLimiter, requireOwnershipOrAdmin, validatePasswordChange, changePassword);

export default router;