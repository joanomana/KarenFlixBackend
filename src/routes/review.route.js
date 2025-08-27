import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { validateCreateReview, validateUpdateReview } from '../middlewares/validation.review.js';
import { createReview, updateReview, deleteReview } from '../controllers/review.controller.js';

const router = express.Router();

// RUTA ÚNICA DE REVIEWS 
router.post('/', authenticateToken, validateCreateReview, createReview);

// Editar reseña propia
router.put('/:id', authenticateToken, validateUpdateReview, updateReview);

// Eliminar reseña propia
router.delete('/:id', authenticateToken, deleteReview);

export default router;