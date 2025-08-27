import express from 'express';
import {
    register,
    login,
    refreshToken,
    getProfile,
    logout
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.js';
import {
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate
} from '../middlewares/validation.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del usuario
 *         username:
 *           type: string
 *           description: Nombre de usuario único
 *           minLength: 3
 *           maxLength: 30
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico único del usuario
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: Rol del usuario en el sistema
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del usuario
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Login exitoso"
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               description: JWT token de acceso
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             refreshToken:
 *               type: string
 *               description: Token para renovar el JWT
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             expiresIn:
 *               type: string
 *               description: Tiempo de expiración del token
 *               example: "7d"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para autenticación y manejo de sesiones
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario único (3-30 caracteres)
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico válido y único
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: Contraseña segura (mín 6 caracteres, debe incluir mayúscula, minúscula y número)
 *                 minLength: 6
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
 *                 example: "MyPassword123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Usuario registrado exitosamente"
 *               data:
 *                 user:
 *                   id: "60d5ecb74b14b84f17c7b8a1"
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                   role: "user"
 *                   createdAt: "2024-08-26T10:30:00.000Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn: "7d"
 *       409:
 *         description: El usuario o email ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "El usuario o email ya existe"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "La contraseña debe contener al menos una minúscula, una mayúscula y un número"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con email y contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "MyPassword123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Login exitoso"
 *               data:
 *                 user:
 *                   id: "60d5ecb74b14b84f17c7b8a1"
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                   role: "user"
 *                   isAdmin: false
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn: "7d"
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Credenciales inválidas"
 *       400:
 *         description: Datos de entrada faltantes o inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Email y password son requeridos"
 */

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Renovar el token de acceso
 *     description: Genera un nuevo token de acceso usando un refresh token válido
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token válido obtenido durante el login o registro
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
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
 *                   example: "Token renovado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Nuevo JWT token de acceso
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       description: Nuevo refresh token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expiresIn:
 *                       type: string
 *                       description: Tiempo de expiración del nuevo token
 *                       example: "7d"
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidToken:
 *                 summary: Token inválido
 *                 value:
 *                   success: false
 *                   message: "Token inválido"
 *               expiredToken:
 *                 summary: Token expirado
 *                 value:
 *                   success: false
 *                   message: "Refresh token expirado"
 *               missingToken:
 *                 summary: Token faltante
 *                 value:
 *                   success: false
 *                   message: "Refresh token requerido"
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     description: Retorna la información del usuario actualmente autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       allOf:
 *                         - $ref: '#/components/schemas/User'
 *                         - type: object
 *                           properties:
 *                             isAdmin:
 *                               type: boolean
 *                               description: Indica si el usuario es administrador
 *                               example: false
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: "60d5ecb74b14b84f17c7b8a1"
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                   role: "user"
 *                   isAdmin: false
 *                   createdAt: "2024-08-26T10:30:00.000Z"
 *                   updatedAt: "2024-08-26T10:30:00.000Z"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token no válido"
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
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Cierra la sesión del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
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
 *                   example: "Logout exitoso"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token no válido"
 */

// Rutas públicas (sin autenticación)
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh-token', refreshToken);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken); // Aplicar middleware de autenticación a todas las rutas siguientes

router.get('/profile', getProfile);


router.post('/logout', logout);

export default router;
