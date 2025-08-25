import express from 'express';
import {
    register,
    login,
    refreshToken,
    getProfile,
    updateProfile,
    logout
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.js';
import {
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate
} from '../middlewares/validation.js';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh-token', refreshToken);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken); // Aplicar middleware de autenticación a todas las rutas siguientes

router.get('/profile', getProfile);
router.put('/profile', validateUserUpdate, updateProfile);
router.post('/logout', logout);

export default router;
