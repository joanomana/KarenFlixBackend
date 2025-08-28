import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { validateCreateReview,
         validateUpdateReview,
         } from '../middlewares/validation.review.js';
import { 
    createReview,
    updateReview,
    deleteReview,
    reactionReview } from '../controllers/review.controller.js';

const router = express.Router();

// RUTA ÚNICA DE REVIEWS 
router.post('/', authenticateToken, validateCreateReview, createReview);

// Editar reseña propia
router.put('/:id', authenticateToken, validateUpdateReview, updateReview);

// Eliminar reseña propia
router.delete('/:id', authenticateToken, deleteReview);


// Dar like a dislike a una reseña que no sea la del usuario
//PUT /api/v1/reviews/:id/reaction
router.put('/:id/reaction', authenticateToken, reactionReview);


export default router;